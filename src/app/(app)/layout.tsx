"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { RouteGuard } from "@/components/RouteGuard";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser } = useApp();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (ready && !currentUser) router.replace("/login");
  }, [ready, currentUser, router]);

  if (!currentUser) {
    return (
      <div className="min-h-screen grid place-items-center text-slate-400">
        Verificando sessão…
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="relative z-50">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
          <div
            className="flex-1 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenu={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <RouteGuard>{children}</RouteGuard>
        </main>
      </div>
    </div>
  );
}
