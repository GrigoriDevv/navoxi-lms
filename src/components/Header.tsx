"use client";

import { NotificationsPanel } from "@/components/NotificationsPanel";
import { UserMenu } from "@/components/UserMenu";
import { TopNav } from "@/components/TopNav";
import { Icon } from "@/components/Icon";
import { unitLabels } from "@/lib/rbac";
import { useApp } from "@/lib/store";
import { Badge } from "@/components/ui";
import Link from "next/link";

export function Header({ onMenu }: { onMenu: () => void }) {
  const { currentUser, settings } = useApp();
  const topNav = settings.layout.navStyle === "top";

  return (
    <header className="h-16 shrink-0 bg-white border-b border-slate-200 flex items-center gap-2 px-4 lg:px-6">
      {!topNav && (
        <button
          onClick={onMenu}
          className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          aria-label="Menu"
        >
          <Icon name="list" />
        </button>
      )}

      {topNav && (
        <Link href="/dashboard" className="flex items-center gap-2 shrink-0 mr-2">
          <div className="w-8 h-8 rounded-lg bg-brand grid place-items-center font-bold text-white text-sm">N</div>
          <span className="hidden xl:block font-semibold text-slate-800 text-sm">{settings.orgName}</span>
        </Link>
      )}

      {topNav ? (
        <TopNav />
      ) : (
        <div className="hidden md:flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Icon name="search" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Buscar cursos, usuários, trilhas…"
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-100 text-sm outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
        </div>
      )}

      {topNav && (
        <button
          onClick={onMenu}
          className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg ml-auto"
          aria-label="Menu"
        >
          <Icon name="list" />
        </button>
      )}

      {currentUser?.role === "admin_unidade" && currentUser.unitId && (
        <div className="hidden md:block">
          <Badge color="blue">{unitLabels[currentUser.unitId]}</Badge>
        </div>
      )}

      <div className={`flex items-center gap-2 ${topNav ? "ml-auto" : "ml-auto"}`}>
        <NotificationsPanel />
        <div className="w-px h-8 bg-slate-200 mx-1" aria-hidden />
        <UserMenu />
      </div>
    </header>
  );
}
