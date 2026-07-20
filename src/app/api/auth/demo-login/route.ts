import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  encodeSession,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  sessionCookieOptions,
} from "@/lib/auth-session";
import { isValidDemoPassword } from "@/lib/demo-password";
import { resolveUserProfile } from "@/lib/session-user";

export async function POST(request: NextRequest) {
  let body: { email?: string; name?: string; password?: string };
  try {
    body = (await request.json()) as {
      email?: string;
      name?: string;
      password?: string;
    };
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const email = body.email?.trim();
  if (!email) {
    return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 });
  }

  if (!isValidDemoPassword(body.password)) {
    return NextResponse.json(
      { error: "E-mail ou senha inválidos" },
      { status: 401 }
    );
  }

  const profile = resolveUserProfile(email, body.name);
  const token = await encodeSession({
    email: profile.email,
    name: profile.name,
    role: profile.role,
    provider: "password",
    exp: Date.now() + SESSION_MAX_AGE * 1000,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions(SESSION_MAX_AGE));

  return NextResponse.json({
    authenticated: true,
    email: profile.email,
    name: profile.name,
    role: profile.role,
    provider: "password",
  });
}
