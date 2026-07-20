import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { toSessionPayload } from "@/lib/auth-profile";
import {
  encodeSession,
  OAUTH_STATE_COOKIE,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  sessionCookieOptions,
} from "@/lib/auth-session";
import { resolveMicrosoftWithBackend } from "@/lib/lms-auth-api";
import {
  exchangeCodeForProfile,
  getAppBaseUrl,
  OAUTH_PKCE_COOKIE,
  safeEqualStrings,
} from "@/lib/microsoft-auth";

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
  const codeVerifier = cookieStore.get(OAUTH_PKCE_COOKIE)?.value;

  cookieStore.delete(OAUTH_STATE_COOKIE);
  cookieStore.delete(OAUTH_PKCE_COOKIE);

  if (
    !code ||
    !state ||
    !savedState ||
    !codeVerifier ||
    !safeEqualStrings(state, savedState)
  ) {
    loginUrl.searchParams.set("error", "Sessão de login Microsoft inválida ou expirada");
    return NextResponse.redirect(loginUrl);
  }

  try {
    const profile = await exchangeCodeForProfile(code, codeVerifier);
    const backendUser = await resolveMicrosoftWithBackend(
      profile.email,
      profile.name,
      profile.id
    );

    const sessionPayload = toSessionPayload(
      {
        userId: backendUser.id,
        email: backendUser.email,
        name: backendUser.name,
        role: backendUser.role,
        unitId: backendUser.unitId,
        avatarColor: backendUser.avatarColor,
        provider: "microsoft",
        accessToken: backendUser.accessToken,
      },
      Date.now() + SESSION_MAX_AGE * 1000
    );

    const token = await encodeSession(sessionPayload);
    cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions(SESSION_MAX_AGE));

    return NextResponse.redirect(new URL("/dashboard", baseUrl));
  } catch (e) {
    loginUrl.searchParams.set(
      "error",
      e instanceof Error
        ? e.message
        : "Falha na autenticação Microsoft"
    );
    return NextResponse.redirect(loginUrl);
  }
}
