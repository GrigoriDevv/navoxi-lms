"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { lmsApi } from "../api-client";
import { isJavaApiEnabled } from "../api-config";
import type { Question } from "../types";
import { invalidateQuestions } from "./invalidate";
import { lmsKeys } from "./query-keys";

export function useQuestions(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? isJavaApiEnabled();
  return useQuery({
    queryKey: lmsKeys.questions(),
    queryFn: () => lmsApi.listQuestions(),
    enabled,
  });
}

export function useCreateQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Omit<Question, "id" | "usageCount">) =>
      lmsApi.createQuestion(body),
    onSuccess: () => invalidateQuestions(queryClient),
  });
}

export function useUpdateQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Omit<Question, "id" | "usageCount">;
    }) => lmsApi.updateQuestion(id, body),
    onSuccess: () => invalidateQuestions(queryClient),
  });
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => lmsApi.deleteQuestion(id),
    onSuccess: () => invalidateQuestions(queryClient),
  });
}
