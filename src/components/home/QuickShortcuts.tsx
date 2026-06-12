"use client";

import Link from "next/link";
import { getShortcutsForPermissions } from "@/lib/quick-shortcuts";
import { useAuthScope } from "@/lib/use-auth-scope";
import { Icon } from "@/components/Icon";
import { Card } from "@/components/ui";

export function QuickShortcuts() {
  const { can } = useAuthScope();
  const shortcuts = getShortcutsForPermissions(can);

  if (shortcuts.length === 0) return null;

  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-800 mb-3">Atalhos rápidos</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-3">
        {shortcuts.map((s) => (
          <Link key={s.id} href={s.href}>
            <Card className="p-4 h-full hover:border-brand hover:shadow-md transition group cursor-pointer">
              <div
                className="w-10 h-10 rounded-xl grid place-items-center text-white mb-3 group-hover:scale-105 transition"
                style={{ backgroundColor: s.color }}
              >
                <Icon name={s.icon} className="w-5 h-5" />
              </div>
              <div className="font-semibold text-sm text-slate-800">{s.label}</div>
              <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">{s.description}</div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
