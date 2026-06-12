"use client";

import { evaluations } from "@/lib/mock-data";
import { useApp } from "@/lib/store";
import { useAuthScope } from "@/lib/use-auth-scope";
import { scopeByUnit, unitLabels } from "@/lib/rbac";
import { PageHeader, Card, Badge, Table } from "@/components/ui";

const statusColor = { rascunho: "amber", publicada: "green", encerrada: "slate" } as const;

export default function AvaliacoesPage() {
  const { courses } = useApp();
  const { role, unitId } = useAuthScope();
  const items = scopeByUnit(evaluations, role, unitId);
  const courseName = (id: string) => courses.find((c) => c.id === id)?.title ?? "—";

  return (
    <div>
      <PageHeader title="Avaliações" subtitle="Gestão e listagem de avaliações vinculadas a cursos" />

      <Card className="p-2">
        <Table head={["Avaliação", "Curso", "Unidade", "Questões", "Prazo", "Status"]}>
          {items.map((a) => (
            <tr key={a.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-medium text-slate-800">{a.name}</td>
              <td className="px-4 py-3 text-slate-600 text-sm max-w-xs truncate">{courseName(a.courseId)}</td>
              <td className="px-4 py-3 text-xs text-slate-500">{unitLabels[a.unitId]}</td>
              <td className="px-4 py-3 text-slate-700">{a.questionCount}</td>
              <td className="px-4 py-3 text-slate-500 text-xs">{a.dueDate}</td>
              <td className="px-4 py-3"><Badge color={statusColor[a.status]}>{a.status}</Badge></td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
