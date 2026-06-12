"use client";

import { useAuthScope } from "@/lib/use-auth-scope";
import { Card, Badge } from "@/components/ui";

export function DestaquesBanner() {
  const { destaques } = useAuthScope();
  const visible = destaques.filter((d) => d.visible).slice(0, 2);

  if (visible.length === 0) return null;

  return (
    <Card className="p-5 mb-6">
      <h3 className="font-semibold text-slate-800 mb-3">Destaques e avisos</h3>
      <div className="space-y-3">
        {visible.map((d) => (
          <div key={d.id} className="p-4 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-medium text-slate-800">{d.title}</h4>
              {d.pinned && <Badge color="green">Destaque</Badge>}
            </div>
            <p className="text-sm text-slate-600 mt-1">{d.body}</p>
            <p className="text-xs text-slate-400 mt-2">{d.publishedAt}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
