"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { lmsApi } from "../api-client";
import { isJavaApiEnabled } from "../api-config";
import type { Evaluation } from "../types";
import { invalidateEvaluations, invalidateQuestions } from "./invalidate";
import { lmsKeys } from "./query-keys";

export function useEvaluations(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? isJavaApiEnabled();
  return useQuery({
    queryKey: lmsKeys.evaluations(),
    queryFn: () => lmsApi.listEvaluations(),
    enabled,
  });
}

export function useCreateEvaluation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Omit<Evaluation, "id" | "questionCount" | "appliedAt">) =>
      lmsApi.createEvaluation(body),
    onSuccess: () => invalidateEvaluations(queryClient),
  });
}

export function useUpdateEvaluation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Omit<Evaluation, "id" | "questionCount" | "appliedAt">;
    }) => lmsApi.updateEvaluation(id, body),
    onSuccess: () => invalidateEvaluations(queryClient),
  });
}

export function useApplyEvaluation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => lmsApi.applyEvaluation(id),
    onSuccess: () =>
      Promise.all([
        invalidateEvaluations(queryClient),
        invalidateQuestions(queryClient),
      ]),
  });
}
