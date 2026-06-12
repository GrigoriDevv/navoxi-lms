"use client";

import { unitLabels } from "@/lib/rbac";
import type { DashboardFilters } from "@/lib/dashboard-metrics";
import type { UnitId } from "@/lib/types";
import { Card, inputClass } from "@/components/ui";

const modalityLabels: Record<string, string> = {
  all: "Todas",
  online: "Online",
  presencial: "Presencial",
  hibrido: "Híbrido",
};

interface Props {
  filters: DashboardFilters;
  onChange: (f: DashboardFilters) => void;
  options: {
    categories: string[];
    modalities: string[];
    audiences: string[];
    courses: { id: string; title: string }[];
  };
  canPickUnit: boolean;
  lockedUnitId?: UnitId;
}

export function DashboardFiltersBar({
  filters,
  onChange,
  options,
  canPickUnit,
  lockedUnitId,
}: Props) {
  const set = <K extends keyof DashboardFilters>(key: K, value: DashboardFilters[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-800">Filtros de acompanhamento</h3>
        <button
          type="button"
          onClick={() =>
            onChange({
              ...filters,
              category: "all",
              modality: "all",
              courseId: "all",
              audience: "all",
              unitId: lockedUnitId ?? "all",
              dateFrom: "2026-05-01",
              dateTo: "2026-06-12",
            })
          }
          className="text-xs font-medium text-brand hover:underline"
        >
          Limpar filtros
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        <label className="block">
          <span className="text-[11px] font-medium text-slate-500 uppercase">Unidade</span>
          {canPickUnit ? (
            <select
              className={`${inputClass} mt-1`}
              value={filters.unitId}
              onChange={(e) => set("unitId", e.target.value as UnitId | "all")}
            >
              <option value="all">Todas</option>
              {(Object.keys(unitLabels) as UnitId[]).map((id) => (
                <option key={id} value={id}>{unitLabels[id]}</option>
              ))}
            </select>
          ) : (
            <input
              className={`${inputClass} mt-1 bg-slate-50`}
              value={lockedUnitId ? unitLabels[lockedUnitId] : "—"}
              readOnly
              disabled
            />
          )}
        </label>

        <label className="block">
          <span className="text-[11px] font-medium text-slate-500 uppercase">Categoria</span>
          <select className={`${inputClass} mt-1`} value={filters.category} onChange={(e) => set("category", e.target.value)}>
            {options.categories.map((c) => (
              <option key={c} value={c}>{c === "all" ? "Todas" : c}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-[11px] font-medium text-slate-500 uppercase">Modalidade</span>
          <select className={`${inputClass} mt-1`} value={filters.modality} onChange={(e) => set("modality", e.target.value)}>
            {options.modalities.map((m) => (
              <option key={m} value={m}>{modalityLabels[m] ?? m}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-[11px] font-medium text-slate-500 uppercase">Curso</span>
          <select className={`${inputClass} mt-1`} value={filters.courseId} onChange={(e) => set("courseId", e.target.value)}>
            <option value="all">Todos</option>
            {options.courses.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-[11px] font-medium text-slate-500 uppercase">Público-alvo</span>
          <select className={`${inputClass} mt-1`} value={filters.audience} onChange={(e) => set("audience", e.target.value)}>
            {options.audiences.map((a) => (
              <option key={a} value={a}>{a === "all" ? "Todos" : a}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-[11px] font-medium text-slate-500 uppercase">Período · de</span>
          <input type="date" className={`${inputClass} mt-1`} value={filters.dateFrom} onChange={(e) => set("dateFrom", e.target.value)} />
        </label>

        <label className="block">
          <span className="text-[11px] font-medium text-slate-500 uppercase">Período · até</span>
          <input type="date" className={`${inputClass} mt-1`} value={filters.dateTo} onChange={(e) => set("dateTo", e.target.value)} />
        </label>
      </div>
    </Card>
  );
}
