import { Suspense } from "react";
import { NotificacoesView } from "./NotificacoesView";

export default function NotificacoesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-400 text-sm">Carregando…</div>}>
      <NotificacoesView />
    </Suspense>
  );
}
