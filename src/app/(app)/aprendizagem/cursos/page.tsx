"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { useAuthScope } from "@/lib/use-auth-scope";
import { modalityLabels, courseStatusLabels } from "@/lib/aprendizagem";
import { unitLabels } from "@/lib/rbac";
import { getCourseLessons } from "@/lib/course-progress";
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

interface ImportDraft {
  videoId: string;
  title: string;
  durationSec?: number;
  thumbnailUrl?: string;
}

const statusColor = {
  publicado: "green",
  rascunho: "amber",
  arquivado: "slate",
} as const;

export default function CursosPage() {
  const { addCourse, updateCourse, importPlaylistLessons, updateCourseLesson } = useApp();
  const {
    courses,
    courseLessons,
    inscricoes,
    currentUser,
    unitId,
    isGlobal,
    unitLabel,
    can,
  } = useAuthScope();
  const [filter, setFilter] = useState("todos");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const canManage = can("manage_courses");
  const canConsume = can("consume_learning");
  const [playlistInput, setPlaylistInput] = useState("");
  const [moduleTitle, setModuleTitle] = useState("Módulo importado");
  const [importDraft, setImportDraft] = useState<ImportDraft[]>([]);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
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

  const myEnrolledIds = useMemo(
    () =>
      new Set(
        inscricoes
          .filter(
            (i) =>
              i.status === "ativa" &&
              (!currentUser || i.userId === currentUser.id)
          )
          .map((i) => i.courseId)
      ),
    [inscricoes, currentUser]
  );

  const lessonCount = (courseId: string) =>
    getCourseLessons(courseId, courseLessons).length;

  const resetImport = () => {
    setPlaylistInput("");
    setModuleTitle("Módulo importado");
    setImportDraft([]);
    setImportError(null);
    setImportLoading(false);
  };

  const resetForm = () => {
    resetImport();
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
  };

  const openEdit = (c: Course) => {
    resetImport();
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

  const fetchPlaylist = async () => {
    if (!playlistInput.trim()) return;
    setImportLoading(true);
    setImportError(null);
    try {
      const params = new URLSearchParams({ playlistId: playlistInput.trim() });
      const res = await fetch(`/api/youtube/playlist?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao importar playlist");
      setImportDraft(
        (data.items as Array<{ videoId: string; durationSec?: number; thumbnailUrl?: string; position: number }>).map(
          (item, idx) => ({
            videoId: item.videoId,
            title: `Aula ${idx + 1}`,
            durationSec: item.durationSec,
            thumbnailUrl: item.thumbnailUrl,
          })
        )
      );
    } catch (e) {
      setImportError(e instanceof Error ? e.message : "Erro ao importar");
      setImportDraft([]);
    } finally {
      setImportLoading(false);
    }
  };

  const saveImport = () => {
    if (!editing || importDraft.length === 0) return;
    importPlaylistLessons(
      editing.id,
      moduleTitle.trim() || "Módulo importado",
      importDraft.map((d) => ({
        videoId: d.videoId,
        title: d.title,
        durationSec: d.durationSec,
      }))
    );
    resetImport();
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
                  <span>
                    {lessonCount(c.id) > 0
                      ? `${lessonCount(c.id)} aulas`
                      : `${c.completion}% conclusão`}
                  </span>
                </div>
                <ProgressBar value={c.completion} />
              </div>
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100">
                {canConsume &&
                  c.status === "publicado" &&
                  (myEnrolledIds.has(c.id) || canManage) &&
                  lessonCount(c.id) > 0 && (
                    <Link
                      href={`/aprendizagem/cursos/${c.id}`}
                      className="text-xs font-semibold text-white bg-brand px-3 py-1.5 rounded-lg hover:opacity-90"
                    >
                      {myEnrolledIds.has(c.id) ? "Assistir" : "Preview"}
                    </Link>
                  )}
                {canManage && (
                  <>
                  <button onClick={() => openEdit(c)} className="text-xs text-brand font-medium hover:underline">Editar</button>
                  {c.status !== "publicado" && (
                    <button onClick={() => publish(c.id)} className="text-xs text-blue-600 font-medium hover:underline">Publicar</button>
                  )}
                  {c.status !== "arquivado" && (
                    <button onClick={() => archive(c.id)} className="text-xs text-slate-500 font-medium hover:underline">Arquivar</button>
                  )}
                  </>
                )}
              </div>
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
          {editing && canManage && (
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
              <h3 className="text-sm font-semibold text-slate-800">Conteúdo do curso</h3>
              {getCourseLessons(editing.id, courseLessons).length > 0 && (
                <ul className="space-y-2 max-h-40 overflow-y-auto">
                  {getCourseLessons(editing.id, courseLessons).map((lesson) => (
                    <li key={lesson.id} className="flex gap-2 items-center">
                      <input
                        className={`${inputClass} flex-1 text-sm`}
                        value={lesson.title}
                        onChange={(e) =>
                          updateCourseLesson(lesson.id, { title: e.target.value })
                        }
                      />
                      <span className="text-[10px] text-slate-400 shrink-0">ID oculto</span>
                    </li>
                  ))}
                </ul>
              )}
              <Field label="Título do módulo">
                <input
                  className={inputClass}
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                />
              </Field>
              <Field label="Playlist do YouTube (URL ou ID)">
                <div className="flex gap-2">
                  <input
                    className={inputClass}
                    value={playlistInput}
                    onChange={(e) => setPlaylistInput(e.target.value)}
                    placeholder="https://youtube.com/playlist?list=PL..."
                  />
                  <Button type="button" variant="outline" onClick={() => !importLoading && void fetchPlaylist()}>
                    {importLoading ? "..." : "Importar"}
                  </Button>
                </div>
              </Field>
              {importError && (
                <p className="text-xs text-red-600">{importError}</p>
              )}
              {importDraft.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-100 rounded-lg p-2">
                  {importDraft.map((item, idx) => (
                    <div key={item.videoId} className="flex gap-2 items-center">
                      {item.thumbnailUrl && (
                        <img
                          src={item.thumbnailUrl}
                          alt=""
                          className="w-12 h-8 object-cover rounded shrink-0"
                        />
                      )}
                      <input
                        className={`${inputClass} flex-1 text-sm`}
                        value={item.title}
                        onChange={(e) =>
                          setImportDraft((prev) =>
                            prev.map((d, i) =>
                              i === idx ? { ...d, title: e.target.value } : d
                            )
                          )
                        }
                      />
                    </div>
                  ))}
                  <div className="w-full mt-2">
                    <Button type="button" onClick={saveImport}>
                      Salvar {importDraft.length} aulas importadas
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
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
