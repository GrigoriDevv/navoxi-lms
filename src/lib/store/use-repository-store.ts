"use client";

import { useCallback, useState } from "react";
import * as seed from "../mock-data";
import type { ContentAsset, Evaluation, Question } from "../types";
import { hasPermission } from "../rbac";
import type { AppState, AuthState } from "./types";
import { now } from "./shared";

type LogFn = AppState["log"];
type DispatchNotification = AppState["dispatchNotification"];

export function useRepositoryStore(deps: {
  currentUser: AuthState | null;
  log: LogFn;
  dispatchNotification: DispatchNotification;
}) {
  const { currentUser, log, dispatchNotification } = deps;

  /** MOCK slices below: seed-only, session memory — see AGENTS.md "Data wiring" */
  // MOCK: not wired to backend
  const [questions, setQuestions] = useState<Question[]>(seed.questions);
  // MOCK: not wired to backend
  const [evaluations, setEvaluations] = useState<Evaluation[]>(seed.evaluations);
  // MOCK: not wired to backend
  const [contents, setContents] = useState<ContentAsset[]>(seed.contents);

  const addQuestion: AppState["addQuestion"] = useCallback(
    (q) => {
      const id = "q" + Math.random().toString(36).slice(2, 7);
      const unitId =
        currentUser && !hasPermission(currentUser.role, "view_all_units")
          ? currentUser.unitId
          : q.unitId;
      setQuestions((prev) => [{ ...q, id, unitId, usageCount: 0 }, ...prev]);
      log({
        user: currentUser?.email ?? "system",
        action: `Cadastrou questão '${id}'`,
        module: "Repositório",
        severity: "info",
      });
    },
    [currentUser, log]
  );

  const updateQuestion: AppState["updateQuestion"] = useCallback((id, data) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...data } : q))
    );
  }, []);

  const addEvaluation: AppState["addEvaluation"] = useCallback(
    (e) => {
      const id = "av" + Math.random().toString(36).slice(2, 7);
      const unitId =
        currentUser && !hasPermission(currentUser.role, "view_all_units")
          ? currentUser.unitId
          : e.unitId;
      setEvaluations((prev) => [
        { ...e, id, unitId, questionCount: e.questionIds.length },
        ...prev,
      ]);
      log({
        user: currentUser?.email ?? "system",
        action: `Criou avaliação '${e.name}'`,
        module: "Aprendizagem",
        severity: "info",
      });
    },
    [currentUser, log]
  );

  const updateEvaluation: AppState["updateEvaluation"] = useCallback(
    (id, data) => {
      setEvaluations((prev) =>
        prev.map((ev) => {
          if (ev.id !== id) return ev;
          const next = { ...ev, ...data };
          if (data.questionIds) next.questionCount = data.questionIds.length;
          return next;
        })
      );
    },
    []
  );

  const applyEvaluation: AppState["applyEvaluation"] = useCallback(
    (id) => {
      let appliedName = "";
      setEvaluations((prev) =>
        prev.map((ev) => {
          if (ev.id === id) {
            appliedName = ev.name;
            return { ...ev, status: "aplicada", appliedAt: now() };
          }
          return ev;
        })
      );
      if (appliedName && currentUser) {
        dispatchNotification({
          userId: currentUser.id,
          title: `Avaliação aplicada: ${appliedName}`,
          message: "A avaliação foi disponibilizada para a turma vinculada.",
          type: "curso",
          href: "/aprendizagem/avaliacoes",
        });
      }
      log({
        user: currentUser?.email ?? "system",
        action: `Aplicou avaliação '${id}'`,
        module: "Aprendizagem",
        severity: "info",
      });
    },
    [currentUser, dispatchNotification, log]
  );

  const addContent: AppState["addContent"] = useCallback(
    (c) => {
      const id = "a" + Math.random().toString(36).slice(2, 7);
      const unitId =
        currentUser && !hasPermission(currentUser.role, "view_all_units")
          ? currentUser.unitId
          : c.unitId;
      setContents((prev) => [
        {
          ...c,
          id,
          unitId,
          uploadedBy: currentUser?.name ?? "Usuário",
          uploadedAt: now().split(" ")[0],
          downloads: 0,
        },
        ...prev,
      ]);
      log({
        user: currentUser?.email ?? "system",
        action: `Enviou conteúdo '${c.name}'`,
        module: "Repositório",
        severity: "info",
      });
    },
    [currentUser, log]
  );

  const updateContent: AppState["updateContent"] = useCallback((id, data) => {
    setContents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data } : c))
    );
  }, []);

  return {
    questions,
    evaluations,
    contents,
    addQuestion,
    updateQuestion,
    addEvaluation,
    updateEvaluation,
    applyEvaluation,
    addContent,
    updateContent,
  };
}
