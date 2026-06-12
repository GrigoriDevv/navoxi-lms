"use client";

import { useAuthScope } from "@/lib/use-auth-scope";
import { Icon } from "@/components/Icon";

export function DestaquesBanner() {
  const { destaques } = useAuthScope();
  const visible = destaques
    .filter((d) => d.visible)
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  if (visible.length === 0) return null;

  return (
    <div className="space-y-2 mb-6">
      {visible.slice(0, 3).map((d) => (
        <div
          key={d.id}
          className={`rounded-xl border p-4 flex gap-3 ${
            d.pinned ? "border-brand/30 bg-emerald-50/80" : "border-slate-200 bg-white"
          }`}
        >
          <div className={`w-10 h-10 rounded-lg grid place-items-center shrink-0 ${d.pinned ? "bg-brand text-white" : "bg-slate-100 text-slate-500"}`}>
            <Icon name={d.pinned ? "bell" : "mail"} className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-800">{d.title}</h3>
              {d.pinned && <span className="text-[10px] font-bold uppercase text-brand">Destaque</span>}
            </div>
            <p className="text-sm text-slate-600 mt-0.5">{d.body}</p>
            <p className="text-xs text-slate-400 mt-1">{d.publishedAt}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
