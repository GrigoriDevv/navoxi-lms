"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { lmsApi } from "../api-client";
import { isJavaApiEnabled } from "../api-config";
import { invalidateMyLearning } from "./invalidate";
import { lmsKeys } from "./query-keys";

export function useMyProgress(
  userId: string | undefined,
  email: string | undefined,
  options?: { enabled?: boolean }
) {
  const baseEnabled = options?.enabled ?? isJavaApiEnabled();
  return useQuery({
    queryKey: lmsKeys.progress(userId ?? ""),
    queryFn: () => lmsApi.listMyProgress(email!),
    enabled: baseEnabled && !!userId && !!email,
  });
}

export function useCompleteLesson(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      lessonId,
      email,
    }: {
      lessonId: string;
      email: string;
    }) => lmsApi.completeLesson(lessonId, email),
    onSuccess: async () => {
      if (userId) {
        await invalidateMyLearning(queryClient, userId);
      }
    },
  });
}
