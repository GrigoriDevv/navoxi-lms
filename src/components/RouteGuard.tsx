"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { canAccessRoute } from "@/lib/rbac";
import { useApp } from "@/lib/store";

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { currentUser } = useApp();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) return;
    if (!canAccessRoute(currentUser.role, pathname)) {
      router.replace("/dashboard");
    }
  }, [currentUser, pathname, router]);

  if (currentUser && !canAccessRoute(currentUser.role, pathname)) {
    return (
      <div className="grid place-items-center min-h-[40vh] text-slate-400 text-sm">
        Acesso não permitido para o seu perfil…
      </div>
    );
  }

  return <>{children}</>;
}
