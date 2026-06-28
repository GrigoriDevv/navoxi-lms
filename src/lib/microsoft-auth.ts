export interface MicrosoftAuthConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  redirectUri: string;
}

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

export function getMicrosoftAuthConfig(): MicrosoftAuthConfig | null {
  const clientId = process.env.AZURE_AD_CLIENT_ID;
  const clientSecret = process.env.AZURE_AD_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const tenantId = process.env.AZURE_AD_TENANT_ID ?? "common";
  const redirectUri = `${getAppBaseUrl()}/api/auth/microsoft/callback`;

  return { clientId, clientSecret, tenantId, redirectUri };
}

export function isMicrosoftAuthConfigured(): boolean {
  return getMicrosoftAuthConfig() !== null;
}

export function buildMicrosoftAuthorizeUrl(state: string): string {
  const config = getMicrosoftAuthConfig();
  if (!config) throw new Error("Microsoft SSO não configurado");

  const params = new URLSearchParams({
    client_id: config.clientId,
    response_type: "code",
    redirect_uri: config.redirectUri,
    response_mode: "query",
    scope: "openid profile email User.Read",
    state,
    prompt: "select_account",
  });

  return `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/authorize?${params}`;
}

export interface MicrosoftProfile {
  email: string;
  name: string;
  id: string;
}

export async function exchangeCodeForProfile(
  code: string
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
      }),
    }
  );

  const tokens = (await tokenRes.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };

  if (!tokenRes.ok || !tokens.access_token) {
    throw new Error(
      tokens.error_description ?? tokens.error ?? "Falha ao obter token Microsoft"
    );
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

  return {
    email,
    name: profile.displayName ?? email.split("@")[0],
    id: profile.id ?? email,
  };
}
