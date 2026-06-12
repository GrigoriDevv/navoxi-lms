"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { matrixRoles } from "@/lib/mock-data";
import { moduleDefinitions } from "@/lib/platform-config";
import { roleLabels } from "@/lib/rbac";
import { PageHeader, Card, Field, inputClass, Button, Badge, Table } from "@/components/ui";
import { Icon } from "@/components/Icon";
import type { Role, Settings } from "@/lib/types";

type Tab = "geral" | "modulos" | "interface" | "integracoes" | "permissoes" | "jobs";

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
  const [tab, setTab] = useState<Tab>("geral");
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);

  const save = (e?: React.FormEvent) => {
    e?.preventDefault();
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button type="button" onClick={() => onChange(!checked)} className={`w-11 h-6 rounded-full transition relative ${checked ? "bg-brand" : "bg-slate-300"}`}>
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition ${checked ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );

  const tabs: { id: Tab; label: string }[] = [
    { id: "geral", label: "Geral" },
    { id: "modulos", label: "Módulos" },
    { id: "interface", label: "Interface" },
    { id: "integracoes", label: "Integrações" },
    { id: "permissoes", label: "Permissões" },
    { id: "jobs", label: "Jobs agendados" },
  ];

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
        subtitle="Parâmetros gerais, módulos, interface, integrações, permissões e jobs (RF-065 a RF-070)"
      />

      <div className="flex flex-wrap gap-1 mb-4 border-b border-slate-200">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${
              tab === t.id ? "border-brand text-brand" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "geral" && (
        <form onSubmit={save} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Organização (RF-065)</h3>
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
                  <option value="America/Recife">America/Recife</option>
                  <option value="America/Sao_Paulo">America/Sao_Paulo</option>
                  <option value="America/Bahia">America/Bahia</option>
                </select>
              </Field>
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Segurança & regras</h3>
            <Field label="Tamanho mínimo de senha">
              <input type="number" min={6} max={32} className={inputClass} value={form.passwordMinLength} onChange={(e) => setForm({ ...form, passwordMinLength: Number(e.target.value) })} />
            </Field>
            <div className="flex items-center justify-between py-3 border-t border-slate-100">
              <div><div className="text-sm font-medium text-slate-700">MFA obrigatório</div></div>
              <Toggle checked={form.mfaRequired} onChange={(v) => setForm({ ...form, mfaRequired: v })} />
            </div>
            <div className="flex items-center justify-between py-3 border-t border-slate-100">
              <div><div className="text-sm font-medium text-slate-700">Aprovação de matrícula</div></div>
              <Toggle checked={form.approvalRequired} onChange={(v) => setForm({ ...form, approvalRequired: v })} />
            </div>
            <Field label="Validade do certificado (meses)">
              <input type="number" min={1} className={inputClass} value={form.certificateValidity} onChange={(e) => setForm({ ...form, certificateValidity: Number(e.target.value) })} />
            </Field>
          </Card>
          <Card className="p-6 lg:col-span-2 flex items-center justify-between">
            <p className="text-sm text-slate-500">Alterações registradas na auditoria.</p>
            <div className="flex items-center gap-3">
              <Button type="submit"><Icon name="check" className="w-4 h-4" />Salvar</Button>
              {saved && <span className="text-sm text-emerald-600 font-medium">Salvo!</span>}
            </div>
          </Card>
        </form>
      )}

      {tab === "modulos" && (
        <Card className="p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Módulos funcionais (RF-066)</h3>
          <div className="space-y-4">
            {moduleDefinitions.map((m) => (
              <div key={m.key} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                <div>
                  <div className="font-medium text-slate-800">{m.label}</div>
                  <div className="text-xs text-slate-500">{m.description}</div>
                </div>
                <Toggle checked={form.modules[m.key]} onChange={(v) => setModule(m.key, v)} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === "interface" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Layout & navegação (RF-067 · RF-071)</h3>
            <Field label="Estilo de navegação">
              <select className={inputClass} value={form.layout.navStyle} onChange={(e) => setLayout({ navStyle: e.target.value as Settings["layout"]["navStyle"] })}>
                <option value="top">Menu superior com dropdowns</option>
                <option value="sidebar">Barra lateral</option>
              </select>
            </Field>
            <Field label="Densidade">
              <select className={inputClass} value={form.layout.density} onChange={(e) => setLayout({ density: e.target.value as Settings["layout"]["density"] })}>
                <option value="comfortable">Confortável</option>
                <option value="compact">Compacto</option>
              </select>
            </Field>
            <div className="flex items-center justify-between py-3 border-t border-slate-100">
              <div><div className="text-sm font-medium text-slate-700">Destaques na home</div></div>
              <Toggle checked={form.layout.showDestaques} onChange={(v) => setLayout({ showDestaques: v })} />
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Identidade visual</h3>
            <Field label="Cor da marca">
              <div className="flex items-center gap-3">
                <input type="color" value={form.brandColor} onChange={(e) => { setForm({ ...form, brandColor: e.target.value }); updateSettings({ brandColor: e.target.value }); }} className="w-12 h-10 rounded border border-slate-300" />
                <input className={inputClass} value={form.brandColor} onChange={(e) => { setForm({ ...form, brandColor: e.target.value }); updateSettings({ brandColor: e.target.value }); }} />
              </div>
            </Field>
          </Card>
        </div>
      )}

      {tab === "integracoes" && (
        <Card className="p-2">
          <div className="px-4 py-3"><h3 className="font-semibold text-slate-800">Integrações externas (RF-068)</h3></div>
          <Table head={["Integração", "Tipo", "Status", "Última sync", "Ações"]}>
            {integrations.map((i) => (
              <tr key={i.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{i.name}</td>
                <td className="px-4 py-3 text-slate-600">{i.type}</td>
                <td className="px-4 py-3"><Badge color={statusColor[i.status]}>{i.status}</Badge></td>
                <td className="px-4 py-3 text-xs text-slate-500">{i.lastSync}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => updateIntegration(i.id, { status: i.status === "conectado" ? "desconectado" : "conectado", lastSync: new Date().toLocaleString("pt-BR") })}
                    className="text-xs text-brand font-medium hover:underline"
                  >
                    {i.status === "conectado" ? "Desconectar" : "Conectar"}
                  </button>
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      )}

      {tab === "permissoes" && (
        <Card className="p-2 overflow-x-auto">
          <div className="px-4 py-3"><h3 className="font-semibold text-slate-800">Permissões por perfil e escopo (RF-069)</h3></div>
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
                      className={`w-6 h-6 rounded-full mx-auto transition ${p.roles.includes(r) ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-300"}`}
                    >
                      {p.roles.includes(r) ? "✓" : "·"}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </Table>
        </Card>
      )}

      {tab === "jobs" && (
        <Card className="p-2">
          <div className="px-4 py-3 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Execuções automáticas (RF-070)</h3>
            <Badge color="green">{scheduledJobs.filter((j) => j.enabled).length} ativos</Badge>
          </div>
          <Table head={["Job", "Agendamento", "Módulo", "Ação", "Última exec.", "Próxima", "Status"]}>
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
      )}
    </div>
  );
}
