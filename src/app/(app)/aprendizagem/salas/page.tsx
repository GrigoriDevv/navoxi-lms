"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { useAuthScope } from "@/lib/use-auth-scope";
import { modalityLabels } from "@/lib/aprendizagem";
import { unitLabels } from "@/lib/rbac";
import { PageHeader, Card, Badge, Table, StatCard, Modal, Button, Field, inputClass } from "@/components/ui";
import { Icon } from "@/components/Icon";
import type { Sala, UnitId } from "@/lib/types";

const statusColor = { disponivel: "green", manutencao: "amber", indisponivel: "red" } as const;

export default function SalasPage() {
  const { addSala } = useApp();
  const { salas, unitId, isGlobal, unitLabel, can } = useAuthScope();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    unitId: (unitId ?? "matriz") as UnitId,
    location: "",
    capacity: 30,
    resources: "Projetor, Quadro",
    status: "disponivel" as Sala["status"],
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    addSala({
      ...form,
      resources: form.resources.split(",").map((r) => r.trim()),
    });
    setOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Salas Físicas"
        subtitle="Cadastro e utilização de salas para treinamentos presenciais (RF-045)"
        action={
          can("manage_turmas") && (
            <Button onClick={() => setOpen(true)}>
              <Icon name="plus" className="w-4 h-4" />
              Nova sala
            </Button>
          )
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard label="Total" value={salas.length.toString()} icon={<Icon name="plug" className="w-5 h-5" />} />
        <StatCard label="Disponíveis" value={salas.filter((s) => s.status === "disponivel").length.toString()} color="#2563eb" icon={<Icon name="check" className="w-5 h-5" />} />
        <StatCard label="Capacidade total" value={salas.reduce((s, x) => s + x.capacity, 0).toString()} icon={<Icon name="group" className="w-5 h-5" />} color="#2563eb" />
        <StatCard label="Escopo" value={isGlobal ? "Todas" : unitLabel ?? "—"} icon={<Icon name="grid" className="w-5 h-5" />} color="#7c3aed" />
      </div>

      <Card className="p-2">
        <Table head={["Sala", "Local", "Unidade", "Capacidade", "Recursos", "Status"]}>
          {salas.map((s) => (
            <tr key={s.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-medium text-slate-800">{s.name}</td>
              <td className="px-4 py-3 text-slate-600">{s.location}</td>
              <td className="px-4 py-3 text-xs text-slate-500">{unitLabels[s.unitId]}</td>
              <td className="px-4 py-3">{s.capacity}</td>
              <td className="px-4 py-3 text-xs text-slate-500">{s.resources.join(", ")}</td>
              <td className="px-4 py-3"><Badge color={statusColor[s.status]}>{s.status}</Badge></td>
            </tr>
          ))}
        </Table>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Cadastrar sala">
        <form onSubmit={submit}>
          <Field label="Nome"><input required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Local"><input required className={inputClass} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Capacidade"><input type="number" min={1} className={inputClass} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} /></Field>
            <Field label="Status">
              <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Sala["status"] })}>
                <option value="disponivel">Disponível</option>
                <option value="manutencao">Manutenção</option>
                <option value="indisponivel">Indisponível</option>
              </select>
            </Field>
          </div>
          <Field label="Recursos (separados por vírgula)"><input className={inputClass} value={form.resources} onChange={(e) => setForm({ ...form, resources: e.target.value })} /></Field>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
