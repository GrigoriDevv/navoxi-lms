import type { Course } from "./types";

export function getInstructorCourses(
  courses: Course[],
  instructorName: string
): Course[] {
  return courses.filter(
    (c) =>
      c.instructor === instructorName &&
      (c.status === "publicado" || c.status === "rascunho")
  );
}

export function isInstructorCourse(
  course: Course,
  instructorName: string
): boolean {
  return (
    course.instructor === instructorName &&
    (course.status === "publicado" || course.status === "rascunho")
  );
}
