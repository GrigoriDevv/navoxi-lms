"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { lmsApi } from "../api-client";
import { isJavaApiEnabled } from "../api-config";
import type { Course } from "../types";
import { invalidateCourses } from "./invalidate";
import { lmsKeys } from "./query-keys";

export function useCourses(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? isJavaApiEnabled();
  return useQuery({
    queryKey: lmsKeys.courses(),
    queryFn: () => lmsApi.listCourses(),
    enabled,
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Omit<Course, "id" | "enrolled" | "completion">) =>
      lmsApi.createCourse(body),
    onSuccess: () => invalidateCourses(queryClient),
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Partial<Course>;
    }) => lmsApi.updateCourse(id, body),
    onSuccess: () => invalidateCourses(queryClient),
  });
}
