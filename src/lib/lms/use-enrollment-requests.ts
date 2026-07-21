"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { lmsApi } from "../api-client";
import { isJavaApiEnabled } from "../api-config";
import type { SolicitacaoMatricula } from "../types";
import { invalidateMyLearning } from "./invalidate";
import { lmsKeys } from "./query-keys";

export function useEnrollmentRequests(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? isJavaApiEnabled();
  return useQuery({
    queryKey: lmsKeys.enrollmentRequests(),
    queryFn: () => lmsApi.listEnrollmentRequests(),
    enabled,
  });
}

export function useCreateEnrollmentRequest(userId: string | undefined) {
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
    }) => lmsApi.createEnrollmentRequest(courseId, turmaId, turmaName),
    onSuccess: async () => {
      if (userId) {
        await invalidateMyLearning(queryClient, userId);
      }
    },
  });
}

export function useDecideEnrollmentRequest(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: Extract<SolicitacaoMatricula["status"], "aprovada" | "rejeitada">;
    }) => lmsApi.decideEnrollmentRequest(id, status),
    onSuccess: async () => {
      if (userId) {
        await invalidateMyLearning(queryClient, userId);
      }
    },
  });
}
