import type { QueryClient } from "@tanstack/react-query";
import { lmsKeys } from "./query-keys";

export function invalidateCourses(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: lmsKeys.courses() });
}

export function invalidateCatalog(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: lmsKeys.modules() }),
    queryClient.invalidateQueries({ queryKey: lmsKeys.lessons() }),
  ]);
}

export function invalidateEnrollmentRequests(queryClient: QueryClient) {
  return queryClient.invalidateQueries({
    queryKey: lmsKeys.enrollmentRequests(),
  });
}

export function invalidateMyLearning(
  queryClient: QueryClient,
  userId: string
) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: lmsKeys.enrollments(userId) }),
    queryClient.invalidateQueries({ queryKey: lmsKeys.progress(userId) }),
    invalidateEnrollmentRequests(queryClient),
    invalidateCourses(queryClient),
  ]);
}

export function invalidateQuestions(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: lmsKeys.questions() });
}

export function invalidateEvaluations(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: lmsKeys.evaluations() });
}

export function invalidatePosts(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: lmsKeys.posts() });
}

export function invalidateDestaques(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: lmsKeys.destaques() });
}
