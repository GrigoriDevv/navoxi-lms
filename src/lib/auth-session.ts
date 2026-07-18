import type { Role } from "./types";

export const SESSION_COOKIE = "navoxi-auth-session";
export const OAUTH_STATE_COOKIE = "navoxi-ms-oauth-state";

export type AuthProvider = "microsoft" | "password";

export interface SessionPayload {
  email: string;
  name: string;
  role: Role;
  provider: AuthProvider;
  exp: number;
}

function getSecret(): string {
  const secret = process.env.AUTH_SECRET ?? process.env.AZURE_AD_CLIENT_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET é obrigatório em produção");
  }
  return "navoxi-dev-secret-change-in-production";
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  const b64 =
    typeof btoa !== "undefined"
      ? btoa(binary)
      : Buffer.from(bytes).toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): Uint8Array {
  const b64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  if (typeof atob !== "undefined") {
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }
  return new Uint8Array(Buffer.from(padded, "base64"));
}

async function importKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function sign(data: string): Promise<string> {
  const key = await importKey();
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return toBase64Url(new Uint8Array(sig));
}

async function verify(data: string, signature: string): Promise<boolean> {
  const key = await importKey();
  const sigBytes = fromBase64Url(signature);
  return crypto.subtle.verify(
    "HMAC",
    key,
    sigBytes.buffer as ArrayBuffer,
    new TextEncoder().encode(data)
  );
}

export async function encodeSession(payload: SessionPayload): Promise<string> {
  const json = JSON.stringify(payload);
  const data = toBase64Url(new TextEncoder().encode(json));
  const sig = await sign(data);
  return `${data}.${sig}`;
}

export async function decodeSession(token: string): Promise<SessionPayload | null> {
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  try {
    if (!(await verify(data, sig))) return null;
    const json = new TextDecoder().decode(fromBase64Url(data));
    const payload = JSON.parse(json) as SessionPayload;
    if (!payload.email || !payload.role || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function createOAuthState(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return toBase64Url(bytes);
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

export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;
