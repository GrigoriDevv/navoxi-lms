"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { lmsApi } from "../api-client";
import { isJavaApiEnabled } from "../api-config";
import { invalidateCourses, invalidateMyLearning } from "./invalidate";
import { lmsKeys } from "./query-keys";

export function useMyEnrollments(
  userId: string | undefined,
  email: string | undefined,
  options?: { enabled?: boolean }
) {
  const baseEnabled = options?.enabled ?? isJavaApiEnabled();
  return useQuery({
    queryKey: lmsKeys.enrollments(userId ?? ""),
    queryFn: () => lmsApi.listMyEnrollments(email!),
    enabled: baseEnabled && !!userId && !!email,
  });
}

export function useEnroll(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      turmaId,
      turmaName,
    }: {
      courseId: string;
      turmaId?: string;
      turmaName?: string;
    }) => lmsApi.enroll(courseId, turmaId, turmaName),
    onSuccess: async () => {
      if (userId) {
        await invalidateMyLearning(queryClient, userId);
      } else {
        await invalidateCourses(queryClient);
      }
    },
  });
}
