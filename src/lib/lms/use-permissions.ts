"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { lmsApi } from "../api-client";
import { isJavaApiEnabled } from "../api-config";
import type { Permission } from "../types";
import { invalidatePermissions } from "./invalidate";
import { lmsKeys } from "./query-keys";

export function usePermissions(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? isJavaApiEnabled();
  return useQuery({
    queryKey: lmsKeys.permissions(),
    queryFn: () => lmsApi.listPermissions(),
    enabled,
  });
}

export function useUpdatePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Partial<Omit<Permission, "id">>;
    }) => lmsApi.updatePermission(id, body),
    onSuccess: () => invalidatePermissions(queryClient),
  });
}
