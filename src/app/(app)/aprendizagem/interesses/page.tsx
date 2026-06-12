"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { useAuthScope } from "@/lib/use-auth-scope";
import { unitLabels } from "@/lib/rbac";
import { PageHeader, Card, Badge, Table, StatCard, Modal, Button, Field, inputClass } from "@/components/ui";
import { Icon } from "@/components/Icon";

export default function InteressesPage() {
  const { addInteresse } = useApp();
  const { interesses, courses, currentUser, can } = useAuthScope();
  const [open, setOpen] = useState(false);
  const [courseId, setCourseId] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !courseId) return;
    const course = courses.find((c) => c.id === courseId);
    if (!course) return;
    addInteresse({
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      courseId,
      courseTitle: course.title,
      unitId: currentUser.unitId,
    });
    setOpen(false);
    setCourseId("");
  };

  return (
    <div>
      <PageHeader
        title="Interesse em Cursos"
        subtitle="Registro e consulta de interesse em cursos (RF-047)"
        action={
          can("consume_learning") && (
            <Button onClick={() => setOpen(true)}>
              <Icon name="plus" className="w-4 h-4" />
              Registrar interesse
            </Button>
          )
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <StatCard label="Registros" value={interesses.length.toString()} icon={<Icon name="trend" className="w-5 h-5" />} />
        <StatCard label="Notificados" value={interesses.filter((i) => i.notified).length.toString()} color="#00a14b" icon={<Icon name="check" className="w-5 h-5" />} />
        <StatCard label="Aguardando aviso" value={interesses.filter((i) => !i.notified).length.toString()} color="#2563eb" icon={<Icon name="bell" className="w-5 h-5" />} />
      </div>

      <Card className="p-2">
        <Table head={["Usuário", "Curso", "Unidade", "Registrado em", "Notificado"]}>
          {interesses.map((i) => (
            <tr key={i.id} className="hover:bg-slate-50">
              <td className="px-4 py-3">{i.userName}</td>
              <td className="px-4 py-3 text-sm">{i.courseTitle}</td>
              <td className="px-4 py-3 text-xs text-slate-500">{unitLabels[i.unitId]}</td>
              <td className="px-4 py-3 text-xs text-slate-500">{i.registeredAt}</td>
              <td className="px-4 py-3">
                <Badge color={i.notified ? "green" : "amber"}>{i.notified ? "Sim" : "Pendente"}</Badge>
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Registrar interesse">
        <form onSubmit={submit}>
          <Field label="Curso">
            <select required className={inputClass} value={courseId} onChange={(e) => setCourseId(e.target.value)}>
              <option value="">Selecione…</option>
              {courses.filter((c) => c.status === "publicado").map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </Field>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit">Registrar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
