"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getNavItemsForRole } from "@/lib/rbac";
import { useApp } from "@/lib/store";
import { Icon } from "@/components/Icon";

export function TopNav() {
  const pathname = usePathname();
  const { currentUser, settings } = useApp();
  const role = currentUser?.role ?? "aluno";
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const visible = getNavItemsForRole(role, settings.modules);
  const groups = Array.from(new Set(visible.map((i) => i.group)));

  return (
    <nav className="hidden lg:flex items-center gap-1 flex-1 ml-4">
      {groups.map((group) => {
        const items = visible.filter((i) => i.group === group);
        const isActive = items.some(
          (i) => pathname === i.href || pathname.startsWith(i.href + "/")
        );
        return (
          <div key={group} className="relative">
            <button
              type="button"
              onClick={() => setOpenGroup(openGroup === group ? null : group)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                isActive ? "bg-brand/10 text-brand" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {group}
              <Icon name="chevron" className="w-4 h-4 opacity-60" />
            </button>
            {openGroup === group && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setOpenGroup(null)} />
                <div className="absolute left-0 top-full mt-1 z-40 min-w-[220px] bg-white rounded-xl border border-slate-200 shadow-lg py-1">
                  {items.map((item) => {
                    const active =
                      pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpenGroup(null)}
                        className={`flex items-center gap-2.5 px-3 py-2.5 text-sm transition ${
                          active
                            ? "bg-brand/10 text-brand font-medium"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <Icon name={item.icon} className="w-4 h-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        );
      })}
    </nav>
  );
}
