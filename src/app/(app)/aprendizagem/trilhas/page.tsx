"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { useAuthScope } from "@/lib/use-auth-scope";
import { PageHeader, Card, Badge, ProgressBar, Modal, Button, Field, inputClass } from "@/components/ui";
import { Icon } from "@/components/Icon";
import type { Trilha, TrilhaStep } from "@/lib/types";

const statusColor = { ativa: "green", rascunho: "amber", arquivada: "slate" } as const;

export default function TrilhasPage() {
  const { addTrilha, updateTrilha } = useApp();
  const { trilhas, courses, can } = useAuthScope();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Trilha | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    audience: "Todos colaboradores",
    status: "rascunho" as Trilha["status"],
    steps: [] as TrilhaStep[],
  });

  const courseName = (id: string) => courses.find((c) => c.id === id)?.title ?? "—";
  const canManage = can("manage_courses");

  const reset = () =>
    setForm({ name: "", description: "", audience: "Todos colaboradores", status: "rascunho", steps: [] });

  const addStep = () => {
    const next = form.steps.length + 1;
    const firstCourse = courses[0]?.id ?? "";
    setForm({
      ...form,
      steps: [...form.steps, { order: next, courseId: firstCourse, title: `Etapa ${next}`, required: true }],
    });
  };

  const openEdit = (tr: Trilha) => {
    setEditing(tr);
    setForm({
      name: tr.name,
      description: tr.description,
      audience: tr.audience,
      status: tr.status,
      steps: [...tr.steps],
    });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const courseIds = form.steps.map((s) => s.courseId);
    if (editing) {
      updateTrilha(editing.id, { ...form, courseIds });
      setEditing(null);
    } else {
      addTrilha({ ...form, courseIds });
      setOpen(false);
    }
    reset();
  };

  return (
    <div>
      <PageHeader
        title="Trilhas de Aprendizagem"
        subtitle="Trilhas compostas por cursos e etapas sequenciais (RF-049)"
        action={
          canManage && (
            <Button onClick={() => { reset(); setOpen(true); }}>
              <Icon name="plus" className="w-4 h-4" />
              Nova trilha
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {trilhas.map((tr) => (
          <Card key={tr.id} className="p-6 flex flex-col">
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-xl bg-blue-100 text-brand grid place-items-center">
                <Icon name="route" />
              </div>
              <div className="flex gap-1">
                <Badge color="blue">{tr.audience}</Badge>
                <Badge color={statusColor[tr.status]}>{tr.status}</Badge>
              </div>
            </div>
            <h3 className="font-semibold text-slate-800 mt-4">{tr.name}</h3>
            <p className="text-sm text-slate-500 mt-1">{tr.description}</p>

            <div className="mt-4 space-y-2 flex-1">
              {tr.steps.map((step) => (
                <div key={step.order} className="flex items-center gap-2 text-sm">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-xs grid place-items-center shrink-0">
                    {step.order}
                  </span>
                  <span className="text-slate-600 truncate flex-1">{step.title || courseName(step.courseId)}</span>
                  {step.required && <span className="text-[10px] text-amber-600 font-medium">Obrig.</span>}
                </div>
              ))}
            </div>

            <div className="mt-5">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Progresso médio</span>
                <span className="font-semibold text-slate-700">{tr.progress}%</span>
              </div>
              <ProgressBar value={tr.progress} />
            </div>

            {canManage && (
              <button onClick={() => openEdit(tr)} className="mt-3 text-xs text-brand font-medium hover:underline text-left">
                Editar trilha
              </button>
            )}
          </Card>
        ))}
      </div>

      <Modal open={open || !!editing} onClose={() => { setOpen(false); setEditing(null); reset(); }} title={editing ? "Editar trilha" : "Nova trilha"}>
        <form onSubmit={submit}>
          <Field label="Nome"><input required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Descrição"><textarea className={inputClass} rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Público-alvo"><input className={inputClass} value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} /></Field>
            <Field label="Status">
              <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Trilha["status"] })}>
                <option value="rascunho">Rascunho</option>
                <option value="ativa">Ativa</option>
                <option value="arquivada">Arquivada</option>
              </select>
            </Field>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Etapas sequenciais</span>
              <button type="button" onClick={addStep} className="text-xs text-brand font-medium">+ Adicionar etapa</button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {form.steps.map((step, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <span className="text-xs text-slate-400 w-4">{step.order}</span>
                  <select
                    className={`${inputClass} flex-1`}
                    value={step.courseId}
                    onChange={(e) => {
                      const steps = [...form.steps];
                      steps[idx] = { ...step, courseId: e.target.value, title: courseName(e.target.value) };
                      setForm({ ...form, steps });
                    }}
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                  <label className="text-xs flex items-center gap-1 shrink-0">
                    <input type="checkbox" checked={step.required} onChange={(e) => {
                      const steps = [...form.steps];
                      steps[idx] = { ...step, required: e.target.checked };
                      setForm({ ...form, steps });
                    }} />
                    Obrig.
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => { setOpen(false); setEditing(null); reset(); }}>Cancelar</Button>
            <Button type="submit">{editing ? "Salvar" : "Criar trilha"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
