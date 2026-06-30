"use client";

import { useState } from "react";
import Link from "next/link";
import type { Course, CourseLesson, CourseModule, LessonProgress } from "@/lib/types";
import { computeProgress } from "@/lib/course-progress";
import { ProgressBar } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { LessonVideoPlayer } from "./LessonVideoPlayer";
import {
  CourseLessonSidebar,
  buildCompletedIds,
} from "./CourseLessonSidebar";

interface CoursePlayerShellProps {
  course: Course;
  modules: CourseModule[];
  lessons: CourseLesson[];
  progress: LessonProgress[];
  userId?: string;
  activeLessonId: string;
  onSelectLesson: (lessonId: string) => void;
  onLessonComplete: (lessonId: string) => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  previewMode?: boolean;
}

export function CoursePlayerShell({
  course,
  modules,
  lessons,
  progress,
  userId,
  activeLessonId,
  onSelectLesson,
  onLessonComplete,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  previewMode,
}: CoursePlayerShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const activeLesson = lessons.find((l) => l.id === activeLessonId);
  const courseModules = modules
    .filter((m) => m.courseId === course.id)
    .sort((a, b) => a.order - b.order);
  const courseLessons = lessons
    .filter((l) => l.courseId === course.id)
    .sort((a, b) => a.order - b.order);
  const completedIds = buildCompletedIds(userId, courseLessons, progress);
  const { completed, total, percent } = userId
    ? computeProgress(userId, course.id, courseLessons, progress)
    : { completed: 0, total: courseLessons.length, percent: 0 };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href="/aprendizagem/catalogo?tab=inscricoes"
          className="text-sm text-slate-500 hover:text-brand flex items-center gap-1"
        >
          <Icon name="chevron-left" className="w-4 h-4" />
          Voltar
        </Link>
        {previewMode && (
          <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
            Modo preview
          </span>
        )}
      </div>

      <div>
        <h1 className="text-xl font-bold text-slate-900">{course.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <span className="text-sm text-slate-600">
            {completed} de {total} aulas concluídas
          </span>
          <div className="flex-1 min-w-[120px] max-w-xs">
            <ProgressBar value={percent} />
          </div>
          <span className="text-sm font-medium text-slate-700">{percent}%</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className={`${sidebarOpen ? "fixed inset-0 z-40 lg:relative lg:inset-auto" : "hidden lg:block"}`}>
          {sidebarOpen && (
            <button
              type="button"
              className="absolute inset-0 bg-black/40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-label="Fechar menu"
            />
          )}
          <div className={`${sidebarOpen ? "absolute left-0 top-0 bottom-0 z-50 lg:relative lg:z-auto" : ""}`}>
            <CourseLessonSidebar
              modules={courseModules}
              lessons={courseLessons}
              activeLessonId={activeLessonId}
              completedIds={completedIds}
              onSelectLesson={(id) => {
                onSelectLesson(id);
                setSidebarOpen(false);
              }}
              onToggleCollapse={() => setSidebarOpen(false)}
            />
          </div>
        </div>

        <div className="flex-1 min-w-0 space-y-4">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden flex items-center gap-2 text-sm font-medium text-brand"
          >
            <Icon name="menu" className="w-4 h-4" />
            Ver aulas ({completed}/{total})
          </button>

          {activeLesson ? (
            <>
              <div>
                <p className="text-xs font-medium text-brand uppercase tracking-wide mb-1">
                  Aula {activeLesson.order} de {total}
                </p>
                <h2 className="text-lg font-semibold text-slate-900">
                  {activeLesson.title}
                </h2>
              </div>

              <div className="w-full">
                <LessonVideoPlayer
                  lesson={activeLesson}
                  onComplete={() => onLessonComplete(activeLesson.id)}
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={onPrev}
                  disabled={!hasPrev}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:border-brand hover:text-brand transition"
                >
                  <Icon name="chevron-left" className="w-4 h-4" />
                  Anterior
                </button>
                <button
                  type="button"
                  onClick={onNext}
                  disabled={!hasNext}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium bg-brand text-white disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition"
                >
                  Próxima
                  <Icon name="chevron-right" className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 p-12 text-center text-slate-400">
              Nenhuma aula disponível neste curso.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
