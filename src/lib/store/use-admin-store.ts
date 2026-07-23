"use client";

import { useCallback, useEffect, useState } from "react";
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
  const [users, setUsers] = useState<User[]>(seed.users);
  // MOCK: not wired to backend
  const [integrations, setIntegrations] = useState<Integration[]>(
    seed.integrations
  );
  // MOCK: not wired to backend
  const [permissions, setPermissions] = useState<Permission[]>(seed.permissions);
  // MOCK: not wired to backend
  const [scheduledJobs, setScheduledJobs] = useState<ScheduledJob[]>(
    seed.scheduledJobs
  );
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(seed.auditLogs);
  const [settings, setSettings] = useState<Settings>(seed.settings);

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
      setPermissions((prev) =>
        prev.map((p) => {
          if (p.id !== permId) return p;
          const roles = p.roles.includes(role)
            ? p.roles.filter((r) => r !== role)
            : [...p.roles, role];
          return { ...p, roles };
        })
      );
      log({
        user: currentUser?.email ?? "system",
        action: `Alterou permissão '${permId}' · ${role}`,
        module: "Identidade",
        severity: "alerta",
      });
    },
    [currentUser, log]
  );

  const toggleScheduledJob: AppState["toggleScheduledJob"] = useCallback(
    (id) => {
      setScheduledJobs((prev) =>
        prev.map((j) => (j.id === id ? { ...j, enabled: !j.enabled } : j))
      );
      log({
        user: currentUser?.email ?? "system",
        action: `Alternou job agendado '${id}'`,
        module: "Configurações",
        severity: "info",
      });
    },
    [currentUser, log]
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
