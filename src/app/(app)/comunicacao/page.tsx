"use client";

import { useApp } from "@/lib/store";
import { PageHeader, Card, Badge, Table, StatCard } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { unitLabels } from "@/lib/rbac";

const channelMeta: Record<string, { label: string; color: "green" | "blue" | "purple" | "amber" }> = {
  email: { label: "E-mail", color: "blue" },
  push: { label: "Push", color: "green" },
  mural: { label: "Mural", color: "purple" },
  sms: { label: "SMS", color: "amber" },
};

const statusColor = {
  enviado: "green",
  agendado: "blue",
  rascunho: "slate",
} as const;

export default function ComunicacaoPage() {
  const { messages, posts } = useApp();
  const enviadas = messages.filter((m) => m.status === "enviado");
  const avgOpen = Math.round(
    enviadas.reduce((s, m) => s + m.openRate, 0) / (enviadas.length || 1)
  );

  return (
    <div>
      <PageHeader
        title="Comunicação"
        subtitle="Campanhas, posts no mural e notificações multicanal"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Campanhas" value={messages.length.toString()} icon={<Icon name="mail" className="w-5 h-5" />} />
        <StatCard label="Posts no mural" value={posts.length.toString()} icon={<Icon name="grid" className="w-5 h-5" />} color="#2563eb" />
        <StatCard label="Taxa de abertura" value={`${avgOpen}%`} icon={<Icon name="trend" className="w-5 h-5" />} color="#7c3aed" />
        <StatCard label="Agendadas" value={messages.filter((m) => m.status === "agendado").length.toString()} icon={<Icon name="calendar" className="w-5 h-5" />} color="#d97706" />
      </div>

      <Card className="p-6 mb-4">
        <h3 className="font-semibold text-slate-800 mb-4">Posts publicados (mural)</h3>
        <div className="space-y-3">
          {posts.map((p) => (
            <div key={p.id} className="p-4 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-medium text-slate-800">{p.title}</h4>
                <Badge color="green">{p.status}</Badge>
              </div>
              <p className="text-sm text-slate-600 mt-1">{p.body}</p>
              <p className="text-xs text-slate-400 mt-2">
                {p.author} · {unitLabels[p.unitId]} · {p.publishedAt}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-2">
        <Table head={["Campanha", "Canal", "Público", "Status", "Envio", "Abertura"]}>
          {messages.map((m) => (
            <tr key={m.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-medium text-slate-800">{m.title}</td>
              <td className="px-4 py-3"><Badge color={channelMeta[m.channel].color}>{channelMeta[m.channel].label}</Badge></td>
              <td className="px-4 py-3 text-slate-600">{m.audience}</td>
              <td className="px-4 py-3"><Badge color={statusColor[m.status]}>{m.status}</Badge></td>
              <td className="px-4 py-3 text-slate-500 text-xs">{m.sentAt}</td>
              <td className="px-4 py-3 font-medium text-slate-700">{m.openRate ? `${m.openRate}%` : "—"}</td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
