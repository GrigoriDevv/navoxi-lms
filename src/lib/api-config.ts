/** Feature flag: quando true, cursos/aulas/progresso vêm do backend Java via BFF. */
export function isJavaApiEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_JAVA_API === "true";
}

/** @deprecated Use `isJavaApiEnabled` — nome antigo dispara falso positivo do eslint react-hooks. */
export const useJavaApi = isJavaApiEnabled;

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
  return process.env.LMS_API_TOKEN ?? "local-dev-token";
}
