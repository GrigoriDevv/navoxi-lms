"use client";

import { roleLabels, unitLabels } from "@/lib/rbac";
import type { DashboardFilters } from "@/lib/dashboard-metrics";
import { filterUsers } from "@/lib/dashboard-metrics";
import type { User } from "@/lib/types";
import { Card, Table, Badge, Avatar, ProgressBar } from "@/components/ui";
import { WidgetShell } from "./WidgetShell";

export function EquipeTab({
  users,
  filters,
  widgetStatus,
  onRetry,
}: {
  users: User[];
  filters: DashboardFilters;
  widgetStatus: "ready" | "loading" | "error" | "empty";
  onRetry?: () => void;
}) {
  const team = filterUsers(users, filters);
  const active = team.filter((u) => u.status === "ativo");
  const inactive = team.filter((u) => u.status !== "ativo");

  const deptStats = Object.entries(
    team.reduce<Record<string, number>>((acc, u) => {
      acc[u.department] = (acc[u.department] ?? 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

  const hasData = team.length > 0;
  const status = widgetStatus === "ready" && !hasData ? "empty" : widgetStatus;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="text-sm text-slate-500">Membros no escopo</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{team.length}</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-slate-500">Ativos</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{active.length}</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-slate-500">Inativos / bloqueados</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{inactive.length}</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-slate-500">Departamentos</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{deptStats.length}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <WidgetShell
          title="Distribuição por departamento"
          status={status}
          onRetry={onRetry}
        >
          <div className="space-y-3">
            {deptStats.map(([dept, count]) => {
              const pct = Math.round((count / team.length) * 100);
              return (
                <div key={dept}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600 truncate">{dept}</span>
                    <span className="text-slate-800 font-medium">{count}</span>
                  </div>
                  <ProgressBar value={pct} />
                </div>
              );
            })}
          </div>
        </WidgetShell>

        <Card className="lg:col-span-2 p-2">
          <div className="px-4 py-3 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">Membros da equipe</h3>
          </div>
          {status === "empty" ? (
            <div className="p-8 text-center text-sm text-slate-400">
              Nenhum membro encontrado com os filtros aplicados.
            </div>
          ) : status === "loading" ? (
            <div className="p-8 animate-pulse space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-slate-100 rounded" />
              ))}
            </div>
          ) : status === "error" ? (
            <div className="p-8 text-center">
              <p className="text-sm text-slate-600">Falha ao carregar dados da equipe.</p>
              {onRetry && (
                <button onClick={onRetry} className="mt-2 text-sm text-brand hover:underline">
                  Tentar novamente
                </button>
              )}
            </div>
          ) : (
            <Table head={["Colaborador", "Perfil", "Unidade", "Status", "Último acesso"]}>
              {team.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} color={u.avatarColor} size={32} />
                      <div>
                        <div className="font-medium text-slate-800">{u.name}</div>
                        <div className="text-xs text-slate-400">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">{roleLabels[u.role]}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{unitLabels[u.unitId]}</td>
                  <td className="px-4 py-3">
                    <Badge color={u.status === "ativo" ? "green" : u.status === "bloqueado" ? "red" : "slate"}>
                      {u.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{u.lastAccess}</td>
                </tr>
              ))}
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
}
