import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  decodeSession,
  encodeSession,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  sessionCookieOptions,
} from "@/lib/auth-session";
import { lmsApiUpstreamUrl } from "@/lib/api-config.server";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const currentToken = cookieStore.get(SESSION_COOKIE)?.value;
  const session = currentToken ? await decodeSession(currentToken) : null;
  if (!session?.accessToken || !session.passwordChangeRequired) {
    return NextResponse.json({ error: "Sessão de primeiro acesso inválida" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { password?: string } | null;
  const upstream = await fetch(`${lmsApiUpstreamUrl()}/api/v1/users/me/initial-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`,
    },
    body: JSON.stringify({ password: body?.password }),
    cache: "no-store",
  });
  const responseBody = await upstream.text();
  if (!upstream.ok) {
    return new NextResponse(responseBody, {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  const token = await encodeSession({ ...session, passwordChangeRequired: false });
  cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions(SESSION_MAX_AGE));
  return NextResponse.json({ ok: true });
}
