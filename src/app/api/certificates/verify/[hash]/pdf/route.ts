import { NextResponse } from "next/server";
import { lmsApiUpstreamUrl } from "@/lib/api-config.server";

type Params = { params: Promise<{ hash: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { hash } = await params;
  if (!hash || hash.includes("..") || hash.includes("/")) {
    return NextResponse.json({ error: "Hash inválido" }, { status: 400 });
  }

  const upstream = `${lmsApiUpstreamUrl()}/api/v1/certificates/verify/${encodeURIComponent(hash)}/pdf`;
  const res = await fetch(upstream, { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text();
    return new NextResponse(text || JSON.stringify({ error: "Falha ao baixar PDF" }), {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  const bytes = await res.arrayBuffer();
  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="certificado-${hash}.pdf"`,
    },
  });
}
