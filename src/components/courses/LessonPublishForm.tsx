"use client";

import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import { getCourseLessons } from "@/lib/course-progress";
import { getInstructorCourses } from "@/lib/instructor-courses";
import { resolveLessonVideoInput } from "@/lib/lesson-media";
import type { Course } from "@/lib/types";
import { lmsApi } from "@/lib/api-client";
import { isJavaApiEnabled } from "@/lib/api-config";
import { Button, Field, inputClass } from "@/components/ui";

export interface ImportDraft {
  videoId: string;
  title: string;
  durationSec?: number;
  thumbnailUrl?: string;
}

interface Mp4Draft {
  id: string;
  title: string;
  file: File;
  previewUrl: string;
  fileName: string;
}

type VideoSourceMode = "youtube" | "mp4";

interface LessonPublishFormProps {
  courses: Course[];
  fixedCourseId?: string;
  instructorName?: string;
  restrictToInstructor?: boolean;
  onPublished?: () => void;
}

const MAX_UPLOAD_MB = 100;

async function uploadOrPreviewUrl(courseId: string, file: File): Promise<string> {
  if (isJavaApiEnabled()) {
    return lmsApi.uploadLessonVideo(courseId, file);
  }
  return URL.createObjectURL(file);
}

export function LessonPublishForm({
  courses,
  fixedCourseId,
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
  const [mp4Drafts, setMp4Drafts] = useState<Mp4Draft[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [playlistInput, setPlaylistInput] = useState("");
  const [importDraft, setImportDraft] = useState<ImportDraft[]>([]);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lockedCourse = useMemo(
    () => (fixedCourseId ? availableCourses.find((c) => c.id === fixedCourseId) : null),
    [availableCourses, fixedCourseId]
  );

  const syncCourseModules = (id: string) => {
    const mods = courseModules.filter((m) => m.courseId === id);
    if (mods.length > 0) {
      setModuleMode("existing");
      setModuleId(mods.sort((a, b) => a.order - b.order)[0].id);
    } else {
      setModuleMode("new");
      setModuleId("");
    }
  };

  useEffect(() => {
    if (fixedCourseId && availableCourses.some((c) => c.id === fixedCourseId)) {
      setCourseId(fixedCourseId);
      syncCourseModules(fixedCourseId);
    }
  }, [fixedCourseId, availableCourses]);

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
    if (fixedCourseId) return;
    setCourseId(id);
    syncCourseModules(id);
    setFeedback(null);
    setError(null);
  };

  const clearUploadedFile = () => {
    if (uploadedFileUrl?.startsWith("blob:")) URL.revokeObjectURL(uploadedFileUrl);
    for (const d of mp4Drafts) {
      if (d.previewUrl.startsWith("blob:")) URL.revokeObjectURL(d.previewUrl);
    }
    setUploadedFile(null);
    setUploadedFileUrl(null);
    setMp4Drafts([]);
    setUploadingFile(false);
  };

  const titleFromFileName = (name: string) =>
    name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim() || "Nova aula";

  const handleFileChange = async (files: FileList | null) => {
    clearUploadedFile();
    if (!files || files.length === 0) return;

    const selected = Array.from(files);
    const invalid = selected.find((f) => !f.type.startsWith("video/"));
    if (invalid) {
      setError("Selecione apenas arquivos de vídeo (MP4, WebM, MOV, etc.).");
      return;
    }

    const tooLarge = selected.find((f) => f.size / (1024 * 1024) > MAX_UPLOAD_MB);
    if (tooLarge) {
      setError(`Arquivo muito grande (${tooLarge.name}). Máximo: ${MAX_UPLOAD_MB} MB por vídeo.`);
      return;
    }

    setUploadingFile(true);
    setError(null);
    try {
      if (selected.length === 1) {
        const file = selected[0];
        const previewUrl = URL.createObjectURL(file);
        setUploadedFile(file);
        setUploadedFileUrl(previewUrl);
        if (!lessonTitle.trim()) {
          setLessonTitle(titleFromFileName(file.name));
        }
      } else {
        setMp4Drafts(
          selected.map((file) => ({
            id: `${file.name}-${file.size}-${file.lastModified}`,
            title: titleFromFileName(file.name),
            file,
            previewUrl: URL.createObjectURL(file),
            fileName: file.name,
          }))
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar vídeos.");
      clearUploadedFile();
    } finally {
      setUploadingFile(false);
    }
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

  const publishToCourse = (payload: {
    title: string;
    youtubeVideoId?: string;
    videoUrl?: string;
  }) => {
    publishCourseLesson({
      courseId,
      moduleId: moduleMode === "existing" ? moduleId : undefined,
      moduleTitle: moduleMode === "new" ? moduleTitle : undefined,
      title: payload.title,
      youtubeVideoId: payload.youtubeVideoId,
      videoUrl: payload.videoUrl,
    });
  };

  const publishMp4Batch = async () => {
    if (!courseId || mp4Drafts.length === 0) return;
    if (moduleMode === "existing" && !moduleId && courseModulesForCourse.length > 0) {
      setError("Selecione um módulo.");
      return;
    }
    if (moduleMode === "new" && !moduleTitle.trim()) {
      setError("Informe o título do módulo.");
      return;
    }

    setUploadingFile(true);
    setError(null);
    try {
      const uploaded = [];
      for (const draft of mp4Drafts) {
        const videoUrl = await uploadOrPreviewUrl(courseId, draft.file);
        uploaded.push({
          title: draft.title.trim() || titleFromFileName(draft.fileName),
          videoUrl,
        });
      }

      const count = uploaded.length;
      importPlaylistLessons(
        courseId,
        moduleTitle.trim() || "Módulo de vídeos",
        uploaded,
        moduleMode === "existing" && moduleId ? moduleId : undefined
      );

      clearUploadedFile();
      setFeedback(
        lockedCourse
          ? `${count} vídeo(s) adicionados ao curso "${lockedCourse.title}".`
          : `${count} vídeo(s) adicionados ao curso.`
      );
      onPublished?.();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Falha no upload. Verifique se o storage S3 está configurado (LMS_S3_ENABLED)."
      );
    } finally {
      setUploadingFile(false);
    }
  };

  const publishSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);
    setFeedback(null);

    if (!courseId) {
      setError("Selecione um curso.");
      return;
    }

    let uploadedHttpUrl: string | null = null;
    if (videoSourceMode === "mp4" && uploadedFile) {
      setUploadingFile(true);
      try {
        uploadedHttpUrl = await uploadOrPreviewUrl(courseId, uploadedFile);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Falha no upload. Verifique se o storage S3 está configurado (LMS_S3_ENABLED)."
        );
        setUploadingFile(false);
        return;
      }
      setUploadingFile(false);
    }

    const resolved =
      videoSourceMode === "youtube"
        ? resolveLessonVideoInput(videoInput)
        : resolveLessonVideoInput(videoInput, uploadedHttpUrl);

    if (!resolved) {
      setError(
        videoSourceMode === "youtube"
          ? "URL ou ID de vídeo do YouTube inválido."
          : "Envie um arquivo de vídeo ou informe uma URL http(s) direta (.mp4, .webm, .mov)."
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

    publishToCourse({
      title: lessonTitle.trim(),
      youtubeVideoId: resolved.youtubeVideoId,
      videoUrl: resolved.videoUrl,
    });

    setLessonTitle("");
    setVideoInput("");
    if (videoSourceMode === "mp4") clearUploadedFile();
    setFeedback(
      lockedCourse
        ? `Aula publicada em "${lockedCourse.title}".`
        : "Aula publicada. Alunos matriculados foram notificados."
    );
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
        <h3 className="text-sm font-semibold text-slate-800">
          {lockedCourse ? `Adicionar vídeos ao curso: ${lockedCourse.title}` : "Publicar aula em vídeo"}
        </h3>

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

        {!fixedCourseId && (
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
        )}

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
                multiple
                accept="video/mp4,video/webm,video/quicktime,video/*,.mp4,.webm,.mov"
                className={`${inputClass} file:mr-3 file:rounded-md file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white`}
                onChange={(e) => void handleFileChange(e.target.files)}
              />
              {uploadingFile && (
                <p className="text-xs text-slate-500 mt-1">Carregando arquivo(s)...</p>
              )}
              {uploadedFile && !uploadingFile && (
                <p className="text-xs text-slate-500 mt-1">
                  {uploadedFile.name} ({(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB)
                </p>
              )}
              {mp4Drafts.length > 0 && (
                <div className="mt-3 space-y-2 max-h-48 overflow-y-auto border border-slate-100 rounded-lg p-2">
                  {mp4Drafts.map((draft) => (
                    <div key={draft.id} className="flex gap-2 items-center">
                      <input
                        className={`${inputClass} flex-1 text-sm`}
                        value={draft.title}
                        onChange={(e) =>
                          setMp4Drafts((prev) =>
                            prev.map((d) =>
                              d.id === draft.id ? { ...d, title: e.target.value } : d
                            )
                          )
                        }
                      />
                      <span className="text-[10px] text-slate-400 shrink-0 max-w-[100px] truncate">
                        {draft.fileName}
                      </span>
                    </div>
                  ))}
                  <div className="pt-1">
                    <Button type="button" onClick={publishMp4Batch}>
                      Adicionar {mp4Drafts.length} vídeo(s) ao curso
                    </Button>
                  </div>
                </div>
              )}
            </Field>
            {mp4Drafts.length === 0 && (
              <Field label="Ou URL direta do vídeo">
                <input
                  className={inputClass}
                  value={videoInput}
                  onChange={(e) => setVideoInput(e.target.value)}
                  placeholder="https://exemplo.com/aula.mp4"
                  disabled={!!uploadedFile}
                />
              </Field>
            )}
            {previewUrl && mp4Drafts.length === 0 && (
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

        {!(videoSourceMode === "mp4" && mp4Drafts.length > 0) && (
          <Button type="submit">Publicar aula</Button>
        )}
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
