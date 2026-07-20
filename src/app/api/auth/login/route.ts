import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { toSessionPayload } from "@/lib/auth-profile";
import {
  encodeSession,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  sessionCookieOptions,
} from "@/lib/auth-session";
import { isDemoLoginAllowed } from "@/lib/demo-auth-config";
import { isDemoAccountLoginBlocked } from "@/lib/demo-account-guard";
import { handleDemoLogin } from "@/lib/demo-login-handler";
import { loginWithBackend } from "@/lib/lms-auth-api";

const GENERIC_AUTH_ERROR = "E-mail ou senha inválidos";

export async function POST(request: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = (await request.json()) as { email?: string; password?: string };
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const email = body.email?.trim();
  const password = body.password;
  if (!email || !password) {
    return NextResponse.json(
      { error: "E-mail e senha são obrigatórios" },
      { status: 400 }
    );
  }

  if (isDemoAccountLoginBlocked(email)) {
    return NextResponse.json({ error: GENERIC_AUTH_ERROR }, { status: 401 });
  }

  try {
    const backendUser = await loginWithBackend(email, password);
    const sessionPayload = toSessionPayload(
      {
        userId: backendUser.id,
        email: backendUser.email,
        name: backendUser.name,
        role: backendUser.role,
        unitId: backendUser.unitId,
        avatarColor: backendUser.avatarColor,
        provider: "password",
      },
      Date.now() + SESSION_MAX_AGE * 1000
    );

    const token = await encodeSession(sessionPayload);
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions(SESSION_MAX_AGE));

    return NextResponse.json({
      authenticated: true,
      id: sessionPayload.userId,
      email: sessionPayload.email,
      name: sessionPayload.name,
      role: sessionPayload.role,
      unitId: sessionPayload.unitId,
      avatarColor: sessionPayload.avatarColor,
      provider: sessionPayload.provider,
    });
  } catch {
    if (!isDemoLoginAllowed()) {
      return NextResponse.json({ error: GENERIC_AUTH_ERROR }, { status: 401 });
    }

    const demo = await handleDemoLogin(email, password);
    if (!demo.ok) {
      return NextResponse.json({ error: demo.error }, { status: demo.status });
    }
    return NextResponse.json(demo.body);
  }
}
