"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { matrixRoles } from "@/lib/mock-data";
import {
  roleLabels,
  roleDescriptions,
  roleColor,
  confirmedRoles,
  pendingRoles,
  isConfirmedRole,
  unitLabels,
} from "@/lib/rbac";
import { PageHeader, Card, Badge, Table, Avatar } from "@/components/ui";
import { Icon } from "@/components/Icon";

export default function IdentidadePage() {
  const { users, toggleUserStatus, permissions } = useApp();
  const [tab, setTab] = useState<"perfis" | "permissoes" | "sessoes">("perfis");

  const roleCounts = matrixRoles.map((r) => ({
    role: r,
    count: users.filter((u) => u.role === r).length,
  }));

  return (
    <div>
      <PageHeader
        title="Identidade & Controle de Acesso"
        subtitle="Perfis, permissões (RBAC), escopo por unidade, MFA e sessões"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        {matrixRoles.map((role) => (
          <Card key={role} className="p-5">
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm font-semibold text-slate-800">{roleLabels[role]}</span>
              <Badge color={isConfirmedRole(role) ? "green" : "slate"}>
                {isConfirmedRole(role) ? "Confirmado" : "A confirmar"}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">{roleDescriptions[role]}</p>
            <div className="mt-3 text-2xl font-bold text-slate-900">
              {roleCounts.find((rc) => rc.role === role)?.count ?? 0}
              <span className="text-sm font-normal text-slate-400 ml-1">usuários</span>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4 mb-6 bg-emerald-50/50 border-emerald-200">
        <div className="text-sm text-slate-700">
          <strong>Perfis confirmados:</strong>{" "}
          {confirmedRoles.map((r) => roleLabels[r]).join(" · ")}.
          {" "}
          <strong>Pendentes de levantamento:</strong>{" "}
          {pendingRoles.map((r) => roleLabels[r]).join(", ")}.
        </div>
      </Card>

      <div className="flex gap-1 mb-4 border-b border-slate-200">
        {([
          ["perfis", "Perfis & Usuários"],
          ["permissoes", "Matriz de Permissões"],
          ["sessoes", "Segurança & Sessões"],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${
              tab === id
                ? "border-brand text-brand"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "perfis" && (
        <Card className="p-2">
          <Table head={["Usuário", "Perfil", "Unidade", "Departamento", "Status", "Último acesso", "Ações"]}>
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={u.name} color={u.avatarColor} />
                    <div>
                      <div className="font-medium text-slate-800">{u.name}</div>
                      <div className="text-xs text-slate-400">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge color={roleColor[u.role]}>{roleLabels[u.role]}</Badge>
                </td>
                <td className="px-4 py-3 text-slate-600 text-xs">{unitLabels[u.unitId]}</td>
                <td className="px-4 py-3 text-slate-600">{u.department}</td>
                <td className="px-4 py-3">
                  <Badge
                    color={
                      u.status === "ativo"
                        ? "green"
                        : u.status === "bloqueado"
                        ? "red"
                        : "slate"
                    }
                  >
                    {u.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">{u.lastAccess}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleUserStatus(u.id)}
                    className="text-xs font-medium text-brand hover:underline"
                  >
                    {u.status === "ativo" ? "Bloquear" : "Ativar"}
                  </button>
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      )}

      {tab === "permissoes" && (
        <Card className="p-2 overflow-x-auto">
          <Table head={["Permissão", "Descrição", ...matrixRoles.map((r) => roleLabels[r])]}>
            {permissions.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">{p.name}</td>
                <td className="px-4 py-3 text-slate-500 text-xs max-w-xs">{p.description}</td>
                {matrixRoles.map((r) => (
                  <td key={r} className="px-4 py-3 text-center">
                    {p.roles.includes(r) ? (
                      <span className="inline-flex w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 items-center justify-center mx-auto">
                        <Icon name="check" className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </Table>
        </Card>
      )}

      {tab === "sessoes" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Políticas de segurança</h3>
            <ul className="space-y-3 text-sm">
              {[
                ["MFA obrigatório", "Ativado para Administrador Premium e Admin. de Unidade"],
                ["SSO Corporativo", "Azure AD · SAML 2.0 conectado"],
                ["Política de senha", "Mínimo 10 caracteres, rotação 90 dias"],
                ["Escopo por unidade", "Admin. de Unidade restrito à sua distribuidora"],
              ].map(([t, d]) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 grid place-items-center mt-0.5 shrink-0">
                    <Icon name="check" className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <div className="font-medium text-slate-700">{t}</div>
                    <div className="text-xs text-slate-400">{d}</div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Sessões ativas</h3>
            <div className="space-y-3">
              {users
                .filter((u) => u.status === "ativo")
                .slice(0, 5)
                .map((u) => (
                  <div key={u.id} className="flex items-center gap-3 text-sm">
                    <Avatar name={u.name} color={u.avatarColor} size={30} />
                    <div className="flex-1">
                      <div className="font-medium text-slate-700">{u.name}</div>
                      <div className="text-xs text-slate-400">
                        {roleLabels[u.role]} · {unitLabels[u.unitId]} · {u.lastAccess}
                      </div>
                    </div>
                    <Badge color="green">online</Badge>
                  </div>
                ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
