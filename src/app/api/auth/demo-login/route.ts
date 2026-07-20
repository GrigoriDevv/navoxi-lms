import { NextRequest, NextResponse } from "next/server";
import { isDemoAuthEnabled } from "@/lib/demo-auth-config";
import { handleDemoLogin } from "@/lib/demo-login-handler";

export async function POST(request: NextRequest) {
  if (!isDemoAuthEnabled()) {
    return NextResponse.json(
      { error: "Login demo desabilitado. Use /api/auth/login." },
      { status: 404 }
    );
  }

  let body: { email?: string; password?: string };
  try {
    body = (await request.json()) as { email?: string; password?: string };
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const email = body.email?.trim();
  if (!email || !body.password) {
    return NextResponse.json(
      { error: "E-mail e senha são obrigatórios" },
      { status: 400 }
    );
  }

  const result = await handleDemoLogin(email, body.password);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json(result.body);
}
