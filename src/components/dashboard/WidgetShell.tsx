import type { ReactNode } from "react";
import { Icon } from "@/components/Icon";

export function WidgetShell({
  title,
  subtitle,
  children,
  status = "ready",
  onRetry,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  status?: "ready" | "loading" | "error" | "empty";
  onRetry?: () => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-full flex flex-col">
      <div className="mb-4">
        <h3 className="font-semibold text-slate-800">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex-1 min-h-[140px] flex flex-col justify-center">
        {status === "loading" && (
          <div className="space-y-3 animate-pulse">
            <div className="h-8 bg-slate-100 rounded-lg w-1/3" />
            <div className="h-24 bg-slate-100 rounded-lg" />
          </div>
        )}

        {status === "error" && (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 grid place-items-center mx-auto mb-3">
              <Icon name="bell" className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-700">Falha ao carregar widget</p>
            <p className="text-xs text-slate-400 mt-1">Não foi possível obter os dados deste indicador.</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-3 text-sm font-medium text-brand hover:underline"
              >
                Tentar novamente
              </button>
            )}
          </div>
        )}

        {status === "empty" && (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 grid place-items-center mx-auto mb-3">
              <Icon name="chart" className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-600">Nenhum dado encontrado</p>
            <p className="text-xs text-slate-400 mt-1">
              Ajuste os filtros ou o período para visualizar indicadores.
            </p>
          </div>
        )}

        {status === "ready" && children}
      </div>
    </div>
  );
}
