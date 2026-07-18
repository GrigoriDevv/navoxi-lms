import { NextRequest, NextResponse } from "next/server";
import { decodeSession, SESSION_COOKIE } from "@/lib/auth-session";
import { canAccessRoute } from "@/lib/rbac";
import type { Role } from "@/lib/types";

const PUBLIC_PATHS = ["/login", "/api/auth"];

function isPublic(pathname: string): boolean {
  if (pathname === "/") return true;
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

function isStaticOrInternal(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isStaticOrInternal(pathname) || isPublic(pathname)) {
    return NextResponse.next();
  }

  // API routes under /api/lms and /api/youtube require session (enforced in handlers too)
  const needsPageAuth =
    !pathname.startsWith("/api/") ||
    pathname.startsWith("/api/lms") ||
    pathname.startsWith("/api/youtube");

  if (!needsPageAuth) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  const session = await decodeSession(token);
  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Sessão inválida" }, { status: 401 });
    }
    const login = new URL("/login", request.url);
    return NextResponse.redirect(login);
  }

  if (!pathname.startsWith("/api/")) {
    const role = session.role as Role;
    if (!canAccessRoute(role, pathname)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (pathname.startsWith("/api/youtube")) {
    const role = session.role as Role;
    if (
      !canAccessRoute(role, "/aprendizagem/publicar-aulas") &&
      !canAccessRoute(role, "/repositorio")
    ) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
