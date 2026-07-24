"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { lmsApi } from "../api-client";
import { isJavaApiEnabled } from "../api-config";
import type { Destaque } from "../types";
import { invalidateDestaques } from "./invalidate";
import { lmsKeys } from "./query-keys";

export function useDestaques(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? isJavaApiEnabled();
  return useQuery({
    queryKey: lmsKeys.destaques(),
    queryFn: () => lmsApi.listDestaques(),
    enabled,
  });
}

export function useCreateDestaque() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      body: Omit<Destaque, "id" | "publishedAt"> & { publishedAt?: string }
    ) => lmsApi.createDestaque(body),
    onSuccess: () => invalidateDestaques(queryClient),
  });
}

export function useUpdateDestaque() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Partial<Omit<Destaque, "id">>;
    }) => lmsApi.updateDestaque(id, body),
    onSuccess: () => invalidateDestaques(queryClient),
  });
}
