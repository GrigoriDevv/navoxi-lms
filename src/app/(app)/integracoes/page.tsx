"use client";

import { useApp } from "@/lib/store";
import { PageHeader, Card, Badge, Table } from "@/components/ui";
import { Icon } from "@/components/Icon";
import Link from "next/link";

const statusColor = {
  conectado: "green",
  desconectado: "slate",
  erro: "red",
} as const;

export default function IntegracoesPage() {
  const { automations, integrations, scheduledJobs, toggleAutomation, updateIntegration, toggleScheduledJob } = useApp();

  return (
    <div>
      <PageHeader
        title="Automação & Integrações"
        subtitle="Conexões corporativas e execuções automáticas · também em Configurações"
        action={
          <Link href="/configuracoes" className="text-sm text-brand font-medium hover:underline">
            Abrir parametrização completa →
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Integrações (RF-068)</h3>
          <div className="space-y-3">
            {integrations.map((i) => (
              <div key={i.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200">
                <span className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 grid place-items-center shrink-0">
                  <Icon name="plug" className="w-5 h-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-800">{i.name}</div>
                  <div className="text-xs text-slate-400">{i.type} · última sinc.: {i.lastSync}</div>
                </div>
                <Badge color={statusColor[i.status]}>{i.status}</Badge>
                <button onClick={() => updateIntegration(i.id, { status: i.status === "conectado" ? "desconectado" : "conectado" })} className="text-xs text-brand hover:underline shrink-0">
                  Toggle
                </button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Jobs agendados (RF-070)</h3>
          <div className="space-y-3">
            {scheduledJobs.map((j) => (
              <div key={j.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                <div>
                  <div className="font-medium text-slate-800 text-sm">{j.name}</div>
                  <div className="text-xs text-slate-400">{j.schedule} · {j.module}</div>
                </div>
                <button onClick={() => toggleScheduledJob(j.id)} className={`w-11 h-6 rounded-full relative transition ${j.enabled ? "bg-brand" : "bg-slate-300"}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition ${j.enabled ? "left-[22px]" : "left-0.5"}`} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-2 mt-4">
        <div className="px-4 py-3 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Automações reativas</h3>
          <Badge color="green">{automations.filter((a) => a.enabled).length} ativas</Badge>
        </div>
        <Table head={["Automação", "Gatilho", "Ação", "Execuções", "Status"]}>
          {automations.map((a) => (
            <tr key={a.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-medium text-slate-800">{a.name}</td>
              <td className="px-4 py-3 text-slate-600 text-xs">{a.trigger}</td>
              <td className="px-4 py-3 text-slate-600 text-xs">{a.action}</td>
              <td className="px-4 py-3 text-slate-700 font-medium">{a.runs.toLocaleString("pt-BR")}</td>
              <td className="px-4 py-3">
                <button onClick={() => toggleAutomation(a.id)} className={`w-11 h-6 rounded-full relative transition ${a.enabled ? "bg-brand" : "bg-slate-300"}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition ${a.enabled ? "left-[22px]" : "left-0.5"}`} />
                </button>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
