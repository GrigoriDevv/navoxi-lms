"use client";

import { useState } from "react";
import { Button, Card, Field, inputClass } from "@/components/ui";

export default function PrimeiroAcessoPage() {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (password !== confirmation) {
      setError("As senhas não coincidem.");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch("/api/auth/first-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) throw new Error(data?.error || "Não foi possível definir a senha.");
      window.location.replace("/dashboard");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível definir a senha.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 grid place-items-center p-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold text-slate-900">Defina sua senha</h1>
        <p className="text-sm text-slate-500 mt-1 mb-6">
          Este é seu primeiro acesso. Crie uma senha pessoal para continuar.
        </p>
        <form onSubmit={submit}>
          <Field label="Nova senha">
            <input required minLength={10} maxLength={72} type="password" autoComplete="new-password" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          <Field label="Confirmar nova senha">
            <input required minLength={10} maxLength={72} type="password" autoComplete="new-password" className={inputClass} value={confirmation} onChange={(e) => setConfirmation(e.target.value)} />
          </Field>
          {error && <p role="alert" className="text-sm text-red-600 mb-3">{error}</p>}
          <Button type="submit" disabled={saving} className="w-full justify-center">
            {saving ? "Salvando…" : "Definir senha e continuar"}
          </Button>
        </form>
      </Card>
    </main>
  );
}
