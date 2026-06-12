"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getNavItemsForRole } from "@/lib/rbac";
import { Icon } from "@/components/Icon";
import { useApp } from "@/lib/store";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { currentUser, settings } = useApp();
  const role = currentUser?.role ?? "aluno";

  const visible = getNavItemsForRole(role, settings.modules);
  const groups = Array.from(new Set(visible.map((i) => i.group)));

  return (
    <aside className="w-64 shrink-0 bg-sidebar text-slate-300 flex flex-col h-full">
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-lg bg-brand grid place-items-center font-bold text-white">
          N
        </div>
        <div className="leading-tight">
          <div className="text-white font-semibold text-sm">Neoenergia</div>
          <div className="text-[11px] text-slate-400">LMS Corporativo</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {groups.map((group) => (
          <div key={group}>
            <div className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              {group}
            </div>
            <div className="space-y-0.5">
              {visible
                .filter((i) => i.group === group)
                .map((item) => {
                  const active =
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onNavigate}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                        active
                          ? "bg-brand text-white font-medium"
                          : "hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Icon name={item.icon} className="w-[18px] h-[18px]" />
                      {item.label}
                    </Link>
                  );
                })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-white/10 text-[11px] text-slate-500">
        v1.0 MVP · Ambiente demo
      </div>
    </aside>
  );
}
