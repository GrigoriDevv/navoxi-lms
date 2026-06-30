"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAuthScope } from "@/lib/use-auth-scope";
import { getInstructorCourses } from "@/lib/instructor-courses";
import { formatLessonMediaLabel } from "@/lib/lesson-media";
import { LessonPublishForm } from "@/components/courses/LessonPublishForm";
import { PageHeader, Card } from "@/components/ui";
import { Icon } from "@/components/Icon";

export default function PublicarAulasPage() {
  const {
    courses,
    courseModules,
    courseLessons,
    currentUser,
    can,
  } = useAuthScope();
  const [refreshKey, setRefreshKey] = useState(0);

  const instructorCourses = useMemo(
    () =>
      currentUser
        ? getInstructorCourses(courses, currentUser.name)
        : [],
    [courses, currentUser]
  );

  const instructorCourseIds = useMemo(
    () => new Set(instructorCourses.map((c) => c.id)),
    [instructorCourses]
  );

  const publishedLessons = useMemo(() => {
    return courseLessons
      .filter((l) => instructorCourseIds.has(l.courseId))
      .map((lesson) => {
        const course = courses.find((c) => c.id === lesson.courseId);
        const mod = courseModules.find((m) => m.id === lesson.moduleId);
        return {
          ...lesson,
          courseTitle: course?.title ?? "—",
          moduleTitle: mod?.title ?? "—",
        };
      })
      .sort((a, b) => {
        const courseCmp = a.courseTitle.localeCompare(b.courseTitle);
        if (courseCmp !== 0) return courseCmp;
        return a.order - b.order;
      });
  }, [courseLessons, instructorCourseIds, courses, courseModules, refreshKey]);

  if (!can("publish_lessons")) {
    return (
      <Card className="p-12 text-center text-slate-500">
        Acesso restrito a instrutores.
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Publicar aulas em vídeo"
        subtitle="Publique vídeos-aula nos seus cursos para os alunos matriculados"
      />

      <LessonPublishForm
        courses={courses}
        instructorName={currentUser?.name}
        restrictToInstructor
        onPublished={() => setRefreshKey((k) => k + 1)}
      />

      <section>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">
          Aulas publicadas nos seus cursos ({publishedLessons.length})
        </h2>
        {publishedLessons.length === 0 ? (
          <Card className="p-8 text-center text-slate-400 text-sm">
            Nenhuma aula publicada ainda.
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-xs text-slate-500 uppercase tracking-wide">
                    <th className="px-4 py-3 font-medium">Aula</th>
                    <th className="px-4 py-3 font-medium">Curso</th>
                    <th className="px-4 py-3 font-medium">Módulo</th>
                    <th className="px-4 py-3 font-medium">Formato</th>
                    <th className="px-4 py-3 font-medium">Ordem</th>
                    <th className="px-4 py-3 font-medium" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {publishedLessons.map((lesson) => (
                    <tr key={lesson.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {lesson.title}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{lesson.courseTitle}</td>
                      <td className="px-4 py-3 text-slate-500">{lesson.moduleTitle}</td>
                      <td className="px-4 py-3 text-slate-500">{formatLessonMediaLabel(lesson)}</td>
                      <td className="px-4 py-3 text-slate-500">{lesson.order}</td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/aprendizagem/cursos/${lesson.courseId}?aula=${lesson.id}`}
                          className="text-brand text-xs font-medium hover:underline inline-flex items-center gap-1"
                        >
                          <Icon name="video" className="w-3.5 h-3.5" />
                          Preview
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </section>
    </div>
  );
}
