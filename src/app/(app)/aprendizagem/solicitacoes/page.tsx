"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { useAuthScope } from "@/lib/use-auth-scope";
import { unitLabels } from "@/lib/rbac";
import { solicitacaoStatusLabels } from "@/lib/aprendizagem";
import { PageHeader, Card, Badge, Table, StatCard, Modal, Button } from "@/components/ui";
import { Icon } from "@/components/Icon";

const statusColor = { pendente: "amber", aprovada: "green", rejeitada: "red", cancelada: "slate" } as const;

export default function SolicitacoesPage() {
  const { updateSolicitacao } = useApp();
  const { solicitacoes, turmas, can } = useAuthScope();
  const [filter, setFilter] = useState("todas");
  const [detail, setDetail] = useState<(typeof solicitacoes)[0] | null>(null);

  const turmaName = (id?: string) => turmas.find((t) => t.id === id)?.name ?? "—";

  const filtered =
    filter === "todas" ? solicitacoes : solicitacoes.filter((s) => s.status === filter);

  const canManage = can("manage_turmas") || can("manage_users_all") || can("manage_users_unit");

  return (
    <div>
      <PageHeader
        title="Solicitações de Matrícula"
        subtitle="Abertura e gestão de solicitações (RF-048)"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard label="Total" value={solicitacoes.length.toString()} icon={<Icon name="mail" className="w-5 h-5" />} />
        <StatCard label="Pendentes" value={solicitacoes.filter((s) => s.status === "pendente").length.toString()} color="#d97706" icon={<Icon name="list" className="w-5 h-5" />} />
        <StatCard label="Aprovadas" value={solicitacoes.filter((s) => s.status === "aprovada").length.toString()} color="#00a14b" icon={<Icon name="check" className="w-5 h-5" />} />
        <StatCard label="Rejeitadas" value={solicitacoes.filter((s) => s.status === "rejeitada").length.toString()} color="#dc2626" icon={<Icon name="bell" className="w-5 h-5" />} />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {["todas", "pendente", "aprovada", "rejeitada", "cancelada"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize transition ${
              filter === s ? "bg-brand text-white" : "bg-white border border-slate-200 text-slate-600"
            }`}
          >
            {s === "todas" ? "Todas" : solicitacaoStatusLabels[s as keyof typeof solicitacaoStatusLabels]}
          </button>
        ))}
      </div>

      <Card className="p-2">
        <Table head={["Solicitante", "Curso", "Turma", "Unidade", "Data", "Status", "Ações"]}>
          {filtered.map((s) => (
            <tr key={s.id} className="hover:bg-slate-50">
              <td className="px-4 py-3">{s.userName}</td>
              <td className="px-4 py-3 text-sm">{s.courseTitle}</td>
              <td className="px-4 py-3 text-xs text-slate-500">{turmaName(s.turmaId)}</td>
              <td className="px-4 py-3 text-xs text-slate-500">{unitLabels[s.unitId]}</td>
              <td className="px-4 py-3 text-xs text-slate-500">{s.requestedAt}</td>
              <td className="px-4 py-3"><Badge color={statusColor[s.status]}>{solicitacaoStatusLabels[s.status]}</Badge></td>
              <td className="px-4 py-3">
                <button onClick={() => setDetail(s)} className="text-xs text-brand font-medium hover:underline">Gerenciar</button>
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      <Modal open={!!detail} onClose={() => setDetail(null)} title="Solicitação de matrícula">
        {detail && (
          <div className="space-y-3 text-sm">
            <p><strong>Solicitante:</strong> {detail.userName}</p>
            <p><strong>Curso:</strong> {detail.courseTitle}</p>
            <p><strong>Turma:</strong> {turmaName(detail.turmaId)}</p>
            <p><strong>Status:</strong> <Badge color={statusColor[detail.status]}>{solicitacaoStatusLabels[detail.status]}</Badge></p>
            {detail.reviewer && <p><strong>Revisor:</strong> {detail.reviewer}</p>}
            {canManage && detail.status === "pendente" && (
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => {
                    updateSolicitacao(detail.id, "aprovada");
                    setDetail(null);
                  }}
                >
                  Aprovar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    updateSolicitacao(detail.id, "rejeitada");
                    setDetail(null);
                  }}
                >
                  Rejeitar
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
