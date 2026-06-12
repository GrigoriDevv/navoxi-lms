"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";

export default function Home() {
  const router = useRouter();
  const { currentUser } = useApp();
  useEffect(() => {
    router.replace(currentUser ? "/dashboard" : "/login");
  }, [currentUser, router]);
  return (
    <div className="min-h-screen grid place-items-center text-slate-400">
      Carregando…
    </div>
  );
}
