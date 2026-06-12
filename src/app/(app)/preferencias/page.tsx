"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { PageHeader, Card, Field, inputClass, Button } from "@/components/ui";
import { Icon } from "@/components/Icon";

export default function PreferenciasPage() {
  const { preferences, updatePreferences } = useApp();
  const [form, setForm] = useState(preferences);
  const [saved, setSaved] = useState(false);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    updatePreferences(form);
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
      className={`w-11 h-6 rounded-full transition relative ${checked ? "bg-brand" : "bg-slate-300"}`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition ${checked ? "left-[22px]" : "left-0.5"}`}
      />
    </button>
  );

  return (
    <div>
      <PageHeader
        title="Preferências"
        subtitle="Personalização da experiência por usuário autenticado"
      />

      <form onSubmit={save} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Aparência</h3>
          <Field label="Tema da interface">
            <select
              className={inputClass}
              value={form.theme}
              onChange={(e) =>
                setForm({ ...form, theme: e.target.value as typeof form.theme })
              }
            >
              <option value="light">Claro</option>
              <option value="dark">Escuro</option>
              <option value="system">Sistema</option>
            </select>
          </Field>
          <div className="flex items-center justify-between py-3 border-t border-slate-100">
            <div>
              <div className="text-sm font-medium text-slate-700">Sidebar compacta</div>
              <div className="text-xs text-slate-400">Reduz largura do menu lateral</div>
            </div>
            <Toggle
              checked={form.compactSidebar}
              onChange={(v) => setForm({ ...form, compactSidebar: v })}
            />
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Idioma e notificações</h3>
          <Field label="Idioma">
            <select
              className={inputClass}
              value={form.language}
              onChange={(e) => setForm({ ...form, language: e.target.value })}
            >
              <option value="pt-BR">Português (BR)</option>
              <option value="es-ES">Español</option>
              <option value="en-US">English</option>
            </select>
          </Field>
          <div className="flex items-center justify-between py-3 border-t border-slate-100">
            <div>
              <div className="text-sm font-medium text-slate-700">Notificações por e-mail</div>
            </div>
            <Toggle
              checked={form.emailNotifications}
              onChange={(v) => setForm({ ...form, emailNotifications: v })}
            />
          </div>
          <div className="flex items-center justify-between py-3 border-t border-slate-100">
            <div>
              <div className="text-sm font-medium text-slate-700">Notificações push</div>
            </div>
            <Toggle
              checked={form.pushNotifications}
              onChange={(v) => setForm({ ...form, pushNotifications: v })}
            />
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            As preferências são salvas localmente nesta sessão de demonstração.
          </p>
          <div className="flex items-center gap-3">
            <Button type="submit">
              <Icon name="check" className="w-4 h-4" />
              Salvar preferências
            </Button>
            {saved && (
              <span className="text-sm text-emerald-600 font-medium">Salvo!</span>
            )}
          </div>
        </Card>
      </form>
    </div>
  );
}
