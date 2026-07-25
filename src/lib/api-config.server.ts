import "server-only";

import { isWeakLmsApiToken } from "./api-config";

/** Upstream Java base URL para proxies server-side (BFF). Nunca exposto ao browser. */
export function lmsApiUpstreamUrl(): string {
  return (process.env.LMS_API_URL ?? "http://localhost:8080").replace(/\/$/, "");
}

/**
 * Token de API Next → Java, restrito às rotas `/api/v1/auth/**`.
 * Server-only: só existe no runtime do servidor, nunca no bundle client
 * (sem `NEXT_PUBLIC_`). Importar este módulo em código client quebra o build.
 */
export function lmsApiToken(): string {
  const fromEnv = process.env.LMS_API_TOKEN;
  const token = fromEnv ?? "local-dev-token";
  if (process.env.NODE_ENV === "production" && isWeakLmsApiToken(fromEnv ?? token)) {
    throw new Error(
      "LMS_API_TOKEN fraco ou ausente em produção — defina um secret forte (≥24 chars), sem local-dev-token"
    );
  }
  return token;
}
