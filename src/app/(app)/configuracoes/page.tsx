"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { matrixRoles } from "@/lib/mock-data";
import { moduleDefinitions } from "@/lib/platform-config";
import { roleLabels } from "@/lib/rbac";
import { PageHeader, Card, Field, inputClass, Button, Badge, Table } from "@/components/ui";
import { Icon } from "@/components/Icon";
import type { Role, Settings } from "@/lib/types";

const statusColor = { conectado: "green", desconectado: "slate", erro: "red" } as const;

export default function ConfiguracoesPage() {
  const {
    settings,
    updateSettings,
    integrations,
    updateIntegration,
    permissions,
    togglePermissionRole,
    scheduledJobs,
    toggleScheduledJob,
  } = useApp();
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button type="button" onClick={() => onChange(!checked)} className={`w-11 h-6 rounded-full transition relative ${checked ? "bg-brand" : "bg-slate-300"}`}>
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition ${checked ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );

  const setModule = (key: keyof Settings["modules"], enabled: boolean) => {
    const modules = { ...form.modules, [key]: enabled };
    setForm({ ...form, modules });
    updateSettings({ modules });
  };

  const setLayout = (patch: Partial<Settings["layout"]>) => {
    const layout = { ...form.layout, ...patch };
    setForm({ ...form, layout });
    updateSettings({ layout });
  };

  return (
    <div>
      <PageHeader
        title="Configurações & Parametrização"
        subtitle="Parâmetros globais, identidade visual, políticas e regras de negócio"
      />

      <form onSubmit={save} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Organização</h3>
            <Field label="Nome da organização">
              <input className={inputClass} value={form.orgName} onChange={(e) => setForm({ ...form, orgName: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Idioma padrão">
                <select className={inputClass} value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
                  <option value="pt-BR">Português (BR)</option>
                  <option value="es-ES">Español</option>
                  <option value="en-US">English</option>
                </select>
              </Field>
              <Field label="Fuso horário">
                <select className={inputClass} value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })}>
                  <option value="America/Sao_Paulo">America/Sao_Paulo</option>
                  <option value="America/Manaus">America/Manaus</option>
                  <option value="America/Fortaleza">America/Fortaleza</option>
                </select>
              </Field>
            </div>
            <Field label="Cor da marca">
              <div className="flex items-center gap-3">
                <input type="color" value={form.brandColor} onChange={(e) => setForm({ ...form, brandColor: e.target.value })} className="w-12 h-10 rounded border border-slate-300" />
                <input className={inputClass} value={form.brandColor} onChange={(e) => setForm({ ...form, brandColor: e.target.value })} />
              </div>
            </Field>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Segurança & Acesso</h3>
            <Field label="Tamanho mínimo de senha">
              <input type="number" min={6} max={32} className={inputClass} value={form.passwordMinLength} onChange={(e) => setForm({ ...form, passwordMinLength: Number(e.target.value) })} />
            </Field>
            <div className="flex items-center justify-between py-3 border-t border-slate-100">
              <div>
                <div className="text-sm font-medium text-slate-700">MFA obrigatório</div>
                <div className="text-xs text-slate-400">Exigir múltiplos fatores no login</div>
              </div>
              <Toggle checked={form.mfaRequired} onChange={(v) => setForm({ ...form, mfaRequired: v })} />
            </div>
            <div className="flex items-center justify-between py-3 border-t border-slate-100">
              <div>
                <div className="text-sm font-medium text-slate-700">Aprovação de matrícula</div>
                <div className="text-xs text-slate-400">Gestor aprova inscrições em cursos</div>
              </div>
              <Toggle checked={form.approvalRequired} onChange={(v) => setForm({ ...form, approvalRequired: v })} />
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Regras de negócio</h3>
            <Field label="Validade do certificado (meses)">
              <input type="number" min={1} className={inputClass} value={form.certificateValidity} onChange={(e) => setForm({ ...form, certificateValidity: Number(e.target.value) })} />
            </Field>
            <p className="text-xs text-slate-400 mt-2">
              Define quando os colaboradores precisam refazer treinamentos obrigatórios (ex.: Segurança da Informação, Compliance).
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Interface</h3>
            <Field label="Navegação">
              <select className={inputClass} value={form.layout.navStyle} onChange={(e) => setLayout({ navStyle: e.target.value as Settings["layout"]["navStyle"] })}>
                <option value="sidebar">Barra lateral</option>
                <option value="top">Menu superior com dropdowns</option>
              </select>
            </Field>
            <div className="flex items-center justify-between py-3 border-t border-slate-100">
              <div className="text-sm font-medium text-slate-700">Destaques na home</div>
              <Toggle checked={form.layout.showDestaques} onChange={(v) => setLayout({ showDestaques: v })} />
            </div>
          </Card>

          <Card className="p-6 lg:col-span-2">
            <h3 className="font-semibold text-slate-800 mb-4">Módulos funcionais</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {moduleDefinitions.map((m) => (
                <div key={m.key} className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                  <div>
                    <div className="text-sm font-medium text-slate-800">{m.label}</div>
                    <div className="text-xs text-slate-400">{m.description}</div>
                  </div>
                  <Toggle checked={form.modules[m.key]} onChange={(v) => setModule(m.key, v)} />
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Integrações externas</h3>
          <div className="space-y-3">
            {integrations.map((i) => (
              <div key={i.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200">
                <span className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 grid place-items-center shrink-0">
                  <Icon name="plug" className="w-5 h-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-800">{i.name}</div>
                  <div className="text-xs text-slate-400">{i.type} · última sinc.: {i.lastSync}</div>
                </div>
                <Badge color={statusColor[i.status]}>{i.status}</Badge>
                <button
                  type="button"
                  onClick={() => updateIntegration(i.id, { status: i.status === "conectado" ? "desconectado" : "conectado", lastSync: new Date().toLocaleString("pt-BR") })}
                  className="text-xs text-brand font-medium hover:underline shrink-0"
                >
                  {i.status === "conectado" ? "Desconectar" : "Conectar"}
                </button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-2 overflow-x-auto">
          <div className="px-4 py-3"><h3 className="font-semibold text-slate-800">Permissões por perfil</h3></div>
          <Table head={["Permissão", "Descrição", ...matrixRoles.map((r) => roleLabels[r])]}>
            {permissions.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">{p.name}</td>
                <td className="px-4 py-3 text-slate-500 text-xs max-w-xs">{p.description}</td>
                {matrixRoles.map((r) => (
                  <td key={r} className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => togglePermissionRole(p.id, r)}
                      className={`w-6 h-6 rounded-full mx-auto text-xs ${p.roles.includes(r) ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-300"}`}
                    >
                      {p.roles.includes(r) ? "✓" : "·"}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </Table>
        </Card>

        <Card className="p-2">
          <div className="px-4 py-3 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Execuções automáticas</h3>
            <Badge color="green">{scheduledJobs.filter((j) => j.enabled).length} ativos</Badge>
          </div>
          <Table head={["Job", "Agendamento", "Módulo", "Ação", "Última exec.", "Próxima", "Ativo"]}>
            {scheduledJobs.map((j) => (
              <tr key={j.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{j.name}</td>
                <td className="px-4 py-3 text-xs text-slate-600">{j.schedule}</td>
                <td className="px-4 py-3 text-xs">{j.module}</td>
                <td className="px-4 py-3 text-xs text-slate-600">{j.action}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{j.lastRun ?? "—"}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{j.nextRun ?? "—"}</td>
                <td className="px-4 py-3">
                  <Toggle checked={j.enabled} onChange={() => toggleScheduledJob(j.id)} />
                </td>
              </tr>
            ))}
          </Table>
        </Card>

        <Card className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-sm text-slate-500">As alterações são aplicadas a toda a plataforma e registradas na auditoria.</p>
          <div className="flex items-center gap-3">
            <Button type="submit">
              <Icon name="check" className="w-4 h-4" />
              Salvar alterações
            </Button>
            {saved && (
              <span className="text-sm text-blue-600 font-medium flex items-center gap-1">
                <Icon name="check" className="w-4 h-4" /> Salvo!
              </span>
            )}
          </div>
        </Card>
      </form>
    </div>
  );
}
