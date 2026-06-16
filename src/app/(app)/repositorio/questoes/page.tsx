"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { useAuthScope } from "@/lib/use-auth-scope";
import { questionTypeLabels } from "@/lib/avaliacoes";
import { unitLabels } from "@/lib/rbac";
import { PageHeader, Card, Badge, Table, StatCard, Modal, Button, Field, inputClass } from "@/components/ui";
import { Icon } from "@/components/Icon";
import type { Question, UnitId } from "@/lib/types";

export default function QuestoesPage() {
  const { addQuestion, updateQuestion } = useApp();
  const { questions, unitId, can } = useAuthScope();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Question | null>(null);
  const [form, setForm] = useState({
    text: "",
    type: "multipla" as Question["type"],
    category: "Segurança",
    unitId: (unitId ?? "matriz") as UnitId,
  });

  const filtered = questions.filter(
    (q) => !query || q.text.toLowerCase().includes(query.toLowerCase()) || q.category.toLowerCase().includes(query.toLowerCase())
  );

  const reset = () =>
    setForm({ text: "", type: "multipla", category: "Segurança", unitId: (unitId ?? "matriz") as UnitId });

  const openEdit = (q: Question) => {
    setEditing(q);
    setForm({ text: q.text, type: q.type, category: q.category, unitId: q.unitId });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      updateQuestion(editing.id, form);
      setEditing(null);
    } else {
      addQuestion(form);
      setOpen(false);
    }
    reset();
  };

  return (
    <div>
      <PageHeader
        title="Banco de Questões"
        subtitle="Visualizar e administrar questões para avaliações (RF-051)"
        action={
          can("manage_content") && (
            <Button onClick={() => { reset(); setOpen(true); }}>
              <Icon name="plus" className="w-4 h-4" />
              Nova questão
            </Button>
          )
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard label="Total" value={questions.length.toString()} icon={<Icon name="list" className="w-5 h-5" />} />
        <StatCard label="Múltipla escolha" value={questions.filter((q) => q.type === "multipla").length.toString()} color="#2563eb" icon={<Icon name="check" className="w-5 h-5" />} />
        <StatCard label="Dissertativas" value={questions.filter((q) => q.type === "dissertativa").length.toString()} color="#7c3aed" icon={<Icon name="book" className="w-5 h-5" />} />
        <StatCard label="Usos totais" value={questions.reduce((s, q) => s + q.usageCount, 0).toString()} color="#d97706" icon={<Icon name="trend" className="w-5 h-5" />} />
      </div>

      <Card className="p-4 mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por enunciado ou categoria…"
          className="w-full px-3 py-2 rounded-lg bg-slate-100 text-sm outline-none"
        />
      </Card>

      <Card className="p-2">
        <Table head={["Questão", "Tipo", "Categoria", "Unidade", "Usos", "Ações"]}>
          {filtered.map((q) => (
            <tr key={q.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 text-slate-800 max-w-md">{q.text}</td>
              <td className="px-4 py-3"><Badge color="slate">{questionTypeLabels[q.type]}</Badge></td>
              <td className="px-4 py-3 text-slate-600">{q.category}</td>
              <td className="px-4 py-3 text-xs text-slate-500">{unitLabels[q.unitId]}</td>
              <td className="px-4 py-3 font-medium text-slate-700">{q.usageCount}</td>
              <td className="px-4 py-3">
                {can("manage_content") && (
                  <button onClick={() => openEdit(q)} className="text-xs text-brand font-medium hover:underline">Editar</button>
                )}
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      <Modal open={open || !!editing} onClose={() => { setOpen(false); setEditing(null); reset(); }} title={editing ? "Editar questão" : "Nova questão"}>
        <form onSubmit={submit}>
          <Field label="Enunciado">
            <textarea required className={inputClass} rows={3} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tipo">
              <select className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Question["type"] })}>
                <option value="multipla">{questionTypeLabels.multipla}</option>
                <option value="verdadeiro">{questionTypeLabels.verdadeiro}</option>
                <option value="dissertativa">{questionTypeLabels.dissertativa}</option>
              </select>
            </Field>
            <Field label="Categoria">
              <input className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </Field>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => { setOpen(false); setEditing(null); reset(); }}>Cancelar</Button>
            <Button type="submit">{editing ? "Salvar" : "Cadastrar"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
