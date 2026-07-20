import { createHash, timingSafeEqual } from "crypto";

export interface MicrosoftAuthConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  redirectUri: string;
}

export const OAUTH_PKCE_COOKIE = "navoxi-ms-oauth-pkce";

export function getAppBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

function resolveTenantId(): string {
  const tenantId = process.env.AZURE_AD_TENANT_ID ?? "common";
  if (process.env.NODE_ENV === "production" && tenantId === "common") {
    throw new Error(
      "AZURE_AD_TENANT_ID deve ser o ID do tenant em produção (não use 'common')"
    );
  }
  return tenantId;
}

export function getMicrosoftAuthConfig(): MicrosoftAuthConfig | null {
  const clientId = process.env.AZURE_AD_CLIENT_ID;
  const clientSecret = process.env.AZURE_AD_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  try {
    const tenantId = resolveTenantId();
    if (process.env.NODE_ENV === "production") {
      const allowedDomain = process.env.AUTH_ALLOWED_EMAIL_DOMAIN?.trim();
      if (!allowedDomain) {
        throw new Error(
          "AUTH_ALLOWED_EMAIL_DOMAIN é obrigatório em produção com Microsoft SSO"
        );
      }
    }
    const redirectUri = `${getAppBaseUrl()}/api/auth/microsoft/callback`;
    return { clientId, clientSecret, tenantId, redirectUri };
  } catch {
    return null;
  }
}

export function isMicrosoftAuthConfigured(): boolean {
  return getMicrosoftAuthConfig() !== null;
}

/** Password form remains available as break-glass for local/both accounts. */
export function isPasswordBreakGlassVisible(): boolean {
  return true;
}

function toBase64Url(bytes: Uint8Array): string {
  return Buffer.from(bytes)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function createPkcePair(): { verifier: string; challenge: string } {
  const verifierBytes = new Uint8Array(32);
  crypto.getRandomValues(verifierBytes);
  const verifier = toBase64Url(verifierBytes);
  const challenge = toBase64Url(
    new Uint8Array(createHash("sha256").update(verifier).digest())
  );
  return { verifier, challenge };
}

export function buildMicrosoftAuthorizeUrl(
  state: string,
  codeChallenge: string
): string {
  const config = getMicrosoftAuthConfig();
  if (!config) throw new Error("Microsoft SSO não configurado");

  const params = new URLSearchParams({
    client_id: config.clientId,
    response_type: "code",
    redirect_uri: config.redirectUri,
    response_mode: "query",
    scope: "openid profile email User.Read",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    prompt: "select_account",
  });

  return `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/authorize?${params}`;
}

export function buildMicrosoftLogoutUrl(postLogoutRedirectUri: string): string {
  const config = getMicrosoftAuthConfig();
  if (!config) {
    return postLogoutRedirectUri;
  }
  const params = new URLSearchParams({
    post_logout_redirect_uri: postLogoutRedirectUri,
  });
  return `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/logout?${params}`;
}

export interface MicrosoftProfile {
  email: string;
  name: string;
  id: string;
}

function decodeJwtPayload(idToken: string): Record<string, unknown> {
  const parts = idToken.split(".");
  if (parts.length < 2) throw new Error("id_token inválido");
  const payload = parts[1]!.replace(/-/g, "+").replace(/_/g, "/");
  const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
  return JSON.parse(Buffer.from(padded, "base64").toString("utf8")) as Record<
    string,
    unknown
  >;
}

function validateIdToken(idToken: string, config: MicrosoftAuthConfig): void {
  const payload = decodeJwtPayload(idToken);
  const now = Math.floor(Date.now() / 1000);
  const exp = typeof payload.exp === "number" ? payload.exp : 0;
  if (exp <= now) throw new Error("Sessão Microsoft expirada");

  const aud = payload.aud;
  if (aud !== config.clientId) {
    throw new Error("Token Microsoft com audience inválida");
  }

  const iss = String(payload.iss ?? "");
  if (!iss.includes(config.tenantId) && config.tenantId !== "common") {
    throw new Error("Token Microsoft com issuer inválido");
  }
}

function assertAllowedEmailDomain(email: string): void {
  const allowed = process.env.AUTH_ALLOWED_EMAIL_DOMAIN?.trim().toLowerCase();
  if (process.env.NODE_ENV === "production" && !allowed) {
    throw new Error("AUTH_ALLOWED_EMAIL_DOMAIN é obrigatório em produção");
  }
  if (!allowed) return;
  const domain = email.split("@")[1]?.toLowerCase();
  if (domain !== allowed) {
    throw new Error("Domínio de e-mail não autorizado para esta organização");
  }
}

export async function exchangeCodeForProfile(
  code: string,
  codeVerifier: string
): Promise<MicrosoftProfile> {
  const config = getMicrosoftAuthConfig();
  if (!config) throw new Error("Microsoft SSO não configurado");

  const tokenRes = await fetch(
    `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        redirect_uri: config.redirectUri,
        grant_type: "authorization_code",
        code_verifier: codeVerifier,
      }),
    }
  );

  const tokens = (await tokenRes.json()) as {
    access_token?: string;
    id_token?: string;
    error?: string;
    error_description?: string;
  };

  if (!tokenRes.ok || !tokens.access_token) {
    throw new Error(
      tokens.error_description ?? tokens.error ?? "Falha ao obter token Microsoft"
    );
  }

  if (tokens.id_token) {
    validateIdToken(tokens.id_token, config);
  }

  const userRes = await fetch("https://graph.microsoft.com/v1.0/me", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  const profile = (await userRes.json()) as {
    id?: string;
    displayName?: string;
    mail?: string;
    userPrincipalName?: string;
  };

  if (!userRes.ok) {
    throw new Error("Não foi possível obter o perfil do usuário Microsoft");
  }

  const email = (
    profile.mail ??
    profile.userPrincipalName ??
    ""
  ).toLowerCase();

  if (!email) {
    throw new Error("Conta Microsoft sem e-mail verificado");
  }

  assertAllowedEmailDomain(email);

  return {
    email,
    name: profile.displayName ?? email.split("@")[0],
    id: profile.id ?? email,
  };
}

/** Comparação timing-safe para strings (ex.: state OAuth). */
export function safeEqualStrings(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}
