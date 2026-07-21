"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { lmsApi } from "../api-client";
import { isJavaApiEnabled } from "../api-config";
import type { CourseLesson } from "../types";
import { invalidateCatalog, invalidateCourses } from "./invalidate";
import { lmsKeys } from "./query-keys";

export function useModules(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? isJavaApiEnabled();
  return useQuery({
    queryKey: lmsKeys.modules(),
    queryFn: () => lmsApi.listModules(),
    enabled,
  });
}

export function useLessons(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? isJavaApiEnabled();
  return useQuery({
    queryKey: lmsKeys.lessons(),
    queryFn: () => lmsApi.listLessons(),
    enabled,
  });
}

export function usePublishLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      body,
    }: {
      courseId: string;
      body: {
        moduleId?: string;
        moduleTitle?: string;
        title: string;
        youtubeVideoId?: string;
        videoUrl?: string;
        durationSec?: number;
      };
    }) => lmsApi.publishLesson(courseId, body),
    onSuccess: async () => {
      await invalidateCatalog(queryClient);
      await invalidateCourses(queryClient);
    },
  });
}

export function useUpdateLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      lessonId,
      body,
    }: {
      lessonId: string;
      body: Partial<
        Pick<CourseLesson, "title" | "moduleId" | "youtubeVideoId" | "videoUrl" | "order">
      >;
    }) => lmsApi.updateLesson(lessonId, body),
    onSuccess: () => invalidateCatalog(queryClient),
  });
}

export function useDeleteLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (lessonId: string) => lmsApi.deleteLesson(lessonId),
    onSuccess: () => invalidateCatalog(queryClient),
  });
}

export function useDeleteAllCourseLessons() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (courseId: string) => lmsApi.deleteAllCourseLessons(courseId),
    onSuccess: () => invalidateCatalog(queryClient),
  });
}
