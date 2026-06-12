"use client";

import { useApp } from "@/lib/store";
import {
  roleLabels,
  roleDescriptions,
  unitLabels,
  isConfirmedRole,
  getNavItemsForRole,
} from "@/lib/rbac";
import { PageHeader, Card, Badge, Avatar } from "@/components/ui";
import { Icon } from "@/components/Icon";

export default function PerfilPage() {
  const { currentUser, users } = useApp();
  if (!currentUser) return null;

  const registered = users.find((u) => u.email === currentUser.email);
  const allowedModules = getNavItemsForRole(currentUser.role);

  return (
    <div>
      <PageHeader
        title="Meu perfil"
        subtitle="Dados da sessão autenticada e escopo de acesso (RF-001, RF-003)"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-6 lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <Avatar name={currentUser.name} color={currentUser.avatarColor} size={72} />
            <h2 className="mt-4 text-lg font-bold text-slate-900">{currentUser.name}</h2>
            <p className="text-sm text-slate-500">{currentUser.email}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <Badge color={isConfirmedRole(currentUser.role) ? "green" : "slate"}>
                {roleLabels[currentUser.role]}
              </Badge>
              <Badge color="blue">{unitLabels[currentUser.unitId]}</Badge>
            </div>
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2 space-y-4">
          <div>
            <h3 className="font-semibold text-slate-800 mb-1">Perfil ativo</h3>
            <p className="text-sm text-slate-600">{roleDescriptions[currentUser.role]}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400 block text-xs">Departamento</span>
              <span className="text-slate-800">{registered?.department ?? "—"}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-xs">Status</span>
              <span className="text-slate-800 capitalize">{registered?.status ?? "ativo"}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-xs">Último acesso</span>
              <span className="text-slate-800">{registered?.lastAccess ?? "—"}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-xs">ID da sessão</span>
              <span className="text-slate-800 font-mono text-xs">{currentUser.id}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 mt-4">
        <h3 className="font-semibold text-slate-800 mb-3">
          Módulos habilitados para seu perfil (RF-004)
        </h3>
        <div className="flex flex-wrap gap-2">
          {allowedModules.map((m) => (
            <span
              key={m.href}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-sm text-slate-700"
            >
              <Icon name={m.icon} className="w-4 h-4 text-brand" />
              {m.label}
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
}
