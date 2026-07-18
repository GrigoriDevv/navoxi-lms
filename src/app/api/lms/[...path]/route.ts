import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decodeSession, SESSION_COOKIE } from "@/lib/auth-session";
import { lmsApiToken, lmsApiUpstreamUrl } from "@/lib/api-config";

const ALLOWED_PREFIXES = ["courses", "lessons", "modules", "users/me"] as const;

function isAllowedPath(segments: string[]): boolean {
  if (segments.length === 0) return false;
  if (segments.some((s) => s.includes("..") || s.includes("\\") || s.includes("\0"))) {
    return false;
  }
  const joined = segments.join("/");
  return ALLOWED_PREFIXES.some(
    (prefix) => joined === prefix || joined.startsWith(`${prefix}/`)
  );
}

async function proxy(request: NextRequest, pathSegments: string[]) {
  if (!isAllowedPath(pathSegments)) {
    return NextResponse.json({ error: "Path não permitido" }, { status: 404 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const session = await decodeSession(token);
  if (!session) {
    return NextResponse.json({ error: "Sessão inválida" }, { status: 401 });
  }

  const upstreamPath = `/api/v1/${pathSegments.join("/")}`;
  const url = new URL(upstreamPath, lmsApiUpstreamUrl());
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  const headers = new Headers();
  headers.set("Authorization", `Bearer ${lmsApiToken()}`);
  headers.set("X-User-Email", session.email);
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);

  const init: RequestInit = {
    method: request.method,
    headers,
    cache: "no-store",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    const body = await request.arrayBuffer();
    if (body.byteLength > 0) {
      init.body = body;
    }
  }

  try {
    const upstream = await fetch(url, init);
    const responseBody = await upstream.arrayBuffer();
    const resHeaders = new Headers();
    const upstreamType = upstream.headers.get("content-type");
    if (upstreamType) resHeaders.set("content-type", upstreamType);

    return new NextResponse(responseBody, {
      status: upstream.status,
      headers: resHeaders,
    });
  } catch {
    return NextResponse.json({ error: "Falha ao contatar API LMS" }, { status: 502 });
  }
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(request, path);
}

export async function POST(request: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(request, path);
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(request, path);
}

export async function PATCH(request: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(request, path);
}

export async function DELETE(request: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(request, path);
}
