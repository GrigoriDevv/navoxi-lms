"use client";

import { useCallback, useState } from "react";
import * as seed from "../mock-data";
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

  /** MOCK slices below: seed-only, session memory — see AGENTS.md "Data wiring" */
  // MOCK: not wired to backend
  const [posts, setPosts] = useState<Post[]>(seed.posts);
  const [messages, setMessages] = useState<Message[]>(seed.messages);
  // MOCK: not wired to backend
  const [destaques, setDestaques] = useState<Destaque[]>(seed.destaques);
  // MOCK: not wired to backend
  const [alertRules, setAlertRules] = useState<AlertRule[]>(seed.alertRules);
  // MOCK: not wired to backend
  const [internalMails, setInternalMails] = useState<InternalMail[]>(
    seed.internalMails
  );
  // MOCK: not wired to backend
  const [automations, setAutomations] = useState<Automation[]>(seed.automations);

  const addPost: AppState["addPost"] = useCallback(
    (p) => {
      const id = "post" + Math.random().toString(36).slice(2, 7);
      const unitId =
        currentUser && !hasPermission(currentUser.role, "view_all_units")
          ? currentUser.unitId
          : p.unitId;
      setPosts((prev) => [
        {
          ...p,
          id,
          unitId,
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
    [currentUser, log]
  );

  const updatePost: AppState["updatePost"] = useCallback(
    (id, data) => {
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
      log({
        user: currentUser?.email ?? "system",
        action: `Atualizou post '${id}'`,
        module: "Comunicação",
        severity: "info",
      });
    },
    [currentUser, log]
  );

  const addDestaque: AppState["addDestaque"] = useCallback(
    (d) => {
      const id = "d" + Math.random().toString(36).slice(2, 7);
      const unitId =
        currentUser && !hasPermission(currentUser.role, "view_all_units")
          ? currentUser.unitId
          : d.unitId;
      setDestaques((prev) => [
        { ...d, id, unitId, publishedAt: now() },
        ...prev,
      ]);
      log({
        user: currentUser?.email ?? "system",
        action: `Publicou destaque '${d.title}'`,
        module: "Comunicação",
        severity: "info",
      });
    },
    [currentUser, log]
  );

  const updateDestaque: AppState["updateDestaque"] = useCallback((id, data) => {
    setDestaques((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...data } : d))
    );
  }, []);

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
