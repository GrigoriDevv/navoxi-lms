"use client";

import { questions } from "@/lib/mock-data";
import { useAuthScope } from "@/lib/use-auth-scope";
import { scopeByUnit, unitLabels } from "@/lib/rbac";
import { PageHeader, Card, Badge, Table } from "@/components/ui";

const typeLabel = { multipla: "Múltipla escolha", verdadeiro: "V/F", dissertativa: "Dissertativa" } as const;

export default function QuestoesPage() {
  const { role, unitId } = useAuthScope();
  const items = scopeByUnit(questions, role, unitId);

  return (
    <div>
      <PageHeader title="Repositório de Questões" subtitle="Banco de questões para avaliações e provas" />

      <Card className="p-2">
        <Table head={["Questão", "Tipo", "Categoria", "Unidade", "Usos"]}>
          {items.map((q) => (
            <tr key={q.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 text-slate-800 max-w-md">{q.text}</td>
              <td className="px-4 py-3"><Badge color="slate">{typeLabel[q.type]}</Badge></td>
              <td className="px-4 py-3 text-slate-600">{q.category}</td>
              <td className="px-4 py-3 text-xs text-slate-500">{unitLabels[q.unitId]}</td>
              <td className="px-4 py-3 font-medium text-slate-700">{q.usageCount}</td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
