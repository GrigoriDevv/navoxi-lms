"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { PageHeader, Card, Field, inputClass, Button } from "@/components/ui";
import { Icon } from "@/components/Icon";

export default function ConfiguracoesPage() {
  const { settings, updateSettings } = useApp();
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const Toggle = ({
    checked,
    onChange,
  }: {
    checked: boolean;
    onChange: (v: boolean) => void;
  }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full transition relative ${
        checked ? "bg-brand" : "bg-slate-300"
      }`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition ${
          checked ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );

  return (
    <div>
      <PageHeader
        title="Configurações & Parametrização"
        subtitle="Parâmetros globais, identidade visual, políticas e regras de negócio"
      />

      <form onSubmit={save} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                <option value="America/Recife">America/Recife</option>
                <option value="America/Sao_Paulo">America/Sao_Paulo</option>
                <option value="America/Bahia">America/Bahia</option>
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
            Define quando os colaboradores precisam refazer treinamentos obrigatórios (ex.: NR-10, Compliance).
          </p>
        </Card>

        <Card className="p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-slate-800 mb-2">Salvar parâmetros</h3>
            <p className="text-sm text-slate-500">
              As alterações são aplicadas a toda a plataforma e registradas na auditoria.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Button type="submit">
              <Icon name="check" className="w-4 h-4" />
              Salvar alterações
            </Button>
            {saved && (
              <span className="text-sm text-emerald-600 font-medium flex items-center gap-1">
                <Icon name="check" className="w-4 h-4" /> Salvo!
              </span>
            )}
          </div>
        </Card>
      </form>
    </div>
  );
}
