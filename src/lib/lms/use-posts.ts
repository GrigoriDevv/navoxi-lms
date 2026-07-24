"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { lmsApi } from "../api-client";
import { isJavaApiEnabled } from "../api-config";
import type { Post } from "../types";
import { invalidatePosts } from "./invalidate";
import { lmsKeys } from "./query-keys";

export function usePosts(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? isJavaApiEnabled();
  return useQuery({
    queryKey: lmsKeys.posts(),
    queryFn: () => lmsApi.listPosts(),
    enabled,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      body: Omit<Post, "id"> | Omit<Post, "id" | "author" | "status" | "publishedAt">
    ) => lmsApi.createPost(body),
    onSuccess: () => invalidatePosts(queryClient),
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Partial<Omit<Post, "id">>;
    }) => lmsApi.updatePost(id, body),
    onSuccess: () => invalidatePosts(queryClient),
  });
}
