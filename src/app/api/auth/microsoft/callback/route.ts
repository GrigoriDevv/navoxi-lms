import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  encodeSession,
  OAUTH_STATE_COOKIE,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth-session";
import { exchangeCodeForProfile, getAppBaseUrl } from "@/lib/microsoft-auth";

const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 dias

export async function GET(request: NextRequest) {
  const baseUrl = getAppBaseUrl();
  const loginUrl = new URL("/login", baseUrl);

  const error = request.nextUrl.searchParams.get("error");
  if (error) {
    loginUrl.searchParams.set(
      "error",
      request.nextUrl.searchParams.get("error_description") ?? error
    );
    return NextResponse.redirect(loginUrl);
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const cookieStore = await cookies();
  const savedState = cookieStore.get(OAUTH_STATE_COOKIE)?.value;

  cookieStore.delete(OAUTH_STATE_COOKIE);

  if (!code || !state || !savedState || state !== savedState) {
    loginUrl.searchParams.set("error", "Sessão de login Microsoft inválida ou expirada");
    return NextResponse.redirect(loginUrl);
  }

  try {
    const profile = await exchangeCodeForProfile(code);
    const token = encodeSession({
      email: profile.email,
      name: profile.name,
      provider: "microsoft",
      exp: Date.now() + SESSION_MAX_AGE * 1000,
    });

    cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions(SESSION_MAX_AGE));

    return NextResponse.redirect(new URL("/dashboard", baseUrl));
  } catch (e) {
    loginUrl.searchParams.set(
      "error",
      e instanceof Error ? e.message : "Falha na autenticação Microsoft"
    );
    return NextResponse.redirect(loginUrl);
  }
}
