"use client";

import { useAuthScope } from "@/lib/use-auth-scope";
import { roleLabels } from "@/lib/rbac";
import { matrixRoles } from "@/lib/mock-data";
import { PageHeader, Card, StatCard, Badge, ProgressBar } from "@/components/ui";
import { BarChart, Donut, LineTrend } from "@/components/charts";
import { Icon } from "@/components/Icon";

export default function RelatoriosPage() {
  const { courses, users, isGlobal, unitLabel } = useAuthScope();

  const byCategory = Object.entries(
    courses.reduce<Record<string, number>>((acc, c) => {
      acc[c.category] = (acc[c.category] ?? 0) + c.enrolled;
      return acc;
    }, {})
  )
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  const topCourses = [...courses]
    .filter((c) => c.enrolled > 0)
    .sort((a, b) => b.completion - a.completion)
    .slice(0, 5);

  const matriculas = courses.reduce((s, c) => s + c.enrolled, 0);
  const horas = courses.reduce((s, c) => s + c.workload * c.enrolled, 0);

  const profileSegments = matrixRoles
    .map((r) => ({
      label: roleLabels[r],
      value: users.filter((u) => u.role === r).length,
      color:
        r === "admin_premium"
          ? "#2563eb"
          : r === "admin_unidade"
          ? "#2563eb"
          : r === "gestor_conteudo"
          ? "#7c3aed"
          : r === "instrutor"
          ? "#d97706"
          : "#94a3b8",
    }))
    .filter((s) => s.value > 0);

  return (
    <div>
      <PageHeader
        title="Relatórios & Analytics"
        subtitle={
          isGlobal
            ? "Indicadores corporativos em todas as unidades"
            : `Indicadores da unidade · ${unitLabel}`
        }
        action={
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50">
            <Icon name="chart" className="w-4 h-4" />
            Exportar
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard label="Matrículas no escopo" value={matriculas.toLocaleString("pt-BR")} delta="+18% vs. trimestre" icon={<Icon name="route" className="w-5 h-5" />} />
        <StatCard label="Horas de treinamento" value={`${(horas / 1000).toFixed(1)}k`} delta="acumulado" icon={<Icon name="book" className="w-5 h-5" />} color="#2563eb" />
        <StatCard label="Taxa de conclusão" value="71%" delta="meta 80%" icon={<Icon name="check" className="w-5 h-5" />} color="#7c3aed" />
        <StatCard label="Usuários no escopo" value={users.length.toString()} delta={isGlobal ? "Todas unidades" : unitLabel} icon={<Icon name="users" className="w-5 h-5" />} color="#d97706" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card className="p-6 lg:col-span-2">
          <h3 className="font-semibold text-slate-800 mb-4">Matrículas por categoria</h3>
          <BarChart data={byCategory} />
        </Card>
        <Card className="p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Distribuição de perfis</h3>
          <Donut segments={profileSegments} />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-6">
          <h3 className="font-semibold text-slate-800 mb-2">Evolução de conclusões</h3>
          <p className="text-xs text-slate-400 mb-3">Últimos 12 meses</p>
          <LineTrend points={[30, 42, 38, 55, 60, 58, 72, 70, 81, 85, 90, 96]} color="#2563eb" />
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h3 className="font-semibold text-slate-800 mb-4">Cursos com melhor desempenho</h3>
          <div className="space-y-4">
            {topCourses.map((c) => (
              <div key={c.id}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700 truncate">{c.title}</span>
                  <Badge color="green">{c.completion}%</Badge>
                </div>
                <ProgressBar value={c.completion} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
