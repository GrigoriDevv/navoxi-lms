"use client";

import { useCallback, useEffect, useState } from "react";
import { isJavaApiEnabled } from "../api-config";
import {
  usePermissions,
  useScheduledJobs,
  useUpdatePermission,
  useUpdateScheduledJob,
} from "../lms";
import * as seed from "../mock-data";
import type {
  AuditLog,
  Integration,
  Permission,
  Role,
  ScheduledJob,
  Settings,
  User,
} from "../types";
import { hasPermission } from "../rbac";
import { applyBrandColor } from "../platform-config";
import type { AppState, AuthState } from "./types";
import { avatarColors, now } from "./shared";

type LogFn = AppState["log"];

export function useAdminStore(currentUser: AuthState | null) {
  const javaApi = isJavaApiEnabled();

  const permissionsQuery = usePermissions({ enabled: javaApi });
  const scheduledJobsQuery = useScheduledJobs({ enabled: javaApi });
  const updatePermissionMutation = useUpdatePermission();
  const updateScheduledJobMutation = useUpdateScheduledJob();

  const [users, setUsers] = useState<User[]>(seed.users);
  // MOCK: not wired to backend
  const [integrations, setIntegrations] = useState<Integration[]>(
    seed.integrations
  );
  const [mockPermissions, setMockPermissions] = useState<Permission[]>(
    seed.permissions
  );
  const [mockScheduledJobs, setMockScheduledJobs] = useState<ScheduledJob[]>(
    seed.scheduledJobs
  );
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(seed.auditLogs);
  const [settings, setSettings] = useState<Settings>(seed.settings);

  const permissions = javaApi
    ? (permissionsQuery.data ?? seed.permissions)
    : mockPermissions;
  const scheduledJobs = javaApi
    ? (scheduledJobsQuery.data ?? seed.scheduledJobs)
    : mockScheduledJobs;

  const log: LogFn = useCallback((entry) => {
    setAuditLogs((prev) => [
      {
        ...entry,
        id: "l" + Math.random().toString(36).slice(2, 8),
        timestamp: now(),
        ip: "10.2.31.5",
      },
      ...prev,
    ]);
  }, []);

  useEffect(() => {
    applyBrandColor(settings.brandColor);
  }, [settings.brandColor]);

  const addUser: AppState["addUser"] = useCallback(
    (u) => {
      const id = "u" + Math.random().toString(36).slice(2, 7);
      const scopedUnit =
        currentUser &&
        hasPermission(currentUser.role, "manage_users_unit") &&
        !hasPermission(currentUser.role, "manage_users_all")
          ? currentUser.unitId
          : u.unitId;
      setUsers((prev) => [
        {
          ...u,
          unitId: scopedUnit,
          id,
          avatarColor: avatarColors[prev.length % avatarColors.length],
          lastAccess: "—",
        },
        ...prev,
      ]);
      log({
        user: currentUser?.email ?? "system",
        action: `Criou usuário '${u.name}'`,
        module: "Administração",
        severity: "alerta",
      });
    },
    [currentUser, log]
  );

  const toggleUserStatus: AppState["toggleUserStatus"] = useCallback((id) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === "ativo" ? "bloqueado" : "ativo" }
          : u
      )
    );
  }, []);

  const updateIntegration: AppState["updateIntegration"] = useCallback(
    (id, data) => {
      setIntegrations((prev) =>
        prev.map((i) => (i.id === id ? { ...i, ...data } : i))
      );
      log({
        user: currentUser?.email ?? "system",
        action: `Atualizou integração '${id}'`,
        module: "Integrações",
        severity: "info",
      });
    },
    [currentUser, log]
  );

  const togglePermissionRole: AppState["togglePermissionRole"] = useCallback(
    (permId, role: Role) => {
      const current = permissions.find((p) => p.id === permId);
      if (!current) return;

      const roles = current.roles.includes(role)
        ? current.roles.filter((r) => r !== role)
        : [...current.roles, role];

      if (javaApi) {
        void updatePermissionMutation
          .mutateAsync({ id: permId, body: { roles } })
          .then(() => {
            log({
              user: currentUser?.email ?? "system",
              action: `Alterou permissão '${permId}' · ${role}`,
              module: "Identidade",
              severity: "alerta",
            });
          })
          .catch((err) => console.error("[lms-api] updatePermission", err));
        return;
      }

      setMockPermissions((prev) =>
        prev.map((p) => (p.id !== permId ? p : { ...p, roles }))
      );
      log({
        user: currentUser?.email ?? "system",
        action: `Alterou permissão '${permId}' · ${role}`,
        module: "Identidade",
        severity: "alerta",
      });
    },
    [currentUser, javaApi, log, permissions, updatePermissionMutation]
  );

  const toggleScheduledJob: AppState["toggleScheduledJob"] = useCallback(
    (id) => {
      const current = scheduledJobs.find((j) => j.id === id);
      if (!current) return;

      const enabled = !current.enabled;

      if (javaApi) {
        void updateScheduledJobMutation
          .mutateAsync({ id, body: { enabled } })
          .then(() => {
            log({
              user: currentUser?.email ?? "system",
              action: `Alternou job agendado '${id}'`,
              module: "Configurações",
              severity: "info",
            });
          })
          .catch((err) => console.error("[lms-api] updateScheduledJob", err));
        return;
      }

      setMockScheduledJobs((prev) =>
        prev.map((j) => (j.id === id ? { ...j, enabled } : j))
      );
      log({
        user: currentUser?.email ?? "system",
        action: `Alternou job agendado '${id}'`,
        module: "Configurações",
        severity: "info",
      });
    },
    [currentUser, javaApi, log, scheduledJobs, updateScheduledJobMutation]
  );

  const updateSettings: AppState["updateSettings"] = useCallback(
    (s) => {
      setSettings((prev) => {
        const next = { ...prev, ...s };
        if (s.brandColor) applyBrandColor(s.brandColor);
        return next;
      });
      log({
        user: currentUser?.email ?? "system",
        action: "Atualizou parâmetros da plataforma",
        module: "Configurações",
        severity: "alerta",
      });
    },
    [currentUser, log]
  );

  return {
    users,
    integrations,
    permissions,
    scheduledJobs,
    auditLogs,
    settings,
    log,
    addUser,
    toggleUserStatus,
    updateIntegration,
    togglePermissionRole,
    toggleScheduledJob,
    updateSettings,
  };
}
