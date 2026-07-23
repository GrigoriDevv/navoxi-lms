"use client";

import { roleLabels, unitLabels } from "@/lib/rbac";
import {
  PageHeader,
  Card,
  StatCard,
  Badge,
  Table,
  Avatar,
  Modal,
  Button,
  Field,
  inputClass,
} from "@/components/ui";
import { Icon } from "@/components/Icon";
import type { Role, UnitId, User } from "@/lib/types";
import { useAdministracaoPage } from "./use-administracao-page";

export default function AdministracaoPage() {
  const {
    role,
    isGlobal,
    unitLabel,
    can,
    javaApi,
    query,
    setQuery,
    open,
    setOpen,
    loading,
    apiError,
    savingId,
    form,
    setForm,
    users,
    filtered,
    departments,
    deptStats,
    assignableRoles,
    activeCount,
    blockedCount,
    submit,
    patchUser,
  } = useAdministracaoPage();

  return (
    <div>
      <PageHeader
        title="Administração"
        subtitle={
          isGlobal
            ? "Gestão de usuários em todas as unidades"
            : `Gestão de usuários · escopo: ${unitLabel}`
        }
        action={
          !javaApi &&
          (can("manage_users_all") || can("manage_users_unit")) && (
            <Button onClick={() => setOpen(true)}>
              <Icon name="plus" className="w-4 h-4" />
              Novo usuário
            </Button>
          )
        }
      />

      {javaApi && (
        <Card className="p-4 mb-4 bg-slate-50 border-slate-200">
          <p className="text-sm text-slate-700">
            Usuários vêm do Postgres. Novos acessos entram via Microsoft SSO (JIT).
            Altere perfil/unidade abaixo para promover contas.
          </p>
        </Card>
      )}

      {!isGlobal && (
        <Card className="p-4 mb-4 bg-blue-50/50 border-blue-200">
          <p className="text-sm text-slate-700">
            Como <strong>{roleLabels[role]}</strong>, você visualiza e gerencia apenas
            usuários da unidade <strong>{unitLabel}</strong>.
          </p>
        </Card>
      )}

      {apiError && (
        <Card className="p-3 mb-4 border-red-200 bg-red-50 text-sm text-red-700">
          {apiError}
        </Card>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Usuários no escopo" value={loading ? "…" : users.length.toString()} icon={<Icon name="users" className="w-5 h-5" />} />
        <StatCard label="Ativos" value={loading ? "…" : activeCount.toString()} icon={<Icon name="check" className="w-5 h-5" />} color="#2563eb" />
        <StatCard label="Departamentos" value={loading ? "…" : departments.length.toString()} icon={<Icon name="grid" className="w-5 h-5" />} color="#7c3aed" />
        <StatCard label="Bloqueados" value={loading ? "…" : blockedCount.toString()} icon={<Icon name="shield" className="w-5 h-5" />} color="#d97706" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Por departamento</h3>
          <div className="space-y-3">
            {deptStats.map((d) => (
              <div key={d.dept} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{d.dept}</span>
                <span className="font-semibold text-slate-900">{d.count}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2 p-2">
          <div className="p-3">
            <div className="relative">
              <Icon name="search" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nome, e-mail ou departamento…"
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-100 text-sm outline-none"
              />
            </div>
          </div>
          <Table
            head={
              javaApi
                ? ["Usuário", "Perfil", "Unidade", "Status"]
                : ["Usuário", "Perfil", "Unidade", "Departamento", "Status"]
            }
          >
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={u.name} color={u.avatarColor} size={32} />
                    <div>
                      <div className="font-medium text-slate-800">{u.name}</div>
                      <div className="text-xs text-slate-400">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600 text-xs">
                  {javaApi && (can("manage_users_all") || can("manage_users_unit")) ? (
                    <select
                      className="rounded border border-slate-200 bg-white px-2 py-1 text-xs"
                      value={u.role}
                      disabled={savingId === u.id}
                      onChange={(e) =>
                        void patchUser(u.id, { role: e.target.value as Role })
                      }
                    >
                      {assignableRoles.map((r) => (
                        <option key={r} value={r}>
                          {roleLabels[r]}
                        </option>
                      ))}
                      {!assignableRoles.includes(u.role) && (
                        <option value={u.role}>{roleLabels[u.role]}</option>
                      )}
                    </select>
                  ) : (
                    roleLabels[u.role]
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600 text-xs">
                  {javaApi && can("manage_users_all") ? (
                    <select
                      className="rounded border border-slate-200 bg-white px-2 py-1 text-xs"
                      value={u.unitId}
                      disabled={savingId === u.id}
                      onChange={(e) =>
                        void patchUser(u.id, { unitId: e.target.value as UnitId })
                      }
                    >
                      {Object.entries(unitLabels).map(([id, label]) => (
                        <option key={id} value={id}>
                          {label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    unitLabels[u.unitId]
                  )}
                </td>
                {!javaApi && (
                  <td className="px-4 py-3 text-slate-600">{u.department}</td>
                )}
                <td className="px-4 py-3">
                  {javaApi && (can("manage_users_all") || can("manage_users_unit")) ? (
                    <select
                      className="rounded border border-slate-200 bg-white px-2 py-1 text-xs"
                      value={u.status}
                      disabled={savingId === u.id}
                      onChange={(e) =>
                        void patchUser(u.id, {
                          status: e.target.value as User["status"],
                        })
                      }
                    >
                      <option value="ativo">ativo</option>
                      <option value="inativo">inativo</option>
                      <option value="bloqueado">bloqueado</option>
                    </select>
                  ) : (
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
                  )}
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Cadastrar novo usuário">
        <form onSubmit={submit}>
          <Field label="Nome completo">
            <input required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="E-mail corporativo">
            <input required type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Perfil">
              <select className={inputClass} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
                {assignableRoles.map((r) => (
                  <option key={r} value={r}>{roleLabels[r]}</option>
                ))}
              </select>
            </Field>
            <Field label="Unidade">
              {isGlobal ? (
                <select className={inputClass} value={form.unitId} onChange={(e) => setForm({ ...form, unitId: e.target.value as UnitId })}>
                  {Object.entries(unitLabels).map(([id, label]) => (
                    <option key={id} value={id}>{label}</option>
                  ))}
                </select>
              ) : (
                <input className={inputClass} value={unitLabel} disabled readOnly />
              )}
            </Field>
          </div>
          <Field label="Departamento">
            <input className={inputClass} value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
          </Field>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit">
              <Icon name="check" className="w-4 h-4" />
              Salvar usuário
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
