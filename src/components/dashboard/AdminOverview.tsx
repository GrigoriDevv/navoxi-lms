"use client";

import Link from "next/link";
import { useAuthScope } from "@/lib/use-auth-scope";
import { useApp } from "@/lib/store";
import { Card, Badge, StatCard } from "@/components/ui";
import { Icon } from "@/components/Icon";

export function AdminOverview() {
  const { users, courses, turmas, solicitacoes, can, isGlobal, unitLabel } = useAuthScope();
  const { auditLogs } = useApp();

  const isAdmin = can("manage_users_all") || can("manage_users_unit") || can("manage_global_settings");
  if (!isAdmin) return null;

  const pendingSol = solicitacoes.filter((s) => s.status === "pendente").length;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-slate-800">
          Visão administrativa {isGlobal ? "· corporativa" : `· ${unitLabel}`} (RF-073)
        </h2>
        <Link href="/administracao" className="text-xs text-brand font-medium hover:underline">Gestão completa</Link>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <StatCard label="Usuários no escopo" value={users.length.toString()} icon={<Icon name="users" className="w-5 h-5" />} />
        <StatCard label="Cursos ativos" value={courses.filter((c) => c.status === "publicado").length.toString()} color="#2563eb" icon={<Icon name="book" className="w-5 h-5" />} />
        <StatCard label="Turmas abertas" value={turmas.filter((t) => t.status !== "concluida").length.toString()} color="#7c3aed" icon={<Icon name="group" className="w-5 h-5" />} />
        <StatCard label="Solicitações pendentes" value={pendingSol.toString()} color="#d97706" icon={<Icon name="mail" className="w-5 h-5" />} />
      </div>
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Ações de gestão</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { href: "/administracao", label: "Usuários", icon: "users" },
            { href: "/aprendizagem/solicitacoes", label: "Matrículas", icon: "mail" },
            { href: "/relatorios", label: "Relatórios", icon: "chart" },
            { href: "/configuracoes", label: "Configurações", icon: "cog" },
          ].map((a) => (
            <Link key={a.href} href={a.href} className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 hover:border-brand hover:bg-brand/5 transition text-sm font-medium text-slate-700">
              <Icon name={a.icon} className="w-4 h-4 text-brand" />
              {a.label}
            </Link>
          ))}
        </div>
        {can("view_audit") && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500 uppercase">Atividade recente</span>
              <Badge color="slate">{auditLogs.length} eventos</Badge>
            </div>
            <ul className="text-xs text-slate-600 space-y-1">
              {auditLogs.slice(0, 3).map((l) => (
                <li key={l.id} className="truncate">{l.action}</li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </div>
  );
}
