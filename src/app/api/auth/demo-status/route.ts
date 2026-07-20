import { NextResponse } from "next/server";
import { isDemoAuthEnabled } from "@/lib/demo-auth-config";

export async function GET() {
  return NextResponse.json({ enabled: isDemoAuthEnabled() });
}
