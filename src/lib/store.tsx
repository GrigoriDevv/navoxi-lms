"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import * as seed from "./mock-data";
import type {
  AuditLog,
  Automation,
  Course,
  Message,
  Role,
  Settings,
  Turma,
  UnitId,
  User,
  Notification,
  UserPreferences,
  Post,
  Trilha,
  Sala,
  Certificado,
  InteresseCurso,
  SolicitacaoMatricula,
  InscricaoCurso,
  Question,
  Evaluation,
  ContentAsset,
  Destaque,
  AlertRule,
  InternalMail,
  Integration,
  Permission,
  ScheduledJob,
} from "./types";
import { hasPermission } from "./rbac";
import { applyBrandColor } from "./platform-config";

const VALID_ROLES: Role[] = [
  "admin_premium",
  "admin_unidade",
  "gestor_conteudo",
  "instrutor",
  "aluno",
];

function resolveSession(raw: string, users: User[]): AuthState | null {
  try {
    const parsed = JSON.parse(raw) as Partial<AuthState>;
    if (!parsed.email || !parsed.role || !VALID_ROLES.includes(parsed.role)) {
      return null;
    }
    const registered = users.find((u) => u.email === parsed.email);
    if (registered) {
      return {
        id: registered.id,
        name: registered.name,
        email: registered.email,
        role: registered.role,
        unitId: registered.unitId,
        avatarColor: registered.avatarColor,
      };
    }
    return {
      id: parsed.id ?? "guest",
      name: parsed.name ?? parsed.email.split("@")[0],
      email: parsed.email,
      role: parsed.role,
      unitId: parsed.unitId ?? "holding",
      avatarColor: parsed.avatarColor ?? "#00a14b",
    };
  } catch {
    return null;
  }
}

interface AuthState {
  id: string;
  name: string;
  email: string;
  role: Role;
  unitId: UnitId;
  avatarColor: string;
}

