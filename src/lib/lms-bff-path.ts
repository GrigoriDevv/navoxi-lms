/** Allowlist de paths do BFF `/api/lms/*` → Java `/api/v1/*`. */
export const LMS_BFF_ALLOWED_PREFIXES = [
  "courses",
  "lessons",
  "modules",
  "users",
  "enrollment-requests",
  "enrollments",
] as const;

export function isAllowedLmsPath(segments: string[]): boolean {
  if (segments.length === 0) return false;
  if (segments.some((s) => s.includes("..") || s.includes("\\") || s.includes("\0"))) {
    return false;
  }
  const joined = segments.join("/");
  return LMS_BFF_ALLOWED_PREFIXES.some(
    (prefix) => joined === prefix || joined.startsWith(`${prefix}/`)
  );
}

/** Regra de sessão do BFF antes de proxy (testável sem Next). */
export function bffSessionGateError(
  session: { accessToken?: string } | null | undefined
): "unauthenticated" | "invalid" | "missing_access_token" | null {
  if (session === undefined) return "unauthenticated";
  if (session === null) return "invalid";
  if (!session.accessToken) return "missing_access_token";
  return null;
}
