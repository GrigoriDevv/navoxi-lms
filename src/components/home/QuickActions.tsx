"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { useAuthScope } from "@/lib/use-auth-scope";
import { getActionsForPermissions } from "@/lib/quick-shortcuts";
import { roleLabels, unitLabels } from "@/lib/rbac";
import { Icon } from "@/components/Icon";
import { Modal, Button, Field, inputClass } from "@/components/ui";
import type { Role, UnitId } from "@/lib/types";

export function QuickActions() {
  const router = useRouter();
  const { addUser, addTurma, addPost, courses: _courses, currentUser } = useApp();
  const { can, unitId, isGlobal, courses: scopedCourses } = useAuthScope();

  const actions = getActionsForPermissions(can);
  const [active, setActive] = useState<"create_turma" | "create_user" | "publish_post" | null>(null);
  const [saved, setSaved] = useState(false);

  const [turmaForm, setTurmaForm] = useState({
    name: "",
    courseId: scopedCourses[0]?.id ?? "",
    instructor: currentUser?.name ?? "",
    unitId: (unitId ?? "matriz") as UnitId,
    startDate: "2026-06-15",
    endDate: "2026-07-15",
    capacity: 30,
    enrolled: 0,
    status: "agendada" as const,
  });

  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    role: "aluno" as Role,
    unitId: (unitId ?? "matriz") as UnitId,
    department: "Navoxi · Operações",
    status: "ativo" as const,
  });

  const [postForm, setPostForm] = useState({
    title: "",
    body: "",
    unitId: (unitId ?? "matriz") as UnitId,
  });

  if (actions.length === 0) return null;

  const close = () => {
    setActive(null);
    setSaved(false);
  };

  const submitTurma = (e: React.FormEvent) => {
    e.preventDefault();
    addTurma(turmaForm);
    setSaved(true);
    setTimeout(() => {
      close();
      router.push("/aprendizagem/turmas");
    }, 600);
  };

  const submitUser = (e: React.FormEvent) => {
    e.preventDefault();
    addUser(userForm);
    setSaved(true);
    setTimeout(() => {
      close();
      router.push("/administracao");
    }, 600);
  };

  const submitPost = (e: React.FormEvent) => {
    e.preventDefault();
    addPost(postForm);
    setSaved(true);
    setTimeout(() => {
      close();
      router.push("/comunicacao");
    }, 600);
  };

  const assignableRoles: Role[] = isGlobal
    ? ["admin_premium", "admin_unidade", "gestor_conteudo", "instrutor", "aluno"]
    : ["gestor_conteudo", "instrutor", "aluno"];

  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-800 mb-3">Ações rápidas</h2>
      <div className="flex flex-wrap gap-2">
        {actions.map((a) => (
          <button
            key={a.id}
            onClick={() => setActive(a.action)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-dashed border-slate-300 text-slate-700 text-sm font-semibold hover:border-brand hover:bg-blue-50/50 transition"
          >
            <Icon name={a.icon} className="w-4 h-4 text-brand" />
            {a.label}
          </button>
        ))}
      </div>

      <Modal open={active === "create_turma"} onClose={close} title="Criar turma">
        <form onSubmit={submitTurma}>
          <Field label="Nome da turma">
            <input required className={inputClass} value={turmaForm.name} onChange={(e) => setTurmaForm({ ...turmaForm, name: e.target.value })} />
          </Field>
          <Field label="Curso">
            <select required className={inputClass} value={turmaForm.courseId} onChange={(e) => setTurmaForm({ ...turmaForm, courseId: e.target.value })}>
              {scopedCourses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Início">
              <input type="date" required className={inputClass} value={turmaForm.startDate} onChange={(e) => setTurmaForm({ ...turmaForm, startDate: e.target.value })} />
            </Field>
            <Field label="Término">
              <input type="date" required className={inputClass} value={turmaForm.endDate} onChange={(e) => setTurmaForm({ ...turmaForm, endDate: e.target.value })} />
            </Field>
          </div>
          <Field label="Capacidade">
            <input type="number" min={1} className={inputClass} value={turmaForm.capacity} onChange={(e) => setTurmaForm({ ...turmaForm, capacity: Number(e.target.value) })} />
          </Field>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={close}>Cancelar</Button>
            <Button type="submit">{saved ? "Criada!" : "Criar turma"}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={active === "create_user"} onClose={close} title="Criar usuário">
        <form onSubmit={submitUser}>
          <Field label="Nome completo">
            <input required className={inputClass} value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} />
          </Field>
          <Field label="E-mail">
            <input required type="email" className={inputClass} value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Perfil">
              <select className={inputClass} value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value as Role })}>
                {assignableRoles.map((r) => (
                  <option key={r} value={r}>{roleLabels[r]}</option>
                ))}
              </select>
            </Field>
            <Field label="Departamento">
              <input className={inputClass} value={userForm.department} onChange={(e) => setUserForm({ ...userForm, department: e.target.value })} />
            </Field>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={close}>Cancelar</Button>
            <Button type="submit">{saved ? "Criado!" : "Criar usuário"}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={active === "publish_post"} onClose={close} title="Publicar post no mural">
        <form onSubmit={submitPost}>
          <Field label="Título">
            <input required className={inputClass} value={postForm.title} onChange={(e) => setPostForm({ ...postForm, title: e.target.value })} />
          </Field>
          <Field label="Conteúdo">
            <textarea
              required
              rows={4}
              className={inputClass}
              value={postForm.body}
              onChange={(e) => setPostForm({ ...postForm, body: e.target.value })}
            />
          </Field>
          {isGlobal && (
            <Field label="Unidade">
              <select className={inputClass} value={postForm.unitId} onChange={(e) => setPostForm({ ...postForm, unitId: e.target.value as UnitId })}>
                {(Object.keys(unitLabels) as UnitId[]).map((id) => (
                  <option key={id} value={id}>{unitLabels[id]}</option>
                ))}
              </select>
            </Field>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={close}>Cancelar</Button>
            <Button type="submit">{saved ? "Publicado!" : "Publicar post"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
