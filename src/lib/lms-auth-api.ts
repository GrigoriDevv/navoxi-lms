import type { Role, UnitId } from "./types";
import { lmsApiToken, lmsApiUpstreamUrl } from "./api-config";

export interface BackendAuthSession {
  id: string;
  email: string;
  name: string;
  role: Role;
  unitId: UnitId;
  avatarColor: string;
  provider: "password" | "microsoft";
}

export async function loginWithBackend(
  email: string,
  password: string
): Promise<BackendAuthSession> {
  const res = await fetch(`${lmsApiUpstreamUrl()}/api/v1/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${lmsApiToken()}`,
    },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  const data = (await res.json().catch(() => null)) as
    | BackendAuthSession
    | { error?: string }
    | null;

  if (!res.ok) {
    const message =
      data && "error" in data && data.error
        ? data.error
        : "E-mail ou senha inválidos";
    throw new Error(message);
  }

  if (!data || !("id" in data)) {
    throw new Error("Resposta inválida do servidor de autenticação");
  }

  return data;
}

export async function resolveMicrosoftWithBackend(
  email: string,
  name: string,
  microsoftOid?: string
): Promise<BackendAuthSession> {
  const res = await fetch(`${lmsApiUpstreamUrl()}/api/v1/auth/sso/microsoft`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${lmsApiToken()}`,
    },
    body: JSON.stringify({ email, name, microsoftOid }),
    cache: "no-store",
  });

  const data = (await res.json().catch(() => null)) as
    | BackendAuthSession
    | { error?: string }
    | null;

  if (!res.ok) {
    const message =
      data && "error" in data && data.error
        ? data.error
        : "Conta não autorizada. Solicite acesso ao administrador.";
    throw new Error(message);
  }

  if (!data || !("id" in data)) {
    throw new Error("Resposta inválida do servidor de autenticação");
  }

  return data;
}
