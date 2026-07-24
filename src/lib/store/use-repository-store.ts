"use client";

import { useCallback, useState } from "react";
import { isJavaApiEnabled } from "../api-config";
import * as seed from "../mock-data";
import {
  useApplyEvaluation,
  useCreateEvaluation,
  useCreateQuestion,
  useEvaluations,
  useQuestions,
  useUpdateEvaluation,
  useUpdateQuestion,
} from "../lms";
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
  refreshNotifications: () => Promise<void>;
}) {
  const { currentUser, log, dispatchNotification, refreshNotifications } = deps;

  const javaApi = isJavaApiEnabled();

  const questionsQuery = useQuestions({ enabled: javaApi });
  const evaluationsQuery = useEvaluations({ enabled: javaApi });
  const createQuestionMutation = useCreateQuestion();
  const updateQuestionMutation = useUpdateQuestion();
  const createEvaluationMutation = useCreateEvaluation();
  const updateEvaluationMutation = useUpdateEvaluation();
  const applyEvaluationMutation = useApplyEvaluation();

  const [mockQuestions, setMockQuestions] = useState<Question[]>(seed.questions);
  const [mockEvaluations, setMockEvaluations] = useState<Evaluation[]>(
    seed.evaluations
  );
  /** MOCK: contents not wired to backend — see AGENTS.md "Data wiring" */
  // MOCK: not wired to backend
  const [contents, setContents] = useState<ContentAsset[]>(seed.contents);

  const questions = javaApi
    ? (questionsQuery.data ?? seed.questions)
    : mockQuestions;
  const evaluations = javaApi
    ? (evaluationsQuery.data ?? seed.evaluations)
    : mockEvaluations;

  const addQuestion: AppState["addQuestion"] = useCallback(
    (q) => {
      const unitId =
        currentUser && !hasPermission(currentUser.role, "view_all_units")
          ? currentUser.unitId
          : q.unitId;
      const payload = { ...q, unitId };

      if (javaApi) {
        void createQuestionMutation
          .mutateAsync(payload)
          .then((created) => {
            log({
              user: currentUser?.email ?? "system",
              action: `Cadastrou questão '${created.id}'`,
              module: "Repositório",
              severity: "info",
            });
          })
          .catch((err) => console.error("[lms-api] createQuestion", err));
        return;
      }

      const id = "q" + Math.random().toString(36).slice(2, 7);
      setMockQuestions((prev) => [
        { ...payload, id, usageCount: 0 },
        ...prev,
      ]);
      log({
        user: currentUser?.email ?? "system",
        action: `Cadastrou questão '${id}'`,
        module: "Repositório",
        severity: "info",
      });
    },
    [createQuestionMutation, currentUser, javaApi, log]
  );

  const updateQuestion: AppState["updateQuestion"] = useCallback(
    (id, data) => {
      if (javaApi) {
        const current = questions.find((q) => q.id === id);
        if (!current) return;
        const merged = { ...current, ...data };
        void updateQuestionMutation
          .mutateAsync({
            id,
            body: {
              text: merged.text,
              type: merged.type,
              category: merged.category,
              unitId: merged.unitId,
            },
          })
          .then(() => {
            log({
              user: currentUser?.email ?? "system",
              action: `Atualizou questão '${id}'`,
              module: "Repositório",
              severity: "info",
            });
          })
          .catch((err) => console.error("[lms-api] updateQuestion", err));
        return;
      }

      setMockQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, ...data } : q))
      );
    },
    [currentUser, javaApi, log, questions, updateQuestionMutation]
  );

  const addEvaluation: AppState["addEvaluation"] = useCallback(
    (e) => {
      const unitId =
        currentUser && !hasPermission(currentUser.role, "view_all_units")
          ? currentUser.unitId
          : e.unitId;
      const payload = { ...e, unitId };

      if (javaApi) {
        void createEvaluationMutation
          .mutateAsync(payload)
          .then((created) => {
            log({
              user: currentUser?.email ?? "system",
              action: `Criou avaliação '${created.name}'`,
              module: "Aprendizagem",
              severity: "info",
            });
          })
          .catch((err) => console.error("[lms-api] createEvaluation", err));
        return;
      }

      const id = "av" + Math.random().toString(36).slice(2, 7);
      setMockEvaluations((prev) => [
        {
          ...payload,
          id,
          questionCount: payload.questionIds.length,
        },
        ...prev,
      ]);
      log({
        user: currentUser?.email ?? "system",
        action: `Criou avaliação '${e.name}'`,
        module: "Aprendizagem",
        severity: "info",
      });
    },
    [createEvaluationMutation, currentUser, javaApi, log]
  );

  const updateEvaluation: AppState["updateEvaluation"] = useCallback(
    (id, data) => {
      if (javaApi) {
        const current = evaluations.find((ev) => ev.id === id);
        if (!current) return;
        const merged = { ...current, ...data };
        void updateEvaluationMutation
          .mutateAsync({
            id,
            body: {
              name: merged.name,
              courseId: merged.courseId,
              turmaId: merged.turmaId,
              unitId: merged.unitId,
              questionIds: merged.questionIds,
              status: merged.status,
              dueDate: merged.dueDate,
            },
          })
          .then(() => {
            log({
              user: currentUser?.email ?? "system",
              action: `Atualizou avaliação '${id}'`,
              module: "Aprendizagem",
              severity: "info",
            });
          })
          .catch((err) => console.error("[lms-api] updateEvaluation", err));
        return;
      }

      setMockEvaluations((prev) =>
        prev.map((ev) => {
          if (ev.id !== id) return ev;
          const next = { ...ev, ...data };
          if (data.questionIds) next.questionCount = data.questionIds.length;
          return next;
        })
      );
    },
    [currentUser, evaluations, javaApi, log, updateEvaluationMutation]
  );

  const applyEvaluation: AppState["applyEvaluation"] = useCallback(
    (id) => {
      if (javaApi) {
        void applyEvaluationMutation
          .mutateAsync(id)
          .then(async (applied) => {
            await refreshNotifications();
            log({
              user: currentUser?.email ?? "system",
              action: `Aplicou avaliação '${applied.id}'`,
              module: "Aprendizagem",
              severity: "info",
            });
          })
          .catch((err) => console.error("[lms-api] applyEvaluation", err));
        return;
      }

      let appliedName = "";
      setMockEvaluations((prev) =>
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
    [
      applyEvaluationMutation,
      currentUser,
      dispatchNotification,
      javaApi,
      log,
      refreshNotifications,
    ]
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
