"use client";

import { useMemo, useState } from "react";
import { useAuthScope } from "@/lib/use-auth-scope";
import { modalityLabels, modalityColors } from "@/lib/aprendizagem";
import { unitLabels } from "@/lib/rbac";
import { PageHeader, Card, Badge, ProgressBar } from "@/components/ui";
import { Icon } from "@/components/Icon";

export default function CatalogoPage() {
  const { courses, isGlobal, unitLabel } = useAuthScope();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("todos");
  const [modality, setModality] = useState("todos");

  const catalog = useMemo(() => {
    return courses
      .filter((c) => c.status === "publicado")
      .filter((c) => category === "todos" || c.category === category)
      .filter((c) => modality === "todos" || c.modality === modality)
      .filter(
        (c) =>
          !query ||
          c.title.toLowerCase().includes(query.toLowerCase()) ||
          c.category.toLowerCase().includes(query.toLowerCase()) ||
          c.audience.toLowerCase().includes(query.toLowerCase())
      );
  }, [courses, query, category, modality]);

  const categories = ["todos", ...Array.from(new Set(courses.filter((c) => c.status === "publicado").map((c) => c.category)))];

  return (
    <div>
      <PageHeader
        title="Catálogo de Cursos"
        subtitle={
          isGlobal
            ? "Navegue e inscreva-se nos cursos disponíveis (RF-040)"
            : `Catálogo · ${unitLabel}`
        }
      />

      <Card className="p-4 mb-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Icon name="search" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por título, categoria ou público-alvo…"
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-100 text-sm outline-none"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c === "todos" ? "Todas categorias" : c}</option>
            ))}
          </select>
          <select
            value={modality}
            onChange={(e) => setModality(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white"
          >
            <option value="todos">Todas modalidades</option>
            <option value="online">{modalityLabels.online}</option>
            <option value="presencial">{modalityLabels.presencial}</option>
            <option value="hibrido">{modalityLabels.hibrido}</option>
          </select>
        </div>
      </Card>

      {catalog.length === 0 ? (
        <Card className="p-12 text-center text-slate-400">
          Nenhum curso encontrado. Ajuste os filtros de navegação.
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {catalog.map((c) => (
            <Card key={c.id} className="overflow-hidden flex flex-col hover:shadow-md transition">
              <div className="h-24 p-4 flex items-end justify-between" style={{ background: `linear-gradient(135deg, ${c.cover}, ${c.cover}99)` }}>
                <Badge color="green">Disponível</Badge>
                <span
                  className="text-[10px] font-semibold text-white px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: modalityColors[c.modality] }}
                >
                  {modalityLabels[c.modality]}
                </span>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <span className="text-xs font-medium text-brand">{c.category}</span>
                <h3 className="font-semibold text-slate-800 mt-1">{c.title}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  {c.workload}h · {unitLabels[c.unitId]} · {c.audience}
                </p>
                <div className="mt-auto pt-3">
                  <ProgressBar value={c.completion} />
                  <p className="text-xs text-slate-400 mt-1">{c.enrolled.toLocaleString("pt-BR")} matriculados</p>
                </div>
                <button className="mt-3 w-full py-2 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand-dark">
                  Inscrever-se
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
