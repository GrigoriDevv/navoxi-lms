import { cookies } from "next/headers";
import { toSessionProfileFromMock, toSessionPayload } from "@/lib/auth-profile";
import {
  encodeSession,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  sessionCookieOptions,
} from "@/lib/auth-session";
import { isDemoLoginAllowed } from "@/lib/demo-auth-config";
import { isValidDemoPassword } from "@/lib/demo-password";
import { isDemoAccountLoginBlocked } from "@/lib/demo-account-guard";
import { resolveUserProfile } from "@/lib/session-user";

export async function handleDemoLogin(email: string, password: string) {
  if (!isDemoLoginAllowed()) {
    return {
      ok: false as const,
      status: 404,
      error: "Login demo desabilitado.",
    };
  }

  if (isDemoAccountLoginBlocked(email)) {
    return { ok: false as const, status: 401, error: "E-mail ou senha inválidos" };
  }

  if (!isValidDemoPassword(password)) {
    return { ok: false as const, status: 401, error: "E-mail ou senha inválidos" };
  }

  const profile = resolveUserProfile(email);
  const sessionPayload = toSessionPayload(
    toSessionProfileFromMock(profile),
    Date.now() + SESSION_MAX_AGE * 1000
  );

  const token = await encodeSession(sessionPayload);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions(SESSION_MAX_AGE));

  return {
    ok: true as const,
    body: {
      authenticated: true,
      id: sessionPayload.userId,
      email: sessionPayload.email,
      name: sessionPayload.name,
      role: sessionPayload.role,
      unitId: sessionPayload.unitId,
      avatarColor: sessionPayload.avatarColor,
      provider: sessionPayload.provider,
    },
  };
}
