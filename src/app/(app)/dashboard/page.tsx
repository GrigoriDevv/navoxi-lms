"use client";

import { roleLabels } from "@/lib/rbac";
import { shouldHidePath } from "@/lib/mock-module-gates";
import { PageHeader, StatCard, Badge, ProgressBar } from "@/components/ui";
import { BarChart, Donut, LineTrend } from "@/components/charts";
import { Icon } from "@/components/Icon";
import { DashboardFiltersBar } from "@/components/dashboard/DashboardFiltersBar";
import { EquipeTab } from "@/components/dashboard/EquipeTab";
import { WidgetShell } from "@/components/dashboard/WidgetShell";
import { QuickShortcuts } from "@/components/home/QuickShortcuts";
import { QuickActions } from "@/components/home/QuickActions";
import { DestaquesBanner } from "@/components/home/DestaquesBanner";
import Link from "next/link";
import { useDashboardPage } from "./use-dashboard-page";

export default function DashboardPage() {
  const {
    auditLogs,
    currentUser,
    settings,
    turmas,
    users,
    role,
    unitId,
    unitLabel,
    isGlobal,
    tab,
    setTab,
    filters,
    filterOptions,
    metrics,
    hasData,
    effectiveStatus,
    lastUpdatedAt,
    dataCollectedUntil,
    isRefreshing,
    simulateError,
    setSimulateError,
    refresh,
    handleUnitFilter,
    adminKpis,
    showAdminKpis,
  } = useDashboardPage();

  return (
    <div>
      <PageHeader
        title={`Olá, ${currentUser?.name?.split(" ")[0] ?? "usuário"} 👋`}
        subtitle={`Monitoramento · ${roleLabels[role]}${!isGlobal && unitLabel ? ` · ${unitLabel}` : ""}`}
        action={
          <button
            onClick={refresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold hover:from-blue-600 hover:to-blue-700 disabled:opacity-60 transition shadow-sm"
          >
            <Icon name="refresh" className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Atualizando…" : "Atualizar painel"}
          </button>
        }
      />

      {/* RF-011, RF-012 */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-4 text-xs text-slate-500">
        <span>
          <strong className="text-slate-600">Última atualização:</strong> {lastUpdatedAt}
        </span>
        <span>
          <strong className="text-slate-600">Dados coletados até:</strong> {dataCollectedUntil}
        </span>
        <label className="flex items-center gap-1.5 ml-auto cursor-pointer">
          <input
            type="checkbox"
            checked={simulateError}
            onChange={(e) => setSimulateError(e.target.checked)}
            className="rounded border-slate-300"
          />
          Simular falha (demo RF-021)
        </label>
      </div>

      {/* RF-008, RF-009 — Abas */}
      <div className="flex gap-1 mb-4 border-b border-slate-200">
        {([
          ["dashboard", "Dashboard"],
          ["equipe", "Equipe"],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${
              tab === id
                ? "border-brand text-brand"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* RF-022 a RF-033 — Atalhos e ações rápidas (home) */}
      {tab === "dashboard" && (
        <div className="grid grid-cols-1 gap-6 mb-6">
          <QuickShortcuts />
          <QuickActions />
        </div>
      )}

      {tab === "dashboard" && settings.layout.showDestaques && <DestaquesBanner />}

      {/* RF-007, RF-013–018 — Filtros */}
      <DashboardFiltersBar
        filters={filters}
        onChange={handleUnitFilter}
        options={filterOptions}
        canPickUnit={isGlobal}
        lockedUnitId={!isGlobal ? unitId : undefined}
      />

      {tab === "dashboard" ? (
        <div className="mt-4 space-y-4">
          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              label="Matrículas ativas"
              value={effectiveStatus === "loading" ? "…" : metrics.activeEnrollments.toLocaleString("pt-BR")}
              delta={`${metrics.totalEnrollments.toLocaleString("pt-BR")} total`}
              icon={<Icon name="route" className="w-5 h-5" />}
              color="#2563eb"
            />
            <StatCard
              label="Acessos ao sistema"
              value={effectiveStatus === "loading" ? "…" : metrics.totalAccesses.toLocaleString("pt-BR")}
              delta={`média ${metrics.avgDailyAccess.toLocaleString("pt-BR")}/dia`}
              icon={<Icon name="trend" className="w-5 h-5" />}
              color="#2563eb"
            />
            <StatCard
              label="Colaboradores ativos"
              value={metrics.activeUsers.toString()}
              delta={`${metrics.filteredCourseCount} cursos no filtro`}
              icon={<Icon name="users" className="w-5 h-5" />}
              color="#7c3aed"
            />
            <StatCard
              label="Conclusão média"
              value={`${metrics.avgCompletion}%`}
              delta="Meta: 80%"
              icon={<Icon name="check" className="w-5 h-5" />}
              color="#d97706"
            />
          </div>

          {showAdminKpis && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Usuários no escopo" value={users.length.toString()} icon={<Icon name="users" className="w-5 h-5" />} />
              <StatCard label="Turmas abertas" value={adminKpis.openTurmas.toString()} color="#2563eb" icon={<Icon name="group" className="w-5 h-5" />} />
              <StatCard label="Solicitações pendentes" value={adminKpis.pendingSolicitacoes.toString()} color="#d97706" icon={<Icon name="mail" className="w-5 h-5" />} />
              <StatCard label="Cursos publicados" value={adminKpis.publishedCourses.toString()} color="#2563eb" icon={<Icon name="book" className="w-5 h-5" />} />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* RF-019 */}
            <WidgetShell
              title="Matrículas ativas"
              subtitle="Evolução no período selecionado"
              status={effectiveStatus}
              onRetry={refresh}
            >
              <p className="text-3xl font-bold text-slate-900">
                {metrics.activeEnrollments.toLocaleString("pt-BR")}
              </p>
              <p className="text-xs text-blue-600 font-medium mt-1">
                em andamento no escopo filtrado
              </p>
              <div className="mt-4">
                <LineTrend points={metrics.enrollmentTrend} color="#2563eb" height={100} />
              </div>
            </WidgetShell>

            {/* RF-020 */}
            <WidgetShell
              title="Acessos ao sistema"
              subtitle="Volume diário de acessos"
              status={effectiveStatus}
              onRetry={refresh}
            >
              <p className="text-3xl font-bold text-slate-900">
                {metrics.totalAccesses.toLocaleString("pt-BR")}
              </p>
              <p className="text-xs text-blue-600 font-medium mt-1">
                no período · média {metrics.avgDailyAccess.toLocaleString("pt-BR")}/dia
              </p>
              <div className="mt-4">
                <BarChart data={metrics.accessTrend} color="#2563eb" height={100} />
              </div>
            </WidgetShell>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <WidgetShell
              title="Matrículas por categoria"
              status={effectiveStatus}
              onRetry={refresh}
              subtitle="Distribuição consolidada"
            >
              <BarChart data={metrics.enrollByCategory.slice(0, 6)} />
            </WidgetShell>

            <WidgetShell
              title="Status das matrículas"
              status={effectiveStatus}
              onRetry={refresh}
            >
              <Donut
                segments={[
                  { label: "Concluídas", value: metrics.avgCompletion, color: "#2563eb" },
                  { label: "Em andamento", value: Math.max(0, 100 - metrics.avgCompletion - 8), color: "#2563eb" },
                  { label: "Não iniciadas", value: 8, color: "#e2e8f0" },
                ]}
              />
            </WidgetShell>

            <WidgetShell
              title="Turmas em destaque"
              status={effectiveStatus}
              onRetry={refresh}
            >
              <div className="space-y-4">
                {turmas.slice(0, 4).map((t) => {
                  const pct = Math.round((t.enrolled / t.capacity) * 100);
                  return (
                    <div key={t.id}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium text-slate-700 truncate">{t.name}</span>
                        <span className="text-slate-500 text-xs shrink-0 ml-2">
                          {t.enrolled}/{t.capacity}
                        </span>
                      </div>
                      <ProgressBar value={pct} color={pct >= 95 ? "#d97706" : "#2563eb"} />
                    </div>
                  );
                })}
                <Link href="/aprendizagem/turmas" className="text-sm text-brand font-medium hover:underline">
                  Ver todas as turmas
                </Link>
              </div>
            </WidgetShell>
          </div>

          {role === "admin_premium" &&
            effectiveStatus === "ready" &&
            hasData &&
            !shouldHidePath("/auditoria") && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-800">Atividade recente</h3>
                <Link href="/auditoria" className="text-sm text-brand font-medium hover:underline">
                  Ver auditoria
                </Link>
              </div>
              <ul className="divide-y divide-slate-100">
                {auditLogs.slice(0, 5).map((l) => (
                  <li key={l.id} className="py-3 flex items-center gap-3 text-sm">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        l.severity === "critico" ? "bg-red-500" : l.severity === "alerta" ? "bg-amber-500" : "bg-blue-500"
                      }`}
                    />
                    <span className="text-slate-700 flex-1">{l.action}</span>
                    <Badge color="slate">{l.module}</Badge>
                    <span className="text-slate-400 text-xs">{l.timestamp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4">
          <EquipeTab
            users={users}
            filters={filters}
            widgetStatus={effectiveStatus}
            onRetry={refresh}
          />
        </div>
      )}
    </div>
  );
}
