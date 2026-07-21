/** Feature flag: quando true, cursos/aulas/progresso vêm do backend Java via BFF. */
export function isJavaApiEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_JAVA_API === "true";
}

/** @deprecated Use `isJavaApiEnabled` — nome antigo dispara falso positivo do eslint react-hooks. */
export const useJavaApi = isJavaApiEnabled;

const WEAK_API_TOKENS = new Set([
  "local-dev-token",
  "changeme",
  "change-me",
  "secret",
  "password",
  "token",
  "apikey",
  "api-token",
]);

export function isWeakLmsApiToken(token: string | undefined | null): boolean {
  if (!token || !token.trim()) return true;
  const normalized = token.trim().toLowerCase();
  if (WEAK_API_TOKENS.has(normalized) || normalized.startsWith("local-dev")) return true;
  return token.trim().length < 24;
}

/**
 * Base URL usada pelo browser — always same-origin BFF.
 * Server-side proxies use LMS_API_URL + LMS_API_TOKEN.
 */
export function apiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return "";
  }
  return (process.env.LMS_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080").replace(
    /\/$/,
    ""
  );
}

export function lmsApiUpstreamUrl(): string {
  return (process.env.LMS_API_URL ?? "http://localhost:8080").replace(/\/$/, "");
}

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
