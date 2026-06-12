"use client";

import { useState } from "react";
import { useAuthScope } from "@/lib/use-auth-scope";
import { unitLabels } from "@/lib/rbac";
import { turmaStatusLabels } from "@/lib/aprendizagem";
import { useApp } from "@/lib/store";
import { PageHeader, Card, Badge, Table, ProgressBar, Modal, Button, Field, inputClass } from "@/components/ui";
import { Icon } from "@/components/Icon";
import type { Turma, UnitId } from "@/lib/types";

const statusColor = {
  agendada: "blue",
  em_andamento: "green",
  concluida: "slate",
} as const;

export default function TurmasPage() {
  const { courses, updateTurma } = useApp();
  const { turmas, salas, isGlobal, unitLabel, can } = useAuthScope();
  const [editing, setEditing] = useState<Turma | null>(null);
  const [form, setForm] = useState({
    name: "",
    courseId: "",
    instructor: "",
    unitId: "holding" as UnitId,
    salaId: "",
    startDate: "",
    endDate: "",
    capacity: 30,
    enrolled: 0,
    status: "agendada" as Turma["status"],
  });

  const courseName = (id: string) => courses.find((c) => c.id === id)?.title ?? "—";
  const salaName = (id?: string) => salas.find((s) => s.id === id)?.name ?? "—";

  const openEdit = (t: Turma) => {
    setEditing(t);
    setForm({
      name: t.name,
      courseId: t.courseId,
      instructor: t.instructor,
      unitId: t.unitId,
      salaId: t.salaId ?? "",
      startDate: t.startDate,
      endDate: t.endDate,
      capacity: t.capacity,
      enrolled: t.enrolled,
      status: t.status,
    });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    updateTurma(editing.id, {
      ...form,
      salaId: form.salaId || undefined,
    });
    setEditing(null);
  };

  return (
    <div>
      <PageHeader
        title="Turmas"
        subtitle={
          isGlobal
            ? "Criar, editar e acompanhar turmas (RF-043)"
            : `Turmas da unidade · ${unitLabel}`
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {(["agendada", "em_andamento", "concluida"] as const).map((s) => (
          <Card key={s} className="p-5">
            <div className="text-sm text-slate-500">{turmaStatusLabels[s]}</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {turmas.filter((t) => t.status === s).length}
            </div>
          </Card>
        ))}
        <Card className="p-5">
          <div className="text-sm text-slate-500">Total de inscritos</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {turmas.reduce((s, t) => s + t.enrolled, 0)}
          </div>
        </Card>
      </div>

      <Card className="p-2">
        <Table head={["Turma", "Curso", "Sala", "Unidade", "Instrutor", "Período", "Ocupação", "Status", "Ações"]}>
          {turmas.map((t) => {
            const pct = Math.round((t.enrolled / t.capacity) * 100);
            return (
              <tr key={t.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{t.name}</td>
                <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{courseName(t.courseId)}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{salaName(t.salaId)}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{unitLabels[t.unitId]}</td>
                <td className="px-4 py-3 text-slate-600">{t.instructor}</td>
                <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                  {t.startDate} → {t.endDate}
                </td>
                <td className="px-4 py-3 w-40">
                  <div className="flex items-center gap-2">
                    <ProgressBar value={pct} color={pct >= 95 ? "#d97706" : "#00a14b"} />
                    <span className="text-xs text-slate-500 whitespace-nowrap">{t.enrolled}/{t.capacity}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge color={statusColor[t.status]}>{turmaStatusLabels[t.status]}</Badge>
                </td>
                <td className="px-4 py-3">
                  {can("manage_turmas") && (
                    <button onClick={() => openEdit(t)} className="text-xs text-brand font-medium hover:underline">Editar</button>
                  )}
                </td>
              </tr>
            );
          })}
        </Table>
      </Card>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar turma">
        <form onSubmit={submit}>
          <Field label="Nome"><input required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Instrutor"><input required className={inputClass} value={form.instructor} onChange={(e) => setForm({ ...form, instructor: e.target.value })} /></Field>
          <Field label="Sala física">
            <select className={inputClass} value={form.salaId} onChange={(e) => setForm({ ...form, salaId: e.target.value })}>
              <option value="">Sem sala / EAD</option>
              {salas.filter((s) => s.status === "disponivel").map((s) => (
                <option key={s.id} value={s.id}>{s.name} — {s.location}</option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Início"><input type="date" className={inputClass} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></Field>
            <Field label="Término"><input type="date" className={inputClass} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Capacidade"><input type="number" min={1} className={inputClass} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} /></Field>
            <Field label="Inscritos"><input type="number" min={0} className={inputClass} value={form.enrolled} onChange={(e) => setForm({ ...form, enrolled: Number(e.target.value) })} /></Field>
            <Field label="Status">
              <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Turma["status"] })}>
                <option value="agendada">Agendada</option>
                <option value="em_andamento">Em andamento</option>
                <option value="concluida">Concluída</option>
              </select>
            </Field>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
