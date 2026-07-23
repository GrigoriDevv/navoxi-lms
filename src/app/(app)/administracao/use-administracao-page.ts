"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import { useAuthScope } from "@/lib/use-auth-scope";
import { isJavaApiEnabled } from "@/lib/api-config";
import { lmsApi } from "@/lib/api-client";
import type { Role, UnitId, User } from "@/lib/types";

export function useAdministracaoPage() {
  const { addUser } = useApp();
  const { users: scopedMockUsers, role, unitId, isGlobal, unitLabel, can } =
    useAuthScope();
  const javaApi = isJavaApiEnabled();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [apiUsers, setApiUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(javaApi);
  const [apiError, setApiError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "aluno" as Role,
    unitId: (unitId ?? "matriz") as UnitId,
    department: "Operações",
    status: "ativo" as const,
  });

  const loadApiUsers = useCallback(async () => {
    if (!javaApi) return;
    setLoading(true);
    setApiError(null);
    try {
      const list = await lmsApi.listUsers();
      setApiUsers(list);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Falha ao carregar usuários");
    } finally {
      setLoading(false);
    }
  }, [javaApi]);

  useEffect(() => {
    void loadApiUsers();
  }, [loadApiUsers]);

  const users = javaApi ? apiUsers : scopedMockUsers;

  const filtered = useMemo(
    () =>
      users.filter(
        (u) =>
          u.name.toLowerCase().includes(query.toLowerCase()) ||
          u.email.toLowerCase().includes(query.toLowerCase()) ||
          u.department.toLowerCase().includes(query.toLowerCase())
      ),
    [users, query]
  );

  const departments = useMemo(
    () => Array.from(new Set(users.map((u) => u.department))),
    [users]
  );

  const deptStats = useMemo(
    () =>
      departments
        .map((d) => ({
          dept: d,
          count: users.filter((u) => u.department === d).length,
        }))
        .sort((a, b) => b.count - a.count),
    [departments, users]
  );

  const assignableRoles: Role[] = isGlobal
    ? ["admin_premium", "admin_unidade", "gestor_conteudo", "instrutor", "aluno"]
    : ["gestor_conteudo", "instrutor", "aluno"];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (javaApi) return;
    addUser(form);
    setOpen(false);
    setForm({
      name: "",
      email: "",
      role: "aluno",
      unitId: unitId ?? "matriz",
      department: "Operações",
      status: "ativo",
    });
  };

  const patchUser = async (
    id: string,
    body: Partial<Pick<User, "role" | "unitId" | "status">>
  ) => {
    setSavingId(id);
    setApiError(null);
    try {
      const updated = await lmsApi.updateUser(id, body);
      setApiUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Falha ao atualizar usuário");
    } finally {
      setSavingId(null);
    }
  };

  const activeCount = users.filter((u) => u.status === "ativo").length;
  const blockedCount = users.filter((u) => u.status === "bloqueado").length;

  return {
    role,
    isGlobal,
    unitLabel,
    can,
    javaApi,
    query,
    setQuery,
    open,
    setOpen,
    loading,
    apiError,
    savingId,
    form,
    setForm,
    users,
    filtered,
    departments,
    deptStats,
    assignableRoles,
    activeCount,
    blockedCount,
    submit,
    patchUser,
  };
}
