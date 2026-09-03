"use client";

import { useCallback, useMemo, useState } from "react";
import { isJavaApiEnabled } from "../api-config";
import * as seed from "../mock-data";
import {
  useCreateDestaque,
  useCreatePost,
  useDestaques,
  usePosts,
  useUpdateDestaque,
  useUpdatePost,
} from "../lms";
import type {
  AlertRule,
  Automation,
  Destaque,
  InternalMail,
  Message,
  Post,
} from "../types";
import { hasPermission } from "../rbac";
import type { AppState, AuthState } from "./types";
import { now } from "./shared";

type LogFn = AppState["log"];

export function useCommunicationStore(deps: {
  currentUser: AuthState | null;
  log: LogFn;
}) {
  const { currentUser, log } = deps;

  const javaApi = isJavaApiEnabled();
  const apiQueriesEnabled = javaApi && currentUser !== null;

  const postsQuery = usePosts({ enabled: apiQueriesEnabled });
  const destaquesQuery = useDestaques({ enabled: apiQueriesEnabled });
  const createPostMutation = useCreatePost();
  const updatePostMutation = useUpdatePost();
  const createDestaqueMutation = useCreateDestaque();
  const updateDestaqueMutation = useUpdateDestaque();

  const [mockPosts, setMockPosts] = useState<Post[]>(seed.posts);
  const [messages, setMessages] = useState<Message[]>(seed.messages);
  const [mockDestaques, setMockDestaques] = useState<Destaque[]>(seed.destaques);
  /** MOCK slices below: seed-only, session memory — see AGENTS.md "Data wiring" */
  // MOCK: not wired to backend
  const [alertRules, setAlertRules] = useState<AlertRule[]>(seed.alertRules);
  // MOCK: not wired to backend
  const [internalMails, setInternalMails] = useState<InternalMail[]>(
    seed.internalMails
  );
  // MOCK: not wired to backend
  const [automations, setAutomations] = useState<Automation[]>(seed.automations);

  const posts = useMemo(
    () => (javaApi ? (postsQuery.data ?? []) : mockPosts),
    [javaApi, mockPosts, postsQuery.data]
  );
  const destaques = javaApi
    ? (destaquesQuery.data ?? seed.destaques)
    : mockDestaques;

  const addPost: AppState["addPost"] = useCallback(
    async (p) => {
      const unitId =
        currentUser && !hasPermission(currentUser.role, "view_all_units")
          ? currentUser.unitId
          : p.unitId;
      const payload = { ...p, unitId };

      if (javaApi) {
        const created = await createPostMutation.mutateAsync(payload);
        log({
          user: currentUser?.email ?? "system",
          action: `Publicou post '${created.title}'`,
          module: "Comunicação",
          severity: "info",
        });
        return;
      }

      const id = "post" + Math.random().toString(36).slice(2, 7);
      setMockPosts((prev) => [
        {
          ...payload,
          id,
          author: currentUser?.name ?? "Usuário",
          status: "publicado",
          publishedAt: now(),
        },
        ...prev,
      ]);
      log({
        user: currentUser?.email ?? "system",
        action: `Publicou post '${p.title}'`,
        module: "Comunicação",
        severity: "info",
      });
    },
    [createPostMutation, currentUser, javaApi, log]
  );

  const updatePost: AppState["updatePost"] = useCallback(
    async (id, data) => {
      if (javaApi) {
        const current = posts.find((p) => p.id === id);
        if (!current) return;
        const merged = { ...current, ...data };
        await updatePostMutation.mutateAsync({
          id,
          body: {
            title: merged.title,
            body: merged.body,
            author: merged.author,
            unitId: merged.unitId,
            status: merged.status,
            publishedAt: merged.publishedAt,
          },
        });
        log({
          user: currentUser?.email ?? "system",
          action: `Atualizou post '${id}'`,
          module: "Comunicação",
          severity: "info",
        });
        return;
      }

      setMockPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
      log({
        user: currentUser?.email ?? "system",
        action: `Atualizou post '${id}'`,
        module: "Comunicação",
        severity: "info",
      });
    },
    [currentUser, javaApi, log, posts, updatePostMutation]
  );

  const addDestaque: AppState["addDestaque"] = useCallback(
    (d) => {
      const unitId =
        currentUser && !hasPermission(currentUser.role, "view_all_units")
          ? currentUser.unitId
          : d.unitId;
      const payload = { ...d, unitId };

      if (javaApi) {
        void createDestaqueMutation
          .mutateAsync(payload)
          .then((created) => {
            log({
              user: currentUser?.email ?? "system",
              action: `Publicou destaque '${created.title}'`,
              module: "Comunicação",
              severity: "info",
            });
          })
          .catch((err) => console.error("[lms-api] createDestaque", err));
        return;
      }

      const id = "d" + Math.random().toString(36).slice(2, 7);
      setMockDestaques((prev) => [
        { ...payload, id, publishedAt: now() },
        ...prev,
      ]);
      log({
        user: currentUser?.email ?? "system",
        action: `Publicou destaque '${d.title}'`,
        module: "Comunicação",
        severity: "info",
      });
    },
    [createDestaqueMutation, currentUser, javaApi, log]
  );

  const updateDestaque: AppState["updateDestaque"] = useCallback(
    (id, data) => {
      if (javaApi) {
        const current = destaques.find((d) => d.id === id);
        if (!current) return;
        const merged = { ...current, ...data };
        void updateDestaqueMutation
          .mutateAsync({
            id,
            body: {
              title: merged.title,
              body: merged.body,
              unitId: merged.unitId,
              visible: merged.visible,
              pinned: merged.pinned,
              publishedAt: merged.publishedAt,
              expiresAt: merged.expiresAt,
            },
          })
          .then(() => {
            log({
              user: currentUser?.email ?? "system",
              action: `Atualizou destaque '${id}'`,
              module: "Comunicação",
              severity: "info",
            });
          })
          .catch((err) => console.error("[lms-api] updateDestaque", err));
        return;
      }

      setMockDestaques((prev) =>
        prev.map((d) => (d.id === id ? { ...d, ...data } : d))
      );
    },
    [currentUser, destaques, javaApi, log, updateDestaqueMutation]
  );

  const addAlertRule: AppState["addAlertRule"] = useCallback(
    (r) => {
      const id = "ar" + Math.random().toString(36).slice(2, 7);
      const unitId =
        currentUser && !hasPermission(currentUser.role, "view_all_units")
          ? currentUser.unitId
          : r.unitId;
      setAlertRules((prev) => [{ ...r, id, unitId }, ...prev]);
      log({
        user: currentUser?.email ?? "system",
        action: `Criou alerta '${r.name}'`,
        module: "Comunicação",
        severity: "info",
      });
    },
    [currentUser, log]
  );

  const toggleAlertRule: AppState["toggleAlertRule"] = useCallback((id) => {
    setAlertRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  }, []);

  const sendInternalMail: AppState["sendInternalMail"] = useCallback(
    (m) => {
      const id = "im" + Math.random().toString(36).slice(2, 7);
      setInternalMails((prev) => [
        {
          ...m,
          id,
          fromUserId: currentUser?.id ?? "system",
          fromName: currentUser?.name ?? "Sistema",
          read: false,
          sentAt: now(),
        },
        ...prev,
      ]);
      log({
        user: currentUser?.email ?? "system",
        action: `Enviou mensagem interna para '${m.toName}'`,
        module: "Comunicação",
        severity: "info",
      });
    },
    [currentUser, log]
  );

  const markMailRead: AppState["markMailRead"] = useCallback((id) => {
    setInternalMails((prev) =>
      prev.map((m) => (m.id === id ? { ...m, read: true } : m))
    );
  }, []);

  const addMessage: AppState["addMessage"] = useCallback(
    (m) => {
      const id = "m" + Math.random().toString(36).slice(2, 7);
      setMessages((prev) => [{ ...m, id }, ...prev]);
      log({
        user: currentUser?.email ?? "system",
        action: `Criou campanha '${m.title}'`,
        module: "Comunicação",
        severity: "info",
      });
    },
    [currentUser, log]
  );

  const toggleAutomation: AppState["toggleAutomation"] = useCallback((id) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  }, []);

  return {
    posts,
    messages,
    destaques,
    alertRules,
    internalMails,
    automations,
    addPost,
    updatePost,
    addDestaque,
    updateDestaque,
    addAlertRule,
    toggleAlertRule,
    sendInternalMail,
    markMailRead,
    addMessage,
    toggleAutomation,
  };
}
