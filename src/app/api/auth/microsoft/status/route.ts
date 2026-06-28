import { NextResponse } from "next/server";
import { isMicrosoftAuthConfigured } from "@/lib/microsoft-auth";

export async function GET() {
  return NextResponse.json({ enabled: isMicrosoftAuthConfigured() });
}
