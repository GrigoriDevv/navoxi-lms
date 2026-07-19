"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import * as seed from "./mock-data";
import type {
  AlertRule,
  AuditLog,
  Automation,
  ContentAsset,
  Destaque,
  Evaluation,
  Integration,
  InternalMail,
  Message,
  Permission,
  Post,
  Question,
  Role,
  ScheduledJob,
  Settings,
  User,
} from "./types";
import { hasPermission } from "./rbac";
import { applyBrandColor } from "./platform-config";
import type { AppState } from "./store/types";
import { avatarColors, now } from "./store/shared";
import { useAuthStore } from "./store/use-auth-store";
import { useNotificationsStore } from "./store/use-notifications-store";
import { useLearningStore } from "./store/use-learning-store";

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(seed.users);
  const [posts, setPosts] = useState<Post[]>(seed.posts);
  const [messages, setMessages] = useState<Message[]>(seed.messages);
  const [questions, setQuestions] = useState<Question[]>(seed.questions);
  const [evaluations, setEvaluations] = useState<Evaluation[]>(seed.evaluations);
  const [contents, setContents] = useState<ContentAsset[]>(seed.contents);
  const [destaques, setDestaques] = useState<Destaque[]>(seed.destaques);
  const [alertRules, setAlertRules] = useState<AlertRule[]>(seed.alertRules);
  const [internalMails, setInternalMails] = useState<InternalMail[]>(
    seed.internalMails
  );
  const [automations, setAutomations] = useState<Automation[]>(seed.automations);
  const [integrations, setIntegrations] = useState<Integration[]>(
    seed.integrations
  );
  const [permissions, setPermissions] = useState<Permission[]>(seed.permissions);
  const [scheduledJobs, setScheduledJobs] = useState<ScheduledJob[]>(
    seed.scheduledJobs
  );
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(seed.auditLogs);
  const [settings, setSettings] = useState<Settings>(seed.settings);

  const log: AppState["log"] = useCallback((entry) => {
    setAuditLogs((prev) => [
      {
        ...entry,
        id: "l" + Math.random().toString(36).slice(2, 8),
        timestamp: now(),
        ip: "10.2.31.5",
      },
      ...prev,
    ]);
  }, []);

  const auth = useAuthStore(users);
  const {
    currentUser,
    preferences,
    login,
    logout,
    updatePreferences,
  } = auth;

  const notificationsStore = useNotificationsStore(currentUser, log);
  const {
    myNotifications,
    unreadCount,
    dispatchNotification,
    markNotificationRead,
    markAllNotificationsRead,
    refreshNotifications,
  } = notificationsStore;

  const learning = useLearningStore({
    currentUser,
    approvalRequired: settings.approvalRequired,
    log,
    dispatchNotification,
    refreshNotifications,
  });

  useEffect(() => {
    applyBrandColor(settings.brandColor);
  }, [settings.brandColor]);

  const addUser: AppState["addUser"] = useCallback(
    (u) => {
      const id = "u" + Math.random().toString(36).slice(2, 7);
      const scopedUnit =
        currentUser &&
        hasPermission(currentUser.role, "manage_users_unit") &&
        !hasPermission(currentUser.role, "manage_users_all")
          ? currentUser.unitId
          : u.unitId;
      setUsers((prev) => [
        {
          ...u,
          unitId: scopedUnit,
          id,
          avatarColor: avatarColors[prev.length % avatarColors.length],
          lastAccess: "—",
        },
        ...prev,
      ]);
      log({
        user: currentUser?.email ?? "system",
        action: `Criou usuário '${u.name}'`,
        module: "Administração",
        severity: "alerta",
      });
    },
    [currentUser, log]
  );

  const toggleUserStatus: AppState["toggleUserStatus"] = useCallback((id) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === "ativo" ? "bloqueado" : "ativo" }
          : u
      )
    );
  }, []);

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

  const updateIntegration: AppState["updateIntegration"] = useCallback(
    (id, data) => {
      setIntegrations((prev) =>
        prev.map((i) => (i.id === id ? { ...i, ...data } : i))
      );
      log({
        user: currentUser?.email ?? "system",
        action: `Atualizou integração '${id}'`,
        module: "Integrações",
        severity: "info",
      });
    },
    [currentUser, log]
  );

  const togglePermissionRole: AppState["togglePermissionRole"] = useCallback(
    (permId, role: Role) => {
      setPermissions((prev) =>
        prev.map((p) => {
          if (p.id !== permId) return p;
          const roles = p.roles.includes(role)
            ? p.roles.filter((r) => r !== role)
            : [...p.roles, role];
          return { ...p, roles };
        })
      );
      log({
        user: currentUser?.email ?? "system",
        action: `Alterou permissão '${permId}' · ${role}`,
        module: "Identidade",
        severity: "alerta",
      });
    },
    [currentUser, log]
  );

  const toggleScheduledJob: AppState["toggleScheduledJob"] = useCallback(
    (id) => {
      setScheduledJobs((prev) =>
        prev.map((j) => (j.id === id ? { ...j, enabled: !j.enabled } : j))
      );
      log({
        user: currentUser?.email ?? "system",
        action: `Alternou job agendado '${id}'`,
        module: "Configurações",
        severity: "info",
      });
    },
    [currentUser, log]
  );

  const updateSettings: AppState["updateSettings"] = useCallback(
    (s) => {
      setSettings((prev) => {
        const next = { ...prev, ...s };
        if (s.brandColor) applyBrandColor(s.brandColor);
        return next;
      });
      log({
        user: currentUser?.email ?? "system",
        action: "Atualizou parâmetros da plataforma",
        module: "Configurações",
        severity: "alerta",
      });
    },
    [currentUser, log]
  );

  const value = useMemo<AppState>(
    () => ({
      currentUser,
      login,
      logout,
      users,
      courses: learning.courses,
      turmas: learning.turmas,
      trilhas: learning.trilhas,
      salas: learning.salas,
      certificados: learning.certificados,
      interesses: learning.interesses,
      solicitacoes: learning.solicitacoes,
      inscricoes: learning.inscricoes,
      courseModules: learning.courseModules,
      courseLessons: learning.courseLessons,
      lessonProgress: learning.lessonProgress,
      posts,
      messages,
      questions,
      evaluations,
      contents,
      destaques,
      alertRules,
      internalMails,
      automations,
      integrations,
      permissions,
      scheduledJobs,
      auditLogs,
      settings,
      notifications: myNotifications,
      unreadCount,
      preferences,
      addUser,
      toggleUserStatus,
      addCourse: learning.addCourse,
      updateCourse: learning.updateCourse,
      addTurma: learning.addTurma,
      updateTurma: learning.updateTurma,
      addTrilha: learning.addTrilha,
      updateTrilha: learning.updateTrilha,
      addSala: learning.addSala,
      updateSolicitacao: learning.updateSolicitacao,
      inscreverCurso: learning.inscreverCurso,
      cancelarInscricao: learning.cancelarInscricao,
      completeLesson: learning.completeLesson,
      importPlaylistLessons: learning.importPlaylistLessons,
      publishCourseLesson: learning.publishCourseLesson,
      updateCourseLesson: learning.updateCourseLesson,
      deleteCourseLesson: learning.deleteCourseLesson,
      deleteAllCourseLessons: learning.deleteAllCourseLessons,
      addInteresse: learning.addInteresse,
      updateCertificado: learning.updateCertificado,
      addPost,
      updatePost,
      addQuestion,
      updateQuestion,
      addEvaluation,
      updateEvaluation,
      applyEvaluation,
      addContent,
      updateContent,
      addDestaque,
      updateDestaque,
      addAlertRule,
      toggleAlertRule,
      sendInternalMail,
      markMailRead,
      addMessage,
      dispatchNotification,
      toggleAutomation,
      updateIntegration,
      togglePermissionRole,
      toggleScheduledJob,
      updateSettings,
      updatePreferences,
      markNotificationRead,
      markAllNotificationsRead,
      log,
    }),
    [
      currentUser,
      login,
      logout,
      users,
      learning.courses,
      learning.turmas,
      learning.trilhas,
      learning.salas,
      learning.certificados,
      learning.interesses,
      learning.solicitacoes,
      learning.inscricoes,
      learning.courseModules,
      learning.courseLessons,
      learning.lessonProgress,
      learning.addCourse,
      learning.updateCourse,
      learning.addTurma,
      learning.updateTurma,
      learning.addTrilha,
      learning.updateTrilha,
      learning.addSala,
      learning.updateSolicitacao,
      learning.inscreverCurso,
      learning.cancelarInscricao,
      learning.completeLesson,
      learning.importPlaylistLessons,
      learning.publishCourseLesson,
      learning.updateCourseLesson,
      learning.deleteCourseLesson,
      learning.deleteAllCourseLessons,
      learning.addInteresse,
      learning.updateCertificado,
      posts,
      messages,
      questions,
      evaluations,
      contents,
      destaques,
      alertRules,
      internalMails,
      automations,
      integrations,
      permissions,
      scheduledJobs,
      auditLogs,
      settings,
      myNotifications,
      unreadCount,
      preferences,
      addUser,
      toggleUserStatus,
      addPost,
      updatePost,
      addQuestion,
      updateQuestion,
      addEvaluation,
      updateEvaluation,
      applyEvaluation,
      addContent,
      updateContent,
      addDestaque,
      updateDestaque,
      addAlertRule,
      toggleAlertRule,
      sendInternalMail,
      markMailRead,
      addMessage,
      dispatchNotification,
      toggleAutomation,
      updateIntegration,
      togglePermissionRole,
      toggleScheduledJob,
      updateSettings,
      updatePreferences,
      markNotificationRead,
      markAllNotificationsRead,
      log,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp deve ser usado dentro de AppProvider");
  return ctx;
}
