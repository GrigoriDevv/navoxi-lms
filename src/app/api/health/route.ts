import { NextResponse } from "next/server";

/** Probe leve para Railway — só confirma que o processo Next está vivo. */
export async function GET() {
  return NextResponse.json({ status: "ok" });
}
