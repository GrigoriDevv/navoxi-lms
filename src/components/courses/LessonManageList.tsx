"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/store";
import type { CourseLesson, CourseModule } from "@/lib/types";
import {
  formatLessonMediaLabel,
  getLessonMedia,
  getLessonVideoInputValue,
  lessonUsesUploadedFile,
  resolveLessonVideoInput,
} from "@/lib/lesson-media";
import { Modal, Button, Field, inputClass } from "@/components/ui";
import { Icon } from "@/components/Icon";

type VideoSourceMode = "youtube" | "mp4";

interface LessonRow extends CourseLesson {
  courseTitle?: string;
  moduleTitle?: string;
}

interface LessonManageListProps {
  lessons: LessonRow[];
  courseModules?: CourseModule[];
  showCourse?: boolean;
  showPreview?: boolean;
  title?: string;
  emptyMessage?: string;
  onChanged?: () => void;
}

export function LessonManageList({
  lessons,
  courseModules = [],
  showCourse = false,
  showPreview = true,
  title = "Aulas do curso",
  emptyMessage = "Nenhuma aula cadastrada.",
  onChanged,
}: LessonManageListProps) {
  const { updateCourseLesson, deleteCourseLesson } = useApp();
  const [editingLesson, setEditingLesson] = useState<LessonRow | null>(null);
  const [lessonTitle, setLessonTitle] = useState("");
  const [videoSourceMode, setVideoSourceMode] = useState<VideoSourceMode>("youtube");
  const [videoInput, setVideoInput] = useState("");
  const [replaceFileUrl, setReplaceFileUrl] = useState<string | null>(null);
  const [replaceFileName, setReplaceFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const modulesForLesson = useMemo(() => {
    if (!editingLesson) return [];
    return courseModules
      .filter((m) => m.courseId === editingLesson.courseId)
      .sort((a, b) => a.order - b.order);
  }, [courseModules, editingLesson]);

  const openEdit = (lesson: LessonRow) => {
    const media = getLessonMedia(lesson);
    setEditingLesson(lesson);
    setLessonTitle(lesson.title);
    setVideoSourceMode(media?.kind === "video" ? "mp4" : "youtube");
    setVideoInput(getLessonVideoInputValue(lesson));
    setReplaceFileUrl(null);
    setReplaceFileName(null);
    setError(null);
  };

  const closeEdit = () => {
    setEditingLesson(null);
    setError(null);
    setReplaceFileUrl(null);
    setReplaceFileName(null);
  };

  const handleReplaceFile = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      setError("Selecione um arquivo de vídeo.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setReplaceFileUrl(typeof reader.result === "string" ? reader.result : null);
      setReplaceFileName(file.name);
      setError(null);
    };
    reader.onerror = () => setError("Não foi possível ler o arquivo.");
    reader.readAsDataURL(file);
  };

  const saveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLesson) return;

    if (!lessonTitle.trim()) {
      setError("Informe o título da aula.");
      return;
    }

    const resolved =
      videoSourceMode === "youtube"
        ? resolveLessonVideoInput(videoInput)
        : resolveLessonVideoInput(videoInput, replaceFileUrl);

    const base = {
      title: lessonTitle.trim(),
      moduleId: editingLesson.moduleId,
    };

    if (videoInput.trim() || replaceFileUrl) {
      if (!resolved) {
        setError(
          videoSourceMode === "youtube"
            ? "URL ou ID do YouTube inválido."
            : "Informe uma URL de vídeo válida ou envie um novo arquivo."
        );
        return;
      }

      if (resolved.youtubeVideoId) {
        updateCourseLesson(editingLesson.id, {
          ...base,
          youtubeVideoId: resolved.youtubeVideoId,
          videoUrl: undefined,
        });
      } else if (resolved.videoUrl) {
        updateCourseLesson(editingLesson.id, {
          ...base,
          videoUrl: resolved.videoUrl,
          youtubeVideoId: undefined,
        });
      }
    } else {
      updateCourseLesson(editingLesson.id, base);
    }

    closeEdit();
    onChanged?.();
  };

  const handleDelete = (lesson: LessonRow) => {
    const confirmed = window.confirm(
      `Remover a aula "${lesson.title}"? Esta ação não pode ser desfeita.`
    );
    if (!confirmed) return;
    deleteCourseLesson(lesson.id);
    onChanged?.();
  };

  if (lessons.length === 0) {
    return (
      <p className="text-sm text-slate-500 p-3 border border-dashed border-slate-200 rounded-lg">
        {emptyMessage}
      </p>
    );
  }

  return (
    <>
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        <ul className="space-y-2 max-h-56 overflow-y-auto">
          {lessons.map((lesson) => (
            <li
              key={lesson.id}
              className="flex flex-wrap items-center gap-2 p-2 rounded-lg border border-slate-100 bg-slate-50/50"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{lesson.title}</p>
                <p className="text-[11px] text-slate-500">
                  {showCourse && lesson.courseTitle ? `${lesson.courseTitle} · ` : ""}
                  {lesson.moduleTitle ? `${lesson.moduleTitle} · ` : ""}
                  {formatLessonMediaLabel(lesson)} · ordem {lesson.order}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {showPreview && (
                  <Link
                    href={`/aprendizagem/cursos/${lesson.courseId}?aula=${lesson.id}`}
                    className="p-1.5 rounded-md text-brand hover:bg-brand/10"
                    title="Preview"
                  >
                    <Icon name="video" className="w-4 h-4" />
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => openEdit(lesson)}
                  className="p-1.5 rounded-md text-slate-600 hover:bg-white hover:text-brand"
                  title="Editar aula"
                >
                  <Icon name="edit" className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(lesson)}
                  className="p-1.5 rounded-md text-red-600 hover:bg-red-50"
                  title="Apagar aula"
                >
                  <Icon name="trash" className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <Modal open={!!editingLesson} onClose={closeEdit} title="Editar aula">
        {editingLesson && (
          <form onSubmit={saveEdit} className="space-y-4">
            {error && (
              <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Field label="Título da aula">
              <input
                required
                className={inputClass}
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
              />
            </Field>

            {modulesForLesson.length > 0 && (
              <Field label="Módulo">
                <select
                  className={inputClass}
                  value={editingLesson.moduleId}
                  onChange={(e) =>
                    setEditingLesson({ ...editingLesson, moduleId: e.target.value })
                  }
                >
                  {modulesForLesson.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            <Field label="Formato do vídeo">
              <div className="flex flex-wrap gap-4 text-sm">
                <label className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    checked={videoSourceMode === "youtube"}
                    onChange={() => setVideoSourceMode("youtube")}
                  />
                  YouTube
                </label>
                <label className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    checked={videoSourceMode === "mp4"}
                    onChange={() => setVideoSourceMode("mp4")}
                  />
                  Vídeo (MP4)
                </label>
              </div>
            </Field>

            {videoSourceMode === "youtube" ? (
              <Field label="Vídeo do YouTube (URL ou ID)">
                <input
                  className={inputClass}
                  value={videoInput}
                  onChange={(e) => setVideoInput(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </Field>
            ) : (
              <>
                {lessonUsesUploadedFile(editingLesson) && !replaceFileUrl && (
                  <p className="text-xs text-slate-500">
                    Esta aula usa um arquivo enviado anteriormente. Envie um novo arquivo ou informe uma URL para substituir.
                  </p>
                )}
                <Field label="Novo arquivo de vídeo (opcional)">
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/*,.mp4,.webm,.mov"
                    className={`${inputClass} file:mr-3 file:rounded-md file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white`}
                    onChange={(e) => handleReplaceFile(e.target.files?.[0] ?? null)}
                  />
                  {replaceFileName && (
                    <p className="text-xs text-slate-500 mt-1">{replaceFileName}</p>
                  )}
                </Field>
                <Field label="URL do vídeo (opcional)">
                  <input
                    className={inputClass}
                    value={videoInput}
                    onChange={(e) => setVideoInput(e.target.value)}
                    placeholder="https://exemplo.com/aula.mp4"
                    disabled={!!replaceFileUrl}
                  />
                </Field>
              </>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={closeEdit}>
                Cancelar
              </Button>
              <Button type="submit">Salvar aula</Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
