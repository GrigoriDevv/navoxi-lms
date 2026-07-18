"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/lib/store";
import { roleLabels, roleDescriptions, unitLabels } from "@/lib/rbac";
import { users } from "@/lib/mock-data";
import { Icon } from "@/components/Icon";
import { Badge } from "@/components/ui";
import { MicrosoftSignInButton } from "@/components/auth/MicrosoftSignInButton";

const demoEmails = [
  "ana.souza@navoxi.com",
  "bruno.ferreira@navoxi.com",
  "carla.mendes@navoxi.com",
  "henrique.castro@navoxi.com",
  "diego.alves@navoxi.com",
];

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white text-slate-500 text-sm">
          Carregando…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useApp();
  const [email, setEmail] = useState("diego.alves@navoxi.com");
  const [password, setPassword] = useState("demo1234");
  const [mfa, setMfa] = useState(false);
  const [microsoftEnabled, setMicrosoftEnabled] = useState(false);
  const authError = searchParams.get("error");

  useEffect(() => {
    fetch("/api/auth/microsoft/status")
      .then((r) => r.json())
      .then((data: { enabled?: boolean }) => setMicrosoftEnabled(!!data.enabled))
      .catch(() => setMicrosoftEnabled(false));
  }, []);

  const selectedUser = users.find((u) => u.email === email);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, { provider: "password" });
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-white relative overflow-hidden bg-gradient-to-br from-[#1d4ed8] via-[#2563eb] to-[#0f172a]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur grid place-items-center font-bold text-xl">
            N
          </div>
          <span className="text-xl font-semibold tracking-tight">Navoxi</span>
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold leading-tight">
            Plataforma para<br />Sistema Inteligente
          </h1>
          <p className="mt-4 text-white/80 max-w-md">
            Controle de acesso por perfil e unidade — menus, funcionalidades e
            permissões conforme o papel do usuário autenticado.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {["RBAC", "Multi-unidade", "Compliance", "Analytics", "SSO"].map((t) => (
              <span key={t} className="px-3 py-1 rounded-full bg-white/15 text-sm">
                {t}
              </span>
            ))}
          </div>
        </div>
        <p className="text-white/60 text-sm relative z-10">
          © 2026 Navoxi · Ambiente de demonstração (MVP)
        </p>
        <div className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full bg-white/10 blur-2xl" />
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <form onSubmit={submit} className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 text-white grid place-items-center font-bold shadow-sm">
              N
            </div>
            <span className="text-lg font-semibold">Sistema Inteligente</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Acessar plataforma</h2>
          <p className="text-sm text-slate-500 mt-1">
            O perfil e a unidade são definidos pelo cadastro do usuário.
          </p>

          {authError && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {authError}
            </div>
          )}

          <div className="mt-6">
            <MicrosoftSignInButton enabled={microsoftEnabled} />
            <p className="mt-2 text-[11px] text-slate-400 text-center">
              Identidade verificada pela Microsoft (Entra ID)
            </p>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-slate-400">ou entre com e-mail</span>
            </div>
          </div>

          <label className="block text-sm font-medium text-slate-700">
            E-mail corporativo
          </label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            placeholder="nome@navoxi.com"
            className="mt-1 w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none text-sm"
          />

          {selectedUser && (
            <div className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-200 text-sm">
              <div className="font-medium text-slate-800">{roleLabels[selectedUser.role]}</div>
              <div className="text-xs text-slate-500 mt-0.5">{roleDescriptions[selectedUser.role]}</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge color="green">{unitLabels[selectedUser.unitId]}</Badge>
              </div>
            </div>
          )}

          <label className="block mt-4 text-sm font-medium text-slate-700">
            Senha
          </label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            className="mt-1 w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none text-sm"
          />

          <label className="mt-4 flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={mfa}
              onChange={(e) => setMfa(e.target.checked)}
              className="rounded border-slate-300 text-brand focus:ring-brand"
            />
            Autenticação multifator (MFA)
          </label>

          <button
            type="submit"
            className="mt-6 w-full py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold text-sm transition flex items-center justify-center gap-2 shadow-sm"
          >
            <Icon name="logout" className="w-4 h-4" />
            Entrar
          </button>

          <div className="mt-6">
            <p className="text-xs text-slate-400 mb-2">Acesso rápido por perfil (demo):</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {demoEmails.map((demoEmail) => {
                const u = users.find((x) => x.email === demoEmail)!;
                return (
                  <button
                    key={demoEmail}
                    type="button"
                    onClick={() => setEmail(demoEmail)}
                    className={`text-left px-3 py-2.5 rounded-lg border text-xs transition ${
                      email === demoEmail
                        ? "border-brand bg-blue-50/60"
                        : "border-slate-200 hover:border-brand hover:bg-blue-50/50"
                    }`}
                  >
                    <span className="font-medium text-slate-700 block">
                      {roleLabels[u.role]}
                    </span>
                    <span className="text-slate-400 truncate block">{u.email}</span>
                    <span className="text-slate-400 block">{unitLabels[u.unitId]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
