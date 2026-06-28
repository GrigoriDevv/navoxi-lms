import { createHmac, randomBytes, timingSafeEqual } from "crypto";

export const SESSION_COOKIE = "navoxi-auth-session";
export const OAUTH_STATE_COOKIE = "navoxi-ms-oauth-state";

export interface SessionPayload {
  email: string;
  name: string;
  provider: "microsoft";
  exp: number;
}

function getSecret(): string {
  return (
    process.env.AUTH_SECRET ??
    process.env.AZURE_AD_CLIENT_SECRET ??
    "navoxi-dev-secret-change-in-production"
  );
}

function sign(data: string): string {
  return createHmac("sha256", getSecret()).update(data).digest("base64url");
}

export function encodeSession(payload: SessionPayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${data}.${sign(data)}`;
}

export function decodeSession(token: string): SessionPayload | null {
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  const expected = sign(data);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  try {
    const payload = JSON.parse(
      Buffer.from(data, "base64url").toString("utf8")
    ) as SessionPayload;
    if (!payload.email || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function createOAuthState(): string {
  return randomBytes(24).toString("base64url");
}

export function sessionCookieOptions(maxAgeSec: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSec,
  };
}
