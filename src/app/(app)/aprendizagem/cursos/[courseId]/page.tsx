"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/lib/store";
import { useAuthScope } from "@/lib/use-auth-scope";
import {
  computeProgress,
  getCourseLessons,
  getNextLessonId,
  getPrevLessonId,
  getCompletedLessonIds,
} from "@/lib/course-progress";
import { isInstructorCourse } from "@/lib/instructor-courses";
import { PageHeader, Card, Button } from "@/components/ui";
import { CoursePlayerShell } from "@/components/courses/CoursePlayerShell";
import Link from "next/link";

export default function CoursePlayerPage() {
  const params = useParams<{ courseId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const courseId = params.courseId;

  const { completeLesson } = useApp();
  const {
    courses,
    courseModules,
    courseLessons,
    lessonProgress,
    inscricoes,
    currentUser,
    can,
  } = useAuthScope();

  const course = courses.find((c) => c.id === courseId);
  const lessons = useMemo(
    () => getCourseLessons(courseId, courseLessons),
    [courseId, courseLessons]
  );
  const modules = useMemo(
    () =>
      courseModules
        .filter((m) => m.courseId === courseId)
        .sort((a, b) => a.order - b.order),
    [courseId, courseModules]
  );

  const canManage = can("manage_courses");
  const isInstructor =
    !!course && !!currentUser && isInstructorCourse(course, currentUser.name);
  const enrollment = useMemo(
    () =>
      currentUser
        ? inscricoes.find(
            (i) =>
              i.userId === currentUser.id &&
              i.courseId === courseId &&
              i.status === "ativa"
          )
        : undefined,
    [currentUser, inscricoes, courseId]
  );
  const hasAccess = canManage || !!enrollment || (can("publish_lessons") && isInstructor);

  const completedIds = useMemo(
    () =>
      currentUser
        ? getCompletedLessonIds(currentUser.id, courseId, courseLessons, lessonProgress)
        : new Set<string>(),
    [currentUser, courseId, courseLessons, lessonProgress]
  );

  const initialLessonId = useMemo(() => {
    const fromUrl = searchParams.get("aula");
    if (fromUrl && lessons.some((l) => l.id === fromUrl)) return fromUrl;
    return (
      getNextLessonId(lessons, completedIds) ??
      lessons[0]?.id ??
      ""
    );
  }, [searchParams, lessons, completedIds]);

  const [activeLessonId, setActiveLessonId] = useState(initialLessonId);

  useEffect(() => {
    setActiveLessonId(initialLessonId);
  }, [initialLessonId]);

  const selectLesson = useCallback(
    (lessonId: string) => {
      setActiveLessonId(lessonId);
      router.replace(`/aprendizagem/cursos/${courseId}?aula=${lessonId}`, {
        scroll: false,
      });
    },
    [courseId, router]
  );

  const handleComplete = useCallback(
    (lessonId: string) => {
      completeLesson(lessonId);
      const next = getNextLessonId(lessons, new Set([...completedIds, lessonId]), lessonId);
      if (next && next !== lessonId) {
        selectLesson(next);
      }
    },
    [completeLesson, lessons, completedIds, selectLesson]
  );

  const activeIdx = lessons.findIndex((l) => l.id === activeLessonId);
  const prevId = activeLessonId ? getPrevLessonId(lessons, activeLessonId) : null;
  const nextId =
    activeIdx >= 0 && activeIdx < lessons.length - 1
      ? lessons[activeIdx + 1].id
      : null;

  if (!course) {
    return (
      <Card className="p-12 text-center">
        <p className="text-slate-500">Curso não encontrado.</p>
        <Link href="/aprendizagem/catalogo" className="text-brand text-sm mt-2 inline-block">
          Voltar ao catálogo
        </Link>
      </Card>
    );
  }

  if (!hasAccess) {
    return (
      <div>
        <PageHeader title={course.title} subtitle="Acesso restrito a alunos matriculados" />
        <Card className="p-8 text-center space-y-3">
          <p className="text-slate-600">
            Você precisa estar inscrito neste curso para assistir às aulas.
          </p>
          <Link href="/aprendizagem/catalogo">
            <Button>Ir ao catálogo</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div>
        <PageHeader title={course.title} subtitle={course.instructor} />
        <Card className="p-8 text-center text-slate-500">
          Este curso ainda não possui aulas cadastradas.
          {canManage && (
            <p className="mt-2 text-sm">
              <Link href="/aprendizagem/cursos" className="text-brand hover:underline">
                Adicione vídeos na gestão de cursos
              </Link>
              {" "}ou em{" "}
              <Link href="/aprendizagem/publicar-aulas" className="text-brand hover:underline">
                Publicar aulas
              </Link>
            </p>
          )}
          {isInstructor && !canManage && (
            <p className="mt-2 text-sm">
              <Link href="/aprendizagem/publicar-aulas" className="text-brand hover:underline">
                Publique aulas em vídeo
              </Link>
            </p>
          )}
        </Card>
      </div>
    );
  }

  const progressInfo = currentUser
    ? computeProgress(currentUser.id, courseId, lessons, lessonProgress)
    : null;

  return (
    <div>
      <PageHeader
        title="Aprendizagem"
        subtitle={
          progressInfo
            ? `${course.title} · ${progressInfo.completed}/${progressInfo.total} aulas`
            : course.title
        }
      />
      <CoursePlayerShell
        course={course}
        modules={modules}
        lessons={lessons}
        progress={lessonProgress}
        userId={currentUser?.id}
        activeLessonId={activeLessonId}
        onSelectLesson={selectLesson}
        onLessonComplete={handleComplete}
        onPrev={prevId ? () => selectLesson(prevId) : undefined}
        onNext={nextId ? () => selectLesson(nextId) : undefined}
        hasPrev={!!prevId}
        hasNext={!!nextId}
        previewMode={(canManage || isInstructor) && !enrollment}
      />
    </div>
  );
}
