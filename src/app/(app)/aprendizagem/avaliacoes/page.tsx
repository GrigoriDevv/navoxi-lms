"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { useAuthScope } from "@/lib/use-auth-scope";
import { evaluationStatusLabels } from "@/lib/avaliacoes";
import { unitLabels } from "@/lib/rbac";
import { PageHeader, Card, Badge, Table, StatCard, Modal, Button, Field, inputClass } from "@/components/ui";
import { Icon } from "@/components/Icon";
import type { Evaluation, UnitId } from "@/lib/types";

const statusColor = { rascunho: "amber", publicada: "green", encerrada: "slate", aplicada: "blue" } as const;

export default function AvaliacoesPage() {
  const { addEvaluation, updateEvaluation, applyEvaluation } = useApp();
  const { evaluations, courses, turmas, questions, unitId, can } = useAuthScope();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Evaluation | null>(null);
  const [form, setForm] = useState({
    name: "",
    courseId: "",
    turmaId: "",
    unitId: (unitId ?? "holding") as UnitId,
    questionIds: [] as string[],
    status: "rascunho" as Evaluation["status"],
    dueDate: "",
  });

  const courseName = (id: string) => courses.find((c) => c.id === id)?.title ?? "—";
  const turmaName = (id?: string) => turmas.find((t) => t.id === id)?.name ?? "—";

  const reset = () =>
    setForm({
      name: "",
      courseId: courses[0]?.id ?? "",
      turmaId: "",
      unitId: (unitId ?? "holding") as UnitId,
      questionIds: [],
      status: "rascunho",
      dueDate: "",
    });

  const openEdit = (a: Evaluation) => {
    setEditing(a);
    setForm({
      name: a.name,
      courseId: a.courseId,
      turmaId: a.turmaId ?? "",
      unitId: a.unitId,
      questionIds: [...a.questionIds],
      status: a.status,
      dueDate: a.dueDate,
    });
  };

  const toggleQuestion = (qid: string) => {
    setForm((f) => ({
      ...f,
      questionIds: f.questionIds.includes(qid)
        ? f.questionIds.filter((id) => id !== qid)
        : [...f.questionIds, qid],
    }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      turmaId: form.turmaId || undefined,
      questionIds: form.questionIds,
    };
    if (editing) {
      updateEvaluation(editing.id, payload);
      setEditing(null);
    } else {
      addEvaluation(payload);
      setOpen(false);
    }
    reset();
  };

  const canManage = can("manage_courses") || can("manage_turmas");

  return (
    <div>
      <PageHeader
        title="Avaliações"
        subtitle="Criar, editar e aplicar avaliações vinculadas a cursos e turmas (RF-052 · RF-053)"
        action={
          canManage && (
            <Button onClick={() => { reset(); setOpen(true); }}>
              <Icon name="plus" className="w-4 h-4" />
              Nova avaliação
            </Button>
          )
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard label="Total" value={evaluations.length.toString()} icon={<Icon name="check" className="w-5 h-5" />} />
        <StatCard label="Aplicadas" value={evaluations.filter((a) => a.status === "aplicada").length.toString()} color="#2563eb" icon={<Icon name="route" className="w-5 h-5" />} />
        <StatCard label="Rascunhos" value={evaluations.filter((a) => a.status === "rascunho").length.toString()} color="#d97706" icon={<Icon name="list" className="w-5 h-5" />} />
        <StatCard label="Questões no banco" value={questions.length.toString()} color="#7c3aed" icon={<Icon name="book" className="w-5 h-5" />} />
      </div>

      <Card className="p-2">
        <Table head={["Avaliação", "Curso", "Turma", "Unidade", "Questões", "Prazo", "Status", "Ações"]}>
          {evaluations.map((a) => (
            <tr key={a.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-medium text-slate-800">{a.name}</td>
              <td className="px-4 py-3 text-slate-600 text-sm max-w-xs truncate">{courseName(a.courseId)}</td>
              <td className="px-4 py-3 text-xs text-slate-500">{turmaName(a.turmaId)}</td>
              <td className="px-4 py-3 text-xs text-slate-500">{unitLabels[a.unitId]}</td>
              <td className="px-4 py-3 text-slate-700">{a.questionCount}</td>
              <td className="px-4 py-3 text-slate-500 text-xs">{a.dueDate}</td>
              <td className="px-4 py-3"><Badge color={statusColor[a.status]}>{evaluationStatusLabels[a.status]}</Badge></td>
              <td className="px-4 py-3 space-x-2">
                {canManage && (
                  <>
                    <button onClick={() => openEdit(a)} className="text-xs text-brand font-medium hover:underline">Editar</button>
                    {a.status !== "aplicada" && (
                      <button onClick={() => applyEvaluation(a.id)} className="text-xs text-emerald-600 font-medium hover:underline">Aplicar</button>
                    )}
                  </>
                )}
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      <Modal open={open || !!editing} onClose={() => { setOpen(false); setEditing(null); reset(); }} title={editing ? "Editar avaliação" : "Nova avaliação"}>
        <form onSubmit={submit}>
          <Field label="Nome"><input required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Curso">
              <select required className={inputClass} value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })}>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </Field>
            <Field label="Turma (opcional)">
              <select className={inputClass} value={form.turmaId} onChange={(e) => setForm({ ...form, turmaId: e.target.value })}>
                <option value="">Todas / sem turma</option>
                {turmas.filter((t) => t.courseId === form.courseId).map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Prazo">
            <input type="date" required className={inputClass} value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </Field>
          <Field label="Questões do banco">
            <div className="max-h-36 overflow-y-auto space-y-1 border border-slate-200 rounded-lg p-2">
              {questions.map((q) => (
                <label key={q.id} className="flex items-start gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.questionIds.includes(q.id)} onChange={() => toggleQuestion(q.id)} className="mt-1" />
                  <span className="text-slate-700">{q.text}</span>
                </label>
              ))}
            </div>
          </Field>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => { setOpen(false); setEditing(null); reset(); }}>Cancelar</Button>
            <Button type="submit">{editing ? "Salvar" : "Criar"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
