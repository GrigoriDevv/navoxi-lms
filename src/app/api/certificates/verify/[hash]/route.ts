import { NextResponse } from "next/server";
import { lmsApiUpstreamUrl } from "@/lib/api-config.server";

type Params = { params: Promise<{ hash: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { hash } = await params;
  if (!hash || hash.includes("..") || hash.includes("/")) {
    return NextResponse.json({ error: "Hash inválido" }, { status: 400 });
  }

  const upstream = `${lmsApiUpstreamUrl()}/api/v1/certificates/verify/${encodeURIComponent(hash)}`;
  const res = await fetch(upstream, { cache: "no-store" });
  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
