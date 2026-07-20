import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  createOAuthState,
  OAUTH_STATE_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth-session";
import {
  buildMicrosoftAuthorizeUrl,
  createPkcePair,
  getMicrosoftAuthConfig,
  OAUTH_PKCE_COOKIE,
} from "@/lib/microsoft-auth";

export async function GET() {
  const config = getMicrosoftAuthConfig();
  if (!config) {
    return NextResponse.json(
      {
        error:
          "Microsoft Entra ID não configurado. Defina AZURE_AD_CLIENT_ID e AZURE_AD_CLIENT_SECRET.",
      },
      { status: 503 }
    );
  }

  const state = createOAuthState();
  const { verifier, challenge } = createPkcePair();
  const cookieStore = await cookies();
  const cookieOpts = { ...sessionCookieOptions(600), httpOnly: true };

  cookieStore.set(OAUTH_STATE_COOKIE, state, cookieOpts);
  cookieStore.set(OAUTH_PKCE_COOKIE, verifier, cookieOpts);

  return NextResponse.redirect(buildMicrosoftAuthorizeUrl(state, challenge));
}
