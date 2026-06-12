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

export default function RepositorioPage() {
  const { contents, isGlobal, unitLabel } = useAuthScope();
  const [type, setType] = useState("todos");
  const types = ["todos", ...Object.keys(typeMeta)];
  const filtered = type === "todos" ? contents : contents.filter((c) => c.type === type);
  const totalDownloads = contents.reduce((s, c) => s + c.downloads, 0);

  return (
    <div>
      <PageHeader
        title="Repositório de Conteúdos"
        subtitle={
          isGlobal
            ? "Biblioteca central de materiais em todas as unidades"
            : `Conteúdos da unidade · ${unitLabel}`
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Ativos no escopo" value={contents.length.toString()} icon={<Icon name="folder" className="w-5 h-5" />} />
        <StatCard label="Downloads" value={totalDownloads.toLocaleString("pt-BR")} icon={<Icon name="trend" className="w-5 h-5" />} color="#2563eb" />
        <StatCard label="Categorias" value={new Set(contents.map((c) => c.category)).size.toString()} icon={<Icon name="grid" className="w-5 h-5" />} color="#7c3aed" />
        <StatCard label="Armazenamento" value="158 MB" icon={<Icon name="chart" className="w-5 h-5" />} color="#d97706" />
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
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
        <Table head={["Arquivo", "Tipo", "Unidade", "Categoria", "Tamanho", "Enviado por", "Data", "Downloads"]}>
          {filtered.map((c) => (
            <tr key={c.id} className="hover:bg-slate-50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <span
                    className="w-9 h-9 rounded-lg grid place-items-center text-white text-[10px] font-bold shrink-0"
                    style={{ backgroundColor: typeMeta[c.type].color }}
                  >
                    {typeMeta[c.type].label.slice(0, 3).toUpperCase()}
                  </span>
                  <span className="font-medium text-slate-800">{c.name}</span>
                </div>
              </td>
              <td className="px-4 py-3"><Badge color="slate">{typeMeta[c.type].label}</Badge></td>
              <td className="px-4 py-3 text-slate-500 text-xs">{unitLabels[c.unitId]}</td>
              <td className="px-4 py-3 text-slate-600">{c.category}</td>
              <td className="px-4 py-3 text-slate-500">{c.size}</td>
              <td className="px-4 py-3 text-slate-600">{c.uploadedBy}</td>
              <td className="px-4 py-3 text-slate-500 text-xs">{c.uploadedAt}</td>
              <td className="px-4 py-3 font-medium text-slate-700">{c.downloads.toLocaleString("pt-BR")}</td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
