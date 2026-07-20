import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decodeSession, SESSION_COOKIE } from "@/lib/auth-session";
import { buildMicrosoftLogoutUrl, getAppBaseUrl } from "@/lib/microsoft-auth";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  let microsoftLogoutUrl: string | null = null;

  if (token) {
    const session = await decodeSession(token);
    if (session?.provider === "microsoft") {
      microsoftLogoutUrl = buildMicrosoftLogoutUrl(`${getAppBaseUrl()}/login`);
    }
  }

  cookieStore.delete(SESSION_COOKIE);

  return NextResponse.json({
    ok: true,
    microsoftLogoutUrl,
  });
}
