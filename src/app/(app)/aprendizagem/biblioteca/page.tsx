"use client";

import { useState } from "react";
import { useAuthScope } from "@/lib/use-auth-scope";
import { unitLabels } from "@/lib/rbac";
import { PageHeader, Card, Badge, Table, StatCard } from "@/components/ui";
import { Icon } from "@/components/Icon";

const typeMeta: Record<string, { color: string; label: string }> = {
  video: { color: "#db2777", label: "Vídeo" },
  pdf: { color: "#dc2626", label: "PDF" },
  scorm: { color: "#7c3aed", label: "SCORM" },
  imagem: { color: "#0891b2", label: "Imagem" },
  link: { color: "#2563eb", label: "Link" },
};

export default function BibliotecaPage() {
  const { contents } = useAuthScope();
  const [type, setType] = useState("todos");
  const types = ["todos", ...Object.keys(typeMeta)];
  const filtered = type === "todos" ? contents : contents.filter((c) => c.type === type);

  return (
    <div>
      <PageHeader
        title="Biblioteca de Aprendizagem"
        subtitle="Materiais e objetos de aprendizagem (RF-041)"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard label="Objetos" value={contents.length.toString()} icon={<Icon name="folder" className="w-5 h-5" />} />
        <StatCard label="Vídeos" value={contents.filter((c) => c.type === "video").length.toString()} icon={<Icon name="book" className="w-5 h-5" />} color="#db2777" />
        <StatCard label="SCORM" value={contents.filter((c) => c.type === "scorm").length.toString()} icon={<Icon name="grid" className="w-5 h-5" />} color="#7c3aed" />
        <StatCard label="Downloads" value={contents.reduce((s, c) => s + c.downloads, 0).toLocaleString("pt-BR")} icon={<Icon name="trend" className="w-5 h-5" />} color="#2563eb" />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize transition ${
              type === t ? "bg-brand text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-brand"
            }`}
          >
            {t === "todos" ? "Todos" : typeMeta[t].label}
          </button>
        ))}
      </div>

      <Card className="p-2">
        <Table head={["Material", "Tipo", "Categoria", "Unidade", "Downloads"]}>
          {filtered.map((c) => (
            <tr key={c.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-medium text-slate-800">{c.name}</td>
              <td className="px-4 py-3"><Badge color="slate">{typeMeta[c.type].label}</Badge></td>
              <td className="px-4 py-3 text-slate-600">{c.category}</td>
              <td className="px-4 py-3 text-xs text-slate-500">{unitLabels[c.unitId]}</td>
              <td className="px-4 py-3">{c.downloads.toLocaleString("pt-BR")}</td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
