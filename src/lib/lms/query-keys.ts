export const lmsKeys = {
  all: ["lms"] as const,
  courses: () => [...lmsKeys.all, "courses"] as const,
  modules: () => [...lmsKeys.all, "modules"] as const,
  lessons: () => [...lmsKeys.all, "lessons"] as const,
  enrollments: (userId: string) =>
    [...lmsKeys.all, "enrollments", userId] as const,
  progress: (userId: string) => [...lmsKeys.all, "progress", userId] as const,
  enrollmentRequests: () =>
    [...lmsKeys.all, "enrollment-requests"] as const,
};
