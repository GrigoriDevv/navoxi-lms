"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { lmsApi } from "../api-client";
import { isJavaApiEnabled } from "../api-config";
import type { ScheduledJob } from "../types";
import { invalidateScheduledJobs } from "./invalidate";
import { lmsKeys } from "./query-keys";

export function useScheduledJobs(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? isJavaApiEnabled();
  return useQuery({
    queryKey: lmsKeys.scheduledJobs(),
    queryFn: () => lmsApi.listScheduledJobs(),
    enabled,
  });
}

export function useUpdateScheduledJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Partial<Omit<ScheduledJob, "id">>;
    }) => lmsApi.updateScheduledJob(id, body),
    onSuccess: () => invalidateScheduledJobs(queryClient),
  });
}
