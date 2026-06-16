"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { useAuthScope } from "@/lib/use-auth-scope";
import { contentUsageLabels } from "@/lib/avaliacoes";
import { unitLabels } from "@/lib/rbac";
import { PageHeader, Card, Badge, Table, StatCard, Modal, Button, Field, inputClass } from "@/components/ui";
import { Icon } from "@/components/Icon";
import type { ContentAsset, UnitId } from "@/lib/types";

const typeMeta: Record<string, { color: string; label: string }> = {
  video: { color: "#db2777", label: "Vídeo" },
  pdf: { color: "#dc2626", label: "PDF" },
  scorm: { color: "#7c3aed", label: "SCORM" },
  imagem: { color: "#0891b2", label: "Imagem" },
  link: { color: "#2563eb", label: "Link" },
};

const usageOptions = Object.keys(contentUsageLabels) as ContentAsset["usedIn"][number][];

export default function RepositorioPage() {
  const { addContent } = useApp();
  const { contents, isGlobal, unitLabel, can } = useAuthScope();
  const [type, setType] = useState("todos");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "pdf" as ContentAsset["type"],
    size: "1 MB",
    category: "Geral",
    unitId: "matriz" as UnitId,
    usedIn: ["biblioteca"] as ContentAsset["usedIn"],
  });

  const types = ["todos", ...Object.keys(typeMeta)];
  const filtered = type === "todos" ? contents : contents.filter((c) => c.type === type);
  const totalDownloads = contents.reduce((s, c) => s + c.downloads, 0);

  const toggleUsage = (u: ContentAsset["usedIn"][number]) => {
    setForm((f) => ({
      ...f,
      usedIn: f.usedIn.includes(u) ? f.usedIn.filter((x) => x !== u) : [...f.usedIn, u],
    }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    addContent(form);
    setOpen(false);
    setForm({ name: "", type: "pdf", size: "1 MB", category: "Geral", unitId: "matriz", usedIn: ["biblioteca"] });
  };

  return (
    <div>
      <PageHeader
        title="Repositório de Conteúdos"
        subtitle="Armazenar materiais reutilizáveis em cursos, biblioteca, avaliações e comunicações (RF-054 · RF-055)"
        action={
          can("manage_content") && (
            <Button onClick={() => setOpen(true)}>
              <Icon name="plus" className="w-4 h-4" />
              Enviar conteúdo
            </Button>
          )
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Ativos no escopo" value={contents.length.toString()} icon={<Icon name="folder" className="w-5 h-5" />} />
        <StatCard label="Downloads" value={totalDownloads.toLocaleString("pt-BR")} icon={<Icon name="trend" className="w-5 h-5" />} color="#2563eb" />
        <StatCard label="Categorias" value={new Set(contents.map((c) => c.category)).size.toString()} icon={<Icon name="grid" className="w-5 h-5" />} color="#7c3aed" />
        <StatCard label="Escopo" value={isGlobal ? "Todas unidades" : unitLabel ?? "—"} icon={<Icon name="chart" className="w-5 h-5" />} color="#d97706" />
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
        <Table head={["Arquivo", "Tipo", "Unidade", "Categoria", "Reutilização", "Tamanho", "Downloads"]}>
          {filtered.map((c) => (
            <tr key={c.id} className="hover:bg-slate-50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-lg grid place-items-center text-white text-[10px] font-bold shrink-0" style={{ backgroundColor: typeMeta[c.type].color }}>
                    {typeMeta[c.type].label.slice(0, 3).toUpperCase()}
                  </span>
                  <span className="font-medium text-slate-800">{c.name}</span>
                </div>
              </td>
              <td className="px-4 py-3"><Badge color="slate">{typeMeta[c.type].label}</Badge></td>
              <td className="px-4 py-3 text-slate-500 text-xs">{unitLabels[c.unitId]}</td>
              <td className="px-4 py-3 text-slate-600">{c.category}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {c.usedIn.map((u) => (
                    <Badge key={u} color="blue">{contentUsageLabels[u]}</Badge>
                  ))}
                </div>
              </td>
              <td className="px-4 py-3 text-slate-500">{c.size}</td>
              <td className="px-4 py-3 font-medium text-slate-700">{c.downloads.toLocaleString("pt-BR")}</td>
            </tr>
          ))}
        </Table>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Enviar conteúdo ao repositório">
        <form onSubmit={submit}>
          <Field label="Nome"><input required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tipo">
              <select className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as ContentAsset["type"] })}>
                {Object.entries(typeMeta).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </Field>
            <Field label="Categoria"><input className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></Field>
          </div>
          <Field label="Reutilização">
            <div className="flex flex-wrap gap-2">
              {usageOptions.map((u) => (
                <label key={u} className="flex items-center gap-1.5 text-sm">
                  <input type="checkbox" checked={form.usedIn.includes(u)} onChange={() => toggleUsage(u)} />
                  {contentUsageLabels[u]}
                </label>
              ))}
            </div>
          </Field>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit">Enviar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
