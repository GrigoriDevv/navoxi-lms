"use client";

import { useCallback, useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import { useAuthScope } from "@/lib/use-auth-scope";
import {
  computeMetrics,
  defaultDashboardFilters,
  formatDateTime,
  getFilterOptions,
  type DashboardFilters,
} from "@/lib/dashboard-metrics";

type Tab = "dashboard" | "equipe";
type WidgetStatus = "ready" | "loading" | "error" | "empty";

export function useDashboardPage() {
  const { auditLogs, currentUser, settings } = useApp();
  const {
    courses,
    turmas,
    users,
    role,
    unitId,
    unitLabel,
    isGlobal,
    solicitacoes,
    can,
  } = useAuthScope();

  const [tab, setTab] = useState<Tab>("dashboard");
  const [filters, setFilters] = useState<DashboardFilters>(() =>
    defaultDashboardFilters(isGlobal ? undefined : unitId)
  );
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string>(() =>
    formatDateTime(new Date())
  );
  const [dataCollectedUntil, setDataCollectedUntil] = useState<string>(() =>
    formatDateTime(new Date())
  );
  const [widgetStatus, setWidgetStatus] = useState<WidgetStatus>("ready");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [simulateError, setSimulateError] = useState(false);

  const filterOptions = useMemo(() => getFilterOptions(courses), [courses]);

  const metrics = useMemo(
    () => computeMetrics(courses, users, filters),
    [courses, users, filters]
  );

  const hasData = metrics.filteredCourseCount > 0 || metrics.totalAccesses > 0;
  const effectiveStatus: WidgetStatus =
    widgetStatus === "ready" && !hasData ? "empty" : widgetStatus;

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    setWidgetStatus("loading");
    await new Promise((r) => setTimeout(r, 900));

    if (simulateError) {
      setWidgetStatus("error");
      setIsRefreshing(false);
      return;
    }

    const now = new Date();
    setLastUpdatedAt(formatDateTime(now));
    setDataCollectedUntil(
      formatDateTime(new Date(now.getTime() - 15 * 60 * 1000))
    );
    setWidgetStatus("ready");
    setIsRefreshing(false);
  }, [simulateError]);

  const handleUnitFilter = (f: DashboardFilters) => {
    if (!isGlobal && unitId) {
      setFilters({ ...f, unitId });
    } else {
      setFilters(f);
    }
  };

  const adminKpis = useMemo(
    () => ({
      openTurmas: turmas.filter((t) => t.status !== "concluida").length,
      pendingSolicitacoes: solicitacoes.filter((s) => s.status === "pendente")
        .length,
      publishedCourses: courses.filter((c) => c.status === "publicado").length,
    }),
    [turmas, solicitacoes, courses]
  );

  const showAdminKpis =
    can("manage_users_all") || can("manage_users_unit");

  return {
    auditLogs,
    currentUser,
    settings,
    courses,
    turmas,
    users,
    role,
    unitId,
    unitLabel,
    isGlobal,
    can,
    tab,
    setTab,
    filters,
    filterOptions,
    metrics,
    hasData,
    effectiveStatus,
    lastUpdatedAt,
    dataCollectedUntil,
    isRefreshing,
    simulateError,
    setSimulateError,
    refresh,
    handleUnitFilter,
    adminKpis,
    showAdminKpis,
  };
}
