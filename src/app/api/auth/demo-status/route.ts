import { NextResponse } from "next/server";
import { isDemoLoginAllowed } from "@/lib/demo-auth-config";

export async function GET() {
  const allowed = isDemoLoginAllowed();
  return NextResponse.json({ enabled: allowed, allowed });
}
