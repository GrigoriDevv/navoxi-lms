"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { useAuthScope } from "@/lib/use-auth-scope";
import { modalityLabels, courseStatusLabels } from "@/lib/aprendizagem";
import { unitLabels } from "@/lib/rbac";
import {
  PageHeader,
  Card,
  Badge,
  ProgressBar,
  Modal,
  Button,
  Field,
  inputClass,
} from "@/components/ui";
import { Icon } from "@/components/Icon";
import type { Course, UnitId } from "@/lib/types";

const statusColor = {
  publicado: "green",
  rascunho: "amber",
  arquivado: "slate",
} as const;

export default function CursosPage() {
  const { addCourse, updateCourse } = useApp();
  const { courses, unitId, isGlobal, unitLabel, can } = useAuthScope();
  const [filter, setFilter] = useState("todos");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const canManage = can("manage_courses");
  const [form, setForm] = useState({
    title: "",
    category: "Compliance",
    instructor: "",
    unitId: (unitId ?? "matriz") as UnitId,
    modality: "online" as Course["modality"],
    audience: "Todos colaboradores",
    workload: 8,
    status: "rascunho" as Course["status"],
    cover: "#2563eb",
  });

  const categories = ["todos", ...Array.from(new Set(courses.map((c) => c.category)))];
  const filtered = filter === "todos" ? courses : courses.filter((c) => c.category === filter);

  const resetForm = () =>
    setForm({
      title: "",
      category: "Compliance",
      instructor: "",
      unitId: (unitId ?? "matriz") as UnitId,
      modality: "online",
      audience: "Todos colaboradores",
      workload: 8,
      status: "rascunho",
      cover: "#2563eb",
    });

  const openEdit = (c: Course) => {
    setEditing(c);
    setForm({
      title: c.title,
      category: c.category,
      instructor: c.instructor,
      unitId: c.unitId,
      modality: c.modality,
      audience: c.audience,
      workload: c.workload,
      status: c.status,
      cover: c.cover,
    });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      updateCourse(editing.id, form);
      setEditing(null);
    } else {
      addCourse(form);
      setOpen(false);
    }
    resetForm();
  };

  const publish = (id: string) => updateCourse(id, { status: "publicado" });
  const archive = (id: string) => updateCourse(id, { status: "arquivado" });

  return (
    <div>
      <PageHeader
        title="Gestão de Cursos"
        subtitle={
          isGlobal
            ? "Cadastrar, editar, publicar e manter cursos (RF-042 · RF-050)"
            : `Cursos da unidade · ${unitLabel}`
        }
        action={
          canManage && (
            <Button onClick={() => { resetForm(); setOpen(true); }}>
              <Icon name="plus" className="w-4 h-4" />
              Novo curso
            </Button>
          )
        }
      />

      <div className="flex flex-wrap gap-2 mb-5">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition capitalize ${
              filter === c
                ? "bg-brand text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:border-brand"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <Card key={c.id} className="overflow-hidden flex flex-col">
            <div
              className="h-28 relative flex items-end p-4"
              style={{ background: `linear-gradient(135deg, ${c.cover}, ${c.cover}99)` }}
            >
              <Badge color={statusColor[c.status]}>{courseStatusLabels[c.status]}</Badge>
              <span className="absolute top-3 right-3 text-white/90 text-xs font-medium bg-black/20 px-2 py-0.5 rounded-full">
                {modalityLabels[c.modality]}
              </span>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-brand">{c.category}</span>
                <span className="text-[10px] text-slate-400">{unitLabels[c.unitId]}</span>
              </div>
              <h3 className="font-semibold text-slate-800 mt-1 leading-snug">{c.title}</h3>
              <p className="text-xs text-slate-400 mt-1">
                {c.instructor} · {c.workload}h · {c.audience}
              </p>
              <div className="mt-auto pt-4">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>{c.enrolled.toLocaleString("pt-BR")} inscritos</span>
                  <span>{c.completion}% conclusão</span>
                </div>
                <ProgressBar value={c.completion} />
              </div>
              {canManage && (
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100">
                  <button onClick={() => openEdit(c)} className="text-xs text-brand font-medium hover:underline">Editar</button>
                  {c.status !== "publicado" && (
                    <button onClick={() => publish(c.id)} className="text-xs text-blue-600 font-medium hover:underline">Publicar</button>
                  )}
                  {c.status !== "arquivado" && (
                    <button onClick={() => archive(c.id)} className="text-xs text-slate-500 font-medium hover:underline">Arquivar</button>
                  )}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Modal open={open || !!editing} onClose={() => { setOpen(false); setEditing(null); resetForm(); }} title={editing ? "Editar curso" : "Criar novo curso"}>
        <form onSubmit={submit}>
          <Field label="Título do curso">
            <input required className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Categoria">
              <input className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </Field>
            <Field label="Instrutor">
              <input className={inputClass} value={form.instructor} onChange={(e) => setForm({ ...form, instructor: e.target.value })} />
            </Field>
          </div>
          <Field label="Público-alvo">
            <input className={inputClass} value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Modalidade">
              <select className={inputClass} value={form.modality} onChange={(e) => setForm({ ...form, modality: e.target.value as Course["modality"] })}>
                <option value="online">{modalityLabels.online}</option>
                <option value="presencial">{modalityLabels.presencial}</option>
                <option value="hibrido">{modalityLabels.hibrido}</option>
              </select>
            </Field>
            <Field label="Carga (h)">
              <input type="number" min={1} className={inputClass} value={form.workload} onChange={(e) => setForm({ ...form, workload: Number(e.target.value) })} />
            </Field>
            <Field label="Status">
              <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Course["status"] })}>
                <option value="rascunho">Rascunho</option>
                <option value="publicado">Publicado</option>
                <option value="arquivado">Arquivado</option>
              </select>
            </Field>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => { setOpen(false); setEditing(null); resetForm(); }}>Cancelar</Button>
            <Button type="submit">
              <Icon name="check" className="w-4 h-4" />
              {editing ? "Salvar alterações" : "Criar curso"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
