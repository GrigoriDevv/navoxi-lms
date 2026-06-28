import type { CourseLesson, InscricaoCurso, LessonProgress } from "./types";

export function getCourseLessons(
  courseId: string,
  lessons: CourseLesson[]
): CourseLesson[] {
  return lessons
    .filter((l) => l.courseId === courseId)
    .sort((a, b) => a.order - b.order);
}

export function getCompletedLessonIds(
  userId: string,
  courseId: string,
  lessons: CourseLesson[],
  progress: LessonProgress[]
): Set<string> {
  const lessonIds = new Set(
    getCourseLessons(courseId, lessons).map((l) => l.id)
  );
  return new Set(
    progress
      .filter((p) => p.userId === userId && lessonIds.has(p.lessonId))
      .map((p) => p.lessonId)
  );
}

export function computeProgress(
  userId: string,
  courseId: string,
  lessons: CourseLesson[],
  progress: LessonProgress[]
): { completed: number; total: number; percent: number } {
  const courseLessons = getCourseLessons(courseId, lessons);
  const total = courseLessons.length;
  if (total === 0) return { completed: 0, total: 0, percent: 0 };

  const completedIds = getCompletedLessonIds(userId, courseId, lessons, progress);
  const completed = courseLessons.filter((l) => completedIds.has(l.id)).length;
  const percent = Math.round((completed / total) * 100);

  return { completed, total, percent };
}

export function syncInscricaoProgress(
  inscricoes: InscricaoCurso[],
  userId: string,
  courseId: string,
  percent: number
): InscricaoCurso[] {
  return inscricoes.map((i) => {
    if (i.userId !== userId || i.courseId !== courseId || i.status === "cancelada") {
      return i;
    }
    const status =
      percent >= 100 ? "concluida" : i.status === "concluida" ? "concluida" : "ativa";
    return { ...i, progress: percent, status };
  });
}

export function getNextLessonId(
  lessons: CourseLesson[],
  completedIds: Set<string>,
  currentId?: string
): string | null {
  const ordered = [...lessons].sort((a, b) => a.order - b.order);
  if (!currentId) {
    return ordered.find((l) => !completedIds.has(l.id))?.id ?? ordered[0]?.id ?? null;
  }
  const idx = ordered.findIndex((l) => l.id === currentId);
  for (let i = idx + 1; i < ordered.length; i++) {
    if (!completedIds.has(ordered[i].id)) return ordered[i].id;
  }
  for (let i = 0; i < idx; i++) {
    if (!completedIds.has(ordered[i].id)) return ordered[i].id;
  }
  return null;
}

export function getPrevLessonId(
  lessons: CourseLesson[],
  currentId: string
): string | null {
  const ordered = [...lessons].sort((a, b) => a.order - b.order);
  const idx = ordered.findIndex((l) => l.id === currentId);
  if (idx <= 0) return null;
  return ordered[idx - 1].id;
}