interface AppState {
  // auth
  currentUser: AuthState | null;
  login: (email: string) => void;
  logout: () => void;
  // data
  users: User[];
  courses: Course[];
  turmas: Turma[];
  trilhas: Trilha[];
  salas: Sala[];
  certificados: Certificado[];
  interesses: InteresseCurso[];
  solicitacoes: SolicitacaoMatricula[];
  inscricoes: InscricaoCurso[];
  posts: Post[];
  messages: Message[];
  questions: Question[];
  evaluations: Evaluation[];
  contents: ContentAsset[];
  destaques: Destaque[];
  alertRules: AlertRule[];
  internalMails: InternalMail[];
  automations: Automation[];
  integrations: Integration[];
  permissions: Permission[];
  scheduledJobs: ScheduledJob[];
  auditLogs: AuditLog[];
  settings: Settings;
  notifications: Notification[];
  unreadCount: number;
  preferences: UserPreferences;
  // actions
  addUser: (u: Omit<User, "id" | "avatarColor" | "lastAccess">) => void;
  toggleUserStatus: (id: string) => void;
  addCourse: (c: Omit<Course, "id" | "enrolled" | "completion">) => void;
  updateCourse: (id: string, data: Partial<Course>) => void;
  addTurma: (t: Omit<Turma, "id">) => void;
  updateTurma: (id: string, data: Partial<Turma>) => void;
  addTrilha: (t: Omit<Trilha, "id" | "progress">) => void;
  updateTrilha: (id: string, data: Partial<Trilha>) => void;
  addSala: (s: Omit<Sala, "id">) => void;
  updateSolicitacao: (id: string, status: SolicitacaoMatricula["status"]) => void;
  inscreverCurso: (courseId: string, turmaId?: string) => "ok" | "duplicate" | "pending" | "lotada" | "login";
  cancelarInscricao: (id: string) => void;
  addInteresse: (i: Omit<InteresseCurso, "id" | "registeredAt" | "notified">) => void;
  updateCertificado: (id: string, status: Certificado["status"]) => void;
  addPost: (p: Omit<Post, "id" | "publishedAt" | "author" | "status">) => void;
  updatePost: (id: string, data: Partial<Post>) => void;
  addQuestion: (q: Omit<Question, "id" | "usageCount">) => void;
  updateQuestion: (id: string, data: Partial<Question>) => void;
  addEvaluation: (e: Omit<Evaluation, "id" | "questionCount">) => void;
  updateEvaluation: (id: string, data: Partial<Evaluation>) => void;
  applyEvaluation: (id: string) => void;
  addContent: (c: Omit<ContentAsset, "id" | "downloads" | "uploadedBy" | "uploadedAt">) => void;
  updateContent: (id: string, data: Partial<ContentAsset>) => void;
  addDestaque: (d: Omit<Destaque, "id" | "publishedAt">) => void;
  updateDestaque: (id: string, data: Partial<Destaque>) => void;
  addAlertRule: (r: Omit<AlertRule, "id">) => void;
  toggleAlertRule: (id: string) => void;
  sendInternalMail: (m: Omit<InternalMail, "id" | "sentAt" | "read" | "fromUserId" | "fromName">) => void;
  markMailRead: (id: string) => void;
  addMessage: (m: Omit<Message, "id">) => void;
  dispatchNotification: (n: Omit<Notification, "id" | "read" | "timestamp">) => void;
  toggleAutomation: (id: string) => void;
  updateIntegration: (id: string, data: Partial<Integration>) => void;
  togglePermissionRole: (permId: string, role: Role) => void;
  toggleScheduledJob: (id: string) => void;
  updateSettings: (s: Partial<Settings>) => void;
  updatePreferences: (p: Partial<UserPreferences>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  log: (entry: Omit<AuditLog, "id" | "timestamp" | "ip">) => void;
}

const Ctx = createContext<AppState | null>(null);

const colors = ["#00a14b", "#2563eb", "#db2777", "#d97706", "#7c3aed", "#0891b2"];
const now = () =>
  new Date().toLocaleString("pt-BR", { hour12: false }).replace(",", "");

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthState | null>(null);
  const [users, setUsers] = useState<User[]>(seed.users);
  const [courses, setCourses] = useState<Course[]>(seed.courses);
  const [turmas, setTurmas] = useState<Turma[]>(seed.turmas);
  const [trilhas, setTrilhas] = useState<Trilha[]>(seed.trilhas);
  const [salas, setSalas] = useState<Sala[]>(seed.salas);
  const [certificados, setCertificados] = useState<Certificado[]>(seed.certificados);
  const [interesses, setInteresses] = useState<InteresseCurso[]>(seed.interesses);
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoMatricula[]>(seed.solicitacoes);
  const [inscricoes, setInscricoes] = useState<InscricaoCurso[]>(seed.inscricoes);
  const [posts, setPosts] = useState<Post[]>(seed.posts);
  const [messages, setMessages] = useState<Message[]>(seed.messages);
  const [questions, setQuestions] = useState<Question[]>(seed.questions);
  const [evaluations, setEvaluations] = useState<Evaluation[]>(seed.evaluations);
  const [contents, setContents] = useState<ContentAsset[]>(seed.contents);
  const [destaques, setDestaques] = useState<Destaque[]>(seed.destaques);
  const [alertRules, setAlertRules] = useState<AlertRule[]>(seed.alertRules);
  const [internalMails, setInternalMails] = useState<InternalMail[]>(seed.internalMails);
  const [automations, setAutomations] = useState<Automation[]>(seed.automations);
  const [integrations, setIntegrations] = useState<Integration[]>(seed.integrations);
  const [permissions, setPermissions] = useState<Permission[]>(seed.permissions);
  const [scheduledJobs, setScheduledJobs] = useState<ScheduledJob[]>(seed.scheduledJobs);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(seed.auditLogs);
  const [settings, setSettings] = useState<Settings>(seed.settings);
  const [notifications, setNotifications] = useState<Notification[]>(seed.notifications);
  const [preferences, setPreferences] = useState<UserPreferences>(seed.defaultPreferences);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("neo-lms-user");
      if (raw) {
        const session = resolveSession(raw, seed.users);
        if (session) setCurrentUser(session);
        else localStorage.removeItem("neo-lms-user");
      }
      const prefs = localStorage.getItem("neo-lms-prefs");
      if (prefs) setPreferences(JSON.parse(prefs));
    } catch {}
  }, []);

  const login = (email: string) => {
    const existing = users.find((u) => u.email === email);
    const u: AuthState = {
      id: existing?.id ?? "guest",
      name: existing?.name ?? email.split("@")[0],
      email,
      role: existing?.role ?? "aluno",
      unitId: existing?.unitId ?? "holding",
      avatarColor: existing?.avatarColor ?? "#00a14b",
    };
    setCurrentUser(u);
    try {
      localStorage.setItem("neo-lms-user", JSON.stringify(u));
    } catch {}
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem("neo-lms-user");
    } catch {}
  };

  const log: AppState["log"] = (entry) => {
    setAuditLogs((prev) => [
      {
        ...entry,
        id: "l" + Math.random().toString(36).slice(2, 8),
        timestamp: now(),
        ip: "10.2.31.5",
      },
      ...prev,
    ]);
  };

  const addUser: AppState["addUser"] = (u) => {
    const id = "u" + Math.random().toString(36).slice(2, 7);
    const scopedUnit =
      currentUser && hasPermission(currentUser.role, "manage_users_unit") && !hasPermission(currentUser.role, "manage_users_all")
        ? currentUser.unitId
        : u.unitId;
    setUsers((prev) => [
      {
        ...u,
        unitId: scopedUnit,
        id,
        avatarColor: colors[prev.length % colors.length],
        lastAccess: "—",
      },
      ...prev,
    ]);
    log({ user: currentUser?.email ?? "system", action: `Criou usuário '${u.name}'`, module: "Administração", severity: "alerta" });
  };

  const toggleUserStatus: AppState["toggleUserStatus"] = (id) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === "ativo" ? "bloqueado" : "ativo" }
          : u
      )
    );
  };

  const addTurma: AppState["addTurma"] = (t) => {
    const id = "t" + Math.random().toString(36).slice(2, 7);
    const unitId =
      currentUser && !hasPermission(currentUser.role, "view_all_units")
        ? currentUser.unitId
        : t.unitId;
    setTurmas((prev) => [{ ...t, id, unitId }, ...prev]);
    log({ user: currentUser?.email ?? "system", action: `Criou turma '${t.name}'`, module: "Aprendizagem", severity: "info" });
  };

  const addPost: AppState["addPost"] = (p) => {
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
    log({ user: currentUser?.email ?? "system", action: `Publicou post '${p.title}'`, module: "Comunicação", severity: "info" });
  };

  const updatePost: AppState["updatePost"] = (id, data) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
    log({ user: currentUser?.email ?? "system", action: `Atualizou post '${id}'`, module: "Comunicação", severity: "info" });
  };

  const addQuestion: AppState["addQuestion"] = (q) => {
    const id = "q" + Math.random().toString(36).slice(2, 7);
    const unitId =
      currentUser && !hasPermission(currentUser.role, "view_all_units")
        ? currentUser.unitId
        : q.unitId;
    setQuestions((prev) => [{ ...q, id, unitId, usageCount: 0 }, ...prev]);
    log({ user: currentUser?.email ?? "system", action: `Cadastrou questão '${id}'`, module: "Repositório", severity: "info" });
  };

  const updateQuestion: AppState["updateQuestion"] = (id, data) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...data } : q)));
  };

  const addEvaluation: AppState["addEvaluation"] = (e) => {
    const id = "av" + Math.random().toString(36).slice(2, 7);
    const unitId =
      currentUser && !hasPermission(currentUser.role, "view_all_units")
        ? currentUser.unitId
        : e.unitId;
    setEvaluations((prev) => [
      { ...e, id, unitId, questionCount: e.questionIds.length },
      ...prev,
    ]);
    log({ user: currentUser?.email ?? "system", action: `Criou avaliação '${e.name}'`, module: "Aprendizagem", severity: "info" });
  };

  const updateEvaluation: AppState["updateEvaluation"] = (id, data) => {
    setEvaluations((prev) =>
      prev.map((ev) => {
        if (ev.id !== id) return ev;
        const next = { ...ev, ...data };
        if (data.questionIds) next.questionCount = data.questionIds.length;
        return next;
      })
    );
  };

  const applyEvaluation: AppState["applyEvaluation"] = (id) => {
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
      setNotifications((prev) => [
        {
          id: "n" + Math.random().toString(36).slice(2, 7),
          userId: currentUser.id,
          title: `Avaliação aplicada: ${appliedName}`,
          message: "A avaliação foi disponibilizada para a turma vinculada.",
          type: "curso",
          read: false,
          timestamp: "Agora",
          href: "/aprendizagem/avaliacoes",
        },
        ...prev,
      ]);
    }
    log({ user: currentUser?.email ?? "system", action: `Aplicou avaliação '${id}'`, module: "Aprendizagem", severity: "info" });
  };

  const addContent: AppState["addContent"] = (c) => {
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
    log({ user: currentUser?.email ?? "system", action: `Enviou conteúdo '${c.name}'`, module: "Repositório", severity: "info" });
  };

  const updateContent: AppState["updateContent"] = (id, data) => {
    setContents((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
  };

  const addDestaque: AppState["addDestaque"] = (d) => {
    const id = "d" + Math.random().toString(36).slice(2, 7);
    const unitId =
      currentUser && !hasPermission(currentUser.role, "view_all_units")
        ? currentUser.unitId
        : d.unitId;
    setDestaques((prev) => [{ ...d, id, unitId, publishedAt: now() }, ...prev]);
    log({ user: currentUser?.email ?? "system", action: `Publicou destaque '${d.title}'`, module: "Comunicação", severity: "info" });
  };

  const updateDestaque: AppState["updateDestaque"] = (id, data) => {
    setDestaques((prev) => prev.map((d) => (d.id === id ? { ...d, ...data } : d)));
  };

  const addAlertRule: AppState["addAlertRule"] = (r) => {
    const id = "ar" + Math.random().toString(36).slice(2, 7);
    const unitId =
      currentUser && !hasPermission(currentUser.role, "view_all_units")
        ? currentUser.unitId
        : r.unitId;
    setAlertRules((prev) => [{ ...r, id, unitId }, ...prev]);
    log({ user: currentUser?.email ?? "system", action: `Criou alerta '${r.name}'`, module: "Comunicação", severity: "info" });
  };

  const toggleAlertRule: AppState["toggleAlertRule"] = (id) => {
    setAlertRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const sendInternalMail: AppState["sendInternalMail"] = (m) => {
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
    log({ user: currentUser?.email ?? "system", action: `Enviou mensagem interna para '${m.toName}'`, module: "Comunicação", severity: "info" });
  };

  const markMailRead: AppState["markMailRead"] = (id) => {
    setInternalMails((prev) => prev.map((m) => (m.id === id ? { ...m, read: true } : m)));
  };

  const addMessage: AppState["addMessage"] = (m) => {
    const id = "m" + Math.random().toString(36).slice(2, 7);
    setMessages((prev) => [{ ...m, id }, ...prev]);
    log({ user: currentUser?.email ?? "system", action: `Criou campanha '${m.title}'`, module: "Comunicação", severity: "info" });
  };

  const dispatchNotification: AppState["dispatchNotification"] = (n) => {
    const userId = n.userId ?? currentUser?.id;
    if (!userId) return;
    setNotifications((prev) => [
      {
        ...n,
        userId,
        id: "n" + Math.random().toString(36).slice(2, 7),
        read: false,
        timestamp: "Agora",
      },
      ...prev,
    ]);
    log({ user: currentUser?.email ?? "system", action: `Disparou notificação '${n.title}'`, module: "Comunicação", severity: "info" });
  };

  const addCourse: AppState["addCourse"] = (c) => {
    const id = "c" + Math.random().toString(36).slice(2, 7);
    const unitId =
      currentUser && !hasPermission(currentUser.role, "view_all_units")
        ? currentUser.unitId
        : c.unitId;
    setCourses((prev) => [{ ...c, id, unitId, enrolled: 0, completion: 0 }, ...prev]);
    log({ user: currentUser?.email ?? "system", action: `Criou curso '${c.title}'`, module: "Aprendizagem", severity: "info" });
  };

  const updateCourse: AppState["updateCourse"] = (id, data) => {
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
    log({ user: currentUser?.email ?? "system", action: `Atualizou curso '${id}'`, module: "Aprendizagem", severity: "info" });
  };

  const updateTurma: AppState["updateTurma"] = (id, data) => {
    setTurmas((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
    log({ user: currentUser?.email ?? "system", action: `Atualizou turma '${id}'`, module: "Aprendizagem", severity: "info" });
  };

  const addTrilha: AppState["addTrilha"] = (t) => {
    const id = "tr" + Math.random().toString(36).slice(2, 7);
    setTrilhas((prev) => [{ ...t, id, progress: 0 }, ...prev]);
    log({ user: currentUser?.email ?? "system", action: `Criou trilha '${t.name}'`, module: "Aprendizagem", severity: "info" });
  };

  const updateTrilha: AppState["updateTrilha"] = (id, data) => {
    setTrilhas((prev) => prev.map((tr) => (tr.id === id ? { ...tr, ...data } : tr)));
  };

  const addSala: AppState["addSala"] = (s) => {
    const id = "s" + Math.random().toString(36).slice(2, 7);
    const unitId =
      currentUser && !hasPermission(currentUser.role, "view_all_units")
        ? currentUser.unitId
        : s.unitId;
    setSalas((prev) => [{ ...s, id, unitId }, ...prev]);
    log({ user: currentUser?.email ?? "system", action: `Cadastrou sala '${s.name}'`, module: "Aprendizagem", severity: "info" });
  };

  const finalizeEnrollment = (
    params: {
      userId: string;
      userName: string;
      courseId: string;
      courseTitle: string;
      turmaId?: string;
      turmaName?: string;
      unitId: UnitId;
    }
  ) => {
    const id = "ins" + Math.random().toString(36).slice(2, 7);
    setInscricoes((prev) => {
      if (
        prev.some(
          (i) =>
            i.userId === params.userId &&
            i.courseId === params.courseId &&
            i.status === "ativa"
        )
      ) {
        return prev;
      }
      return [
        {
          id,
          userId: params.userId,
          userName: params.userName,
          courseId: params.courseId,
          courseTitle: params.courseTitle,
          turmaId: params.turmaId,
          turmaName: params.turmaName,
          unitId: params.unitId,
          enrolledAt: now(),
          progress: 0,
          status: "ativa",
        },
        ...prev,
      ];
    });
    setCourses((prev) =>
      prev.map((c) =>
        c.id === params.courseId ? { ...c, enrolled: c.enrolled + 1 } : c
      )
    );
    if (params.turmaId) {
      setTurmas((prev) =>
        prev.map((t) =>
          t.id === params.turmaId ? { ...t, enrolled: t.enrolled + 1 } : t
        )
      );
    }
  };

  const updateSolicitacao: AppState["updateSolicitacao"] = (id, status) => {
    const sol = solicitacoes.find((s) => s.id === id);
    if (sol && status === "aprovada" && sol.status === "pendente") {
      const turma = sol.turmaId ? turmas.find((t) => t.id === sol.turmaId) : undefined;
      finalizeEnrollment({
        userId: sol.userId,
        userName: sol.userName,
        courseId: sol.courseId,
        courseTitle: sol.courseTitle,
        turmaId: sol.turmaId,
        turmaName: turma?.name,
        unitId: sol.unitId,
      });
      dispatchNotification({
        userId: sol.userId,
        title: "Matrícula aprovada",
        message: `Sua inscrição em "${sol.courseTitle}" foi aprovada.`,
        type: "curso",
        href: "/aprendizagem/catalogo?tab=inscricoes",
      });
    }
    setSolicitacoes((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status, reviewer: currentUser?.name ?? s.reviewer }
          : s
      )
    );
    log({ user: currentUser?.email ?? "system", action: `Solicitação '${id}' → ${status}`, module: "Aprendizagem", severity: "info" });
  };

  const inscreverCurso: AppState["inscreverCurso"] = (courseId, turmaId) => {
    if (!currentUser) return "login";

    const course = courses.find((c) => c.id === courseId);
    if (!course) return "duplicate";

    const turma = turmaId ? turmas.find((t) => t.id === turmaId) : undefined;
    if (turma && turma.enrolled >= turma.capacity) return "lotada";

    const alreadyEnrolled = inscricoes.some(
      (i) =>
        i.userId === currentUser.id &&
        i.courseId === courseId &&
        i.status === "ativa"
    );
    if (alreadyEnrolled) return "duplicate";

    const pending = solicitacoes.some(
      (s) =>
        s.userId === currentUser.id &&
        s.courseId === courseId &&
        s.status === "pendente"
    );
    if (pending) return "duplicate";

    if (settings.approvalRequired) {
      const id = "sol" + Math.random().toString(36).slice(2, 7);
      setSolicitacoes((prev) => [
        {
          id,
          userId: currentUser.id,
          userName: currentUser.name,
          courseId: course.id,
          courseTitle: course.title,
          turmaId,
          unitId: currentUser.unitId,
          requestedAt: now(),
          status: "pendente",
        },
        ...prev,
      ]);
      dispatchNotification({
        userId: currentUser.id,
        title: "Solicitação enviada",
        message: `Sua inscrição em "${course.title}" aguarda aprovação.`,
        type: "info",
        href: "/aprendizagem/catalogo?tab=inscricoes",
      });
      log({
        user: currentUser.email,
        action: `Solicitou matrícula em '${course.title}'`,
        module: "Aprendizagem",
        severity: "info",
      });
      return "pending";
    }

    finalizeEnrollment({
      userId: currentUser.id,
      userName: currentUser.name,
      courseId: course.id,
      courseTitle: course.title,
      turmaId,
      turmaName: turma?.name,
      unitId: currentUser.unitId,
    });
    dispatchNotification({
      userId: currentUser.id,
      title: "Inscrição confirmada",
      message: `Você foi matriculado em "${course.title}".`,
      type: "curso",
      href: "/aprendizagem/catalogo?tab=inscricoes",
    });
    log({
      user: currentUser.email,
      action: `Inscreveu-se em '${course.title}'`,
      module: "Aprendizagem",
      severity: "info",
    });
    return "ok";
  };

  const cancelarInscricao: AppState["cancelarInscricao"] = (id) => {
    const ins = inscricoes.find((i) => i.id === id);
    if (!ins || ins.status !== "ativa") return;

    setInscricoes((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: "cancelada" } : i))
    );
    setCourses((prev) =>
      prev.map((c) =>
        c.id === ins.courseId ? { ...c, enrolled: Math.max(0, c.enrolled - 1) } : c
      )
    );
    if (ins.turmaId) {
      setTurmas((prev) =>
        prev.map((t) =>
          t.id === ins.turmaId
            ? { ...t, enrolled: Math.max(0, t.enrolled - 1) }
            : t
        )
      );
    }
    log({
      user: currentUser?.email ?? "system",
      action: `Cancelou inscrição em '${ins.courseTitle}'`,
      module: "Aprendizagem",
      severity: "info",
    });
  };

  const addInteresse: AppState["addInteresse"] = (i) => {
    const id = "int" + Math.random().toString(36).slice(2, 7);
    setInteresses((prev) => [{ ...i, id, registeredAt: now(), notified: false }, ...prev]);
  };

  const updateCertificado: AppState["updateCertificado"] = (id, status) => {
    setCertificados((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    log({ user: currentUser?.email ?? "system", action: `Certificado '${id}' → ${status}`, module: "Aprendizagem", severity: "alerta" });
  };

  useEffect(() => {
    applyBrandColor(settings.brandColor);
  }, [settings.brandColor]);

  const toggleAutomation: AppState["toggleAutomation"] = (id) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  };

  const updateIntegration: AppState["updateIntegration"] = (id, data) => {
    setIntegrations((prev) => prev.map((i) => (i.id === id ? { ...i, ...data } : i)));
    log({ user: currentUser?.email ?? "system", action: `Atualizou integração '${id}'`, module: "Integrações", severity: "info" });
  };

  const togglePermissionRole: AppState["togglePermissionRole"] = (permId, role) => {
    setPermissions((prev) =>
      prev.map((p) => {
        if (p.id !== permId) return p;
        const roles = p.roles.includes(role)
          ? p.roles.filter((r) => r !== role)
          : [...p.roles, role];
        return { ...p, roles };
      })
    );
    log({ user: currentUser?.email ?? "system", action: `Alterou permissão '${permId}' · ${role}`, module: "Identidade", severity: "alerta" });
  };

  const toggleScheduledJob: AppState["toggleScheduledJob"] = (id) => {
    setScheduledJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, enabled: !j.enabled } : j))
    );
    log({ user: currentUser?.email ?? "system", action: `Alternou job agendado '${id}'`, module: "Configurações", severity: "info" });
  };

  const updateSettings: AppState["updateSettings"] = (s) => {
    setSettings((prev) => {
      const next = { ...prev, ...s };
      if (s.brandColor) applyBrandColor(s.brandColor);
      return next;
    });
    log({ user: currentUser?.email ?? "system", action: "Atualizou parâmetros da plataforma", module: "Configurações", severity: "alerta" });
  };

  const updatePreferences: AppState["updatePreferences"] = (p) => {
    setPreferences((prev) => {
      const next = { ...prev, ...p };
      try {
        localStorage.setItem("neo-lms-prefs", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const markNotificationRead: AppState["markNotificationRead"] = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead: AppState["markAllNotificationsRead"] = () => {
    if (!currentUser) return;
    setNotifications((prev) =>
      prev.map((n) => (n.userId === currentUser.id ? { ...n, read: true } : n))
    );
  };

  const myNotifications = useMemo(
    () =>
      currentUser
        ? notifications.filter((n) => n.userId === currentUser.id)
        : [],
    [notifications, currentUser]
  );

  const unreadCount = myNotifications.filter((n) => !n.read).length;

  const value = useMemo<AppState>(
    () => ({
      currentUser,
      login,
      logout,
      users,
      courses,
      turmas,
      trilhas,
      salas,
      certificados,
      interesses,
      solicitacoes,
      inscricoes,
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
      addCourse,
      updateCourse,
      addTurma,
      updateTurma,
      addTrilha,
      updateTrilha,
      addSala,
      updateSolicitacao,
      inscreverCurso,
      cancelarInscricao,
      addInteresse,
      updateCertificado,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUser, users, courses, turmas, trilhas, salas, certificados, interesses, solicitacoes, inscricoes, posts, messages, questions, evaluations, contents, destaques, alertRules, internalMails, automations, integrations, permissions, scheduledJobs, auditLogs, settings, myNotifications, preferences]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp deve ser usado dentro de AppProvider");
  return ctx;
}
