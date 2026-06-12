"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { PageHeader, Card, Badge, Table, StatCard } from "@/components/ui";
import { Icon } from "@/components/Icon";

const severityColor = {
  info: "blue",
  alerta: "amber",
  critico: "red",
} as const;

export default function AuditoriaPage() {
  const { auditLogs } = useApp();
  const [sev, setSev] = useState("todos");
  const [query, setQuery] = useState("");

  const filtered = auditLogs.filter(
    (l) =>
      (sev === "todos" || l.severity === sev) &&
      (l.action.toLowerCase().includes(query.toLowerCase()) ||
        l.user.toLowerCase().includes(query.toLowerCase()) ||
        l.module.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div>
      <PageHeader
        title="Auditoria & Logs"
        subtitle="Trilha de auditoria, eventos de segurança e rastreabilidade"
        action={
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50">
            <Icon name="list" className="w-4 h-4" />
            Exportar logs
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Eventos registrados" value={auditLogs.length.toString()} icon={<Icon name="list" className="w-5 h-5" />} />
        <StatCard label="Críticos" value={auditLogs.filter((l) => l.severity === "critico").length.toString()} icon={<Icon name="shield" className="w-5 h-5" />} color="#dc2626" />
        <StatCard label="Alertas" value={auditLogs.filter((l) => l.severity === "alerta").length.toString()} icon={<Icon name="bell" className="w-5 h-5" />} color="#d97706" />
        <StatCard label="Informativos" value={auditLogs.filter((l) => l.severity === "info").length.toString()} icon={<Icon name="check" className="w-5 h-5" />} color="#2563eb" />
      </div>

      <Card className="p-2">
        <div className="p-3 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Icon name="search" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por ação, usuário ou módulo…"
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-100 text-sm outline-none"
            />
          </div>
          <div className="flex gap-1">
            {["todos", "info", "alerta", "critico"].map((s) => (
              <button
                key={s}
                onClick={() => setSev(s)}
                className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition ${
                  sev === s ? "bg-brand text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <Table head={["Severidade", "Ação", "Usuário", "Módulo", "IP", "Data/Hora"]}>
          {filtered.map((l) => (
            <tr key={l.id} className="hover:bg-slate-50">
              <td className="px-4 py-3"><Badge color={severityColor[l.severity]}>{l.severity}</Badge></td>
              <td className="px-4 py-3 text-slate-800">{l.action}</td>
              <td className="px-4 py-3 text-slate-600 text-xs">{l.user}</td>
              <td className="px-4 py-3 text-slate-600">{l.module}</td>
              <td className="px-4 py-3 text-slate-500 font-mono text-xs">{l.ip}</td>
              <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{l.timestamp}</td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
