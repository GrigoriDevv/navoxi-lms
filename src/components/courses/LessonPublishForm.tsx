"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import { getCourseLessons } from "@/lib/course-progress";
import { getInstructorCourses } from "@/lib/instructor-courses";
import { resolveLessonVideoInput } from "@/lib/lesson-media";
import type { Course } from "@/lib/types";
import { Button, Field, inputClass } from "@/components/ui";

export interface ImportDraft {
  videoId: string;
  title: string;
  durationSec?: number;
  thumbnailUrl?: string;
}

type VideoSourceMode = "youtube" | "mp4";

interface LessonPublishFormProps {
  courses: Course[];
  instructorName?: string;
  restrictToInstructor?: boolean;
  onPublished?: () => void;
}

const MAX_UPLOAD_MB = 200;

export function LessonPublishForm({
  courses,
  instructorName,
  restrictToInstructor = false,
  onPublished,
}: LessonPublishFormProps) {
  const { courseModules, courseLessons, publishCourseLesson, importPlaylistLessons } =
    useApp();

  const availableCourses = useMemo(() => {
    if (restrictToInstructor && instructorName) {
      return getInstructorCourses(courses, instructorName);
    }
    return courses.filter((c) => c.status !== "arquivado");
  }, [courses, instructorName, restrictToInstructor]);

  const [courseId, setCourseId] = useState(availableCourses[0]?.id ?? "");
  const [moduleMode, setModuleMode] = useState<"existing" | "new">("existing");
  const [moduleId, setModuleId] = useState("");
  const [moduleTitle, setModuleTitle] = useState("Novo módulo");
  const [lessonTitle, setLessonTitle] = useState("");
  const [videoSourceMode, setVideoSourceMode] = useState<VideoSourceMode>("youtube");
  const [videoInput, setVideoInput] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [playlistInput, setPlaylistInput] = useState("");
  const [importDraft, setImportDraft] = useState<ImportDraft[]>([]);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const courseModulesForCourse = useMemo(
    () =>
      courseModules
        .filter((m) => m.courseId === courseId)
        .sort((a, b) => a.order - b.order),
    [courseModules, courseId]
  );

  const previewUrl =
    videoSourceMode === "mp4"
      ? uploadedFileUrl ?? (videoInput.trim() || null)
      : null;

  const handleCourseChange = (id: string) => {
    setCourseId(id);
    const mods = courseModules.filter((m) => m.courseId === id);
    if (mods.length > 0) {
      setModuleMode("existing");
      setModuleId(mods.sort((a, b) => a.order - b.order)[0].id);
    } else {
      setModuleMode("new");
      setModuleId("");
    }
    setFeedback(null);
    setError(null);
  };

  const clearUploadedFile = () => {
    setUploadedFile(null);
    setUploadedFileUrl(null);
    setUploadingFile(false);
  };

  const handleFileChange = (file: File | null) => {
    clearUploadedFile();
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setError("Selecione um arquivo de vídeo (MP4, WebM, MOV, etc.).");
      return;
    }

    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > MAX_UPLOAD_MB) {
      setError(`Arquivo muito grande (${sizeMb.toFixed(0)} MB). Máximo: ${MAX_UPLOAD_MB} MB.`);
      return;
    }

    setUploadingFile(true);
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedFile(file);
      setUploadedFileUrl(typeof reader.result === "string" ? reader.result : null);
      setUploadingFile(false);
    };
    reader.onerror = () => {
      setError("Não foi possível ler o arquivo de vídeo.");
      setUploadingFile(false);
    };
    reader.readAsDataURL(file);
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
        (
          data.items as Array<{
            videoId: string;
            durationSec?: number;
            thumbnailUrl?: string;
          }>
        ).map((item, idx) => ({
          videoId: item.videoId,
          title: `Aula ${getCourseLessons(courseId, courseLessons).length + idx + 1}`,
          durationSec: item.durationSec,
          thumbnailUrl: item.thumbnailUrl,
        }))
      );
    } catch (e) {
      setImportError(e instanceof Error ? e.message : "Erro ao importar");
      setImportDraft([]);
    } finally {
      setImportLoading(false);
    }
  };

  const savePlaylist = () => {
    if (!courseId || importDraft.length === 0) return;
    const title = moduleTitle.trim() || "Módulo importado";

    importPlaylistLessons(
      courseId,
      title,
      importDraft.map((d) => ({
        videoId: d.videoId,
        title: d.title,
        durationSec: d.durationSec,
      })),
      moduleMode === "existing" && moduleId ? moduleId : undefined
    );

    setImportDraft([]);
    setPlaylistInput("");
    setFeedback(`${importDraft.length} aulas importadas com sucesso.`);
    onPublished?.();
  };

  const publishSingle = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFeedback(null);

    if (!courseId) {
      setError("Selecione um curso.");
      return;
    }

    const resolved =
      videoSourceMode === "youtube"
        ? resolveLessonVideoInput(videoInput)
        : resolveLessonVideoInput(videoInput, uploadedFileUrl);

    if (!resolved) {
      setError(
        videoSourceMode === "youtube"
          ? "URL ou ID de vídeo do YouTube inválido."
          : "Envie um arquivo de vídeo ou informe uma URL direta (.mp4, .webm, .mov)."
      );
      return;
    }

    if (!lessonTitle.trim()) {
      setError("Informe o título da aula.");
      return;
    }
    if (moduleMode === "existing" && !moduleId && courseModulesForCourse.length > 0) {
      setError("Selecione um módulo.");
      return;
    }
    if (moduleMode === "new" && !moduleTitle.trim()) {
      setError("Informe o título do módulo.");
      return;
    }

    publishCourseLesson({
      courseId,
      moduleId: moduleMode === "existing" ? moduleId : undefined,
      moduleTitle: moduleMode === "new" ? moduleTitle : undefined,
      title: lessonTitle.trim(),
      youtubeVideoId: resolved.youtubeVideoId,
      videoUrl: resolved.videoUrl,
    });

    setLessonTitle("");
    setVideoInput("");
    if (videoSourceMode === "mp4") clearUploadedFile();
    setFeedback("Aula publicada. Alunos matriculados foram notificados.");
    onPublished?.();
  };

  if (availableCourses.length === 0) {
    return (
      <p className="text-sm text-slate-500 p-4 border border-dashed border-slate-200 rounded-xl">
        Nenhum curso disponível para publicação.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={publishSingle} className="space-y-4 p-5 border border-slate-200 rounded-xl bg-white">
        <h3 className="text-sm font-semibold text-slate-800">Publicar aula em vídeo</h3>

        {feedback && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            {feedback}
          </p>
        )}
        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <Field label="Curso">
          <select
            className={inputClass}
            value={courseId}
            onChange={(e) => handleCourseChange(e.target.value)}
          >
            {availableCourses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} ({c.status})
              </option>
            ))}
          </select>
        </Field>

        <Field label="Módulo">
          {courseModulesForCourse.length > 0 && (
            <div className="flex gap-4 mb-2 text-sm">
              <label className="flex items-center gap-1.5">
                <input
                  type="radio"
                  checked={moduleMode === "existing"}
                  onChange={() => setModuleMode("existing")}
                />
                Módulo existente
              </label>
              <label className="flex items-center gap-1.5">
                <input
                  type="radio"
                  checked={moduleMode === "new"}
                  onChange={() => setModuleMode("new")}
                />
                Novo módulo
              </label>
            </div>
          )}
          {moduleMode === "existing" && courseModulesForCourse.length > 0 ? (
            <select
              className={inputClass}
              value={moduleId}
              onChange={(e) => setModuleId(e.target.value)}
            >
              {courseModulesForCourse.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          ) : (
            <input
              className={inputClass}
              value={moduleTitle}
              onChange={(e) => setModuleTitle(e.target.value)}
              placeholder="Nome do módulo"
            />
          )}
        </Field>

        <Field label="Título da aula (exibido ao aluno)">
          <input
            required
            className={inputClass}
            value={lessonTitle}
            onChange={(e) => setLessonTitle(e.target.value)}
            placeholder="Ex.: Introdução ao tema"
          />
        </Field>

        <Field label="Formato do vídeo">
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                checked={videoSourceMode === "youtube"}
                onChange={() => {
                  setVideoSourceMode("youtube");
                  clearUploadedFile();
                  setVideoInput("");
                  setError(null);
                }}
              />
              YouTube
            </label>
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                checked={videoSourceMode === "mp4"}
                onChange={() => {
                  setVideoSourceMode("mp4");
                  setVideoInput("");
                  setError(null);
                }}
              />
              Arquivo / URL de vídeo (MP4)
            </label>
          </div>
        </Field>

        {videoSourceMode === "youtube" ? (
          <Field label="Vídeo do YouTube (URL ou ID)">
            <input
              required
              className={inputClass}
              value={videoInput}
              onChange={(e) => setVideoInput(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
            />
          </Field>
        ) : (
          <>
            <Field label="Arquivo de vídeo">
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/*,.mp4,.webm,.mov"
                className={`${inputClass} file:mr-3 file:rounded-md file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white`}
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              />
              {uploadingFile && (
                <p className="text-xs text-slate-500 mt-1">Carregando arquivo...</p>
              )}
              {uploadedFile && !uploadingFile && (
                <p className="text-xs text-slate-500 mt-1">
                  {uploadedFile.name} ({(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB)
                </p>
              )}
            </Field>
            <Field label="Ou URL direta do vídeo">
              <input
                className={inputClass}
                value={videoInput}
                onChange={(e) => setVideoInput(e.target.value)}
                placeholder="https://exemplo.com/aula.mp4"
                disabled={!!uploadedFile}
              />
            </Field>
            {previewUrl && (
              <div className="rounded-lg overflow-hidden border border-slate-200 bg-black aspect-video max-w-md">
                <video
                  src={previewUrl}
                  className="w-full h-full object-contain"
                  controls
                  preload="metadata"
                />
              </div>
            )}
          </>
        )}

        <Button type="submit">Publicar aula</Button>
      </form>

      <div className="space-y-3 p-5 border border-slate-200 rounded-xl bg-slate-50/50">
        <h3 className="text-sm font-semibold text-slate-800">Importar playlist do YouTube</h3>
        <Field label="URL ou ID da playlist">
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
        {importError && <p className="text-xs text-red-600">{importError}</p>}
        {importDraft.length > 0 && (
          <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-100 rounded-lg p-2 bg-white">
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
              <Button type="button" onClick={savePlaylist}>
                Salvar {importDraft.length} aulas importadas
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
