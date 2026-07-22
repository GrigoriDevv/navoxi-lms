"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import type { AppState } from "./store/types";
import { useAuthStore } from "./store/use-auth-store";
import { useNotificationsStore } from "./store/use-notifications-store";
import { useLearningStore } from "./store/use-learning-store";
import { useAdminStore } from "./store/use-admin-store";
import { useCommunicationStore } from "./store/use-communication-store";
import { useRepositoryStore } from "./store/use-repository-store";

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  // Auth first — users list is owned by admin but unused by login path.
  const auth = useAuthStore([]);
  const {
    currentUser,
    preferences,
    login,
    logout,
    updatePreferences,
  } = auth;

  const admin = useAdminStore(currentUser);
  const {
    users,
    integrations,
    permissions,
    scheduledJobs,
    auditLogs,
    settings,
    log,
    addUser,
    toggleUserStatus,
    updateIntegration,
    togglePermissionRole,
    toggleScheduledJob,
    updateSettings,
  } = admin;

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

  const communication = useCommunicationStore({ currentUser, log });
  const {
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
  } = communication;

  const repository = useRepositoryStore({
    currentUser,
    log,
    dispatchNotification,
  });
  const {
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
  } = repository;

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

export type { AppState } from "./store/types";
