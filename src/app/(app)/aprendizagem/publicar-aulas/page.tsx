"use client";

import { useMemo, useState } from "react";
import { useAuthScope } from "@/lib/use-auth-scope";
import { getInstructorCourses } from "@/lib/instructor-courses";
import { LessonPublishForm } from "@/components/courses/LessonPublishForm";
import { LessonManageList } from "@/components/courses/LessonManageList";
import { PageHeader, Card } from "@/components/ui";

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
        <Card className="p-4">
          <LessonManageList
            lessons={publishedLessons}
            courseModules={courseModules.filter((m) =>
              instructorCourseIds.has(m.courseId)
            )}
            showCourse
            title={`Aulas publicadas nos seus cursos (${publishedLessons.length})`}
            emptyMessage="Nenhuma aula publicada ainda."
            onChanged={() => setRefreshKey((k) => k + 1)}
          />
        </Card>
      </section>
    </div>
  );
}
