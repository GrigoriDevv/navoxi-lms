"use client";

import type { CourseLesson, CourseModule, LessonProgress } from "@/lib/types";
import { Icon } from "@/components/Icon";

interface CourseLessonSidebarProps {
  modules: CourseModule[];
  lessons: CourseLesson[];
  activeLessonId: string;
  completedIds: Set<string>;
  onSelectLesson: (lessonId: string) => void;
  onToggleCollapse?: () => void;
}

export function CourseLessonSidebar({
  modules,
  lessons,
  activeLessonId,
  completedIds,
  onSelectLesson,
  onToggleCollapse,
}: CourseLessonSidebarProps) {
  const sortedModules = [...modules].sort((a, b) => a.order - b.order);

  return (
    <aside className="flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden w-72 shrink-0 h-full lg:h-auto">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
        <h2 className="text-sm font-semibold text-slate-800">Conteúdo do curso</h2>
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="lg:hidden p-1 text-slate-400 hover:text-slate-600"
            aria-label="Fechar lista de aulas"
          >
            <Icon name="close" className="w-4 h-4" />
          </button>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto p-2 space-y-3 max-h-[calc(100vh-12rem)]">
        {sortedModules.map((mod) => {
          const modLessons = lessons
            .filter((l) => l.moduleId === mod.id)
            .sort((a, b) => a.order - b.order);
          if (modLessons.length === 0) return null;

          return (
            <div key={mod.id}>
              <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {mod.title}
              </p>
              <ul className="space-y-0.5">
                {modLessons.map((lesson, idx) => {
                  const done = completedIds.has(lesson.id);
                  const active = lesson.id === activeLessonId;
                  return (
                    <li key={lesson.id}>
                      <button
                        type="button"
                        onClick={() => onSelectLesson(lesson.id)}
                        className={`w-full flex items-start gap-2 px-2 py-2 rounded-lg text-left text-sm transition ${
                          active
                            ? "bg-brand/10 text-brand font-medium"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                            done
                              ? "bg-green-100 text-green-700"
                              : active
                                ? "bg-brand text-white"
                                : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {done ? (
                            <Icon name="check" className="w-3 h-3" />
                          ) : (
                            idx + 1
                          )}
                        </span>
                        <span className="leading-snug">{lesson.title}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

export function buildCompletedIds(
  userId: string | undefined,
  lessons: CourseLesson[],
  progress: LessonProgress[]
): Set<string> {
  if (!userId) return new Set();
  const lessonIds = new Set(lessons.map((l) => l.id));
  return new Set(
    progress
      .filter((p) => p.userId === userId && lessonIds.has(p.lessonId))
      .map((p) => p.lessonId)
  );
}
