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
} from "./types";
import { hasPermission } from "./rbac";

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
  posts: Post[];
  messages: Message[];
  automations: Automation[];
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
  addInteresse: (i: Omit<InteresseCurso, "id" | "registeredAt" | "notified">) => void;
  updateCertificado: (id: string, status: Certificado["status"]) => void;
  addPost: (p: Omit<Post, "id" | "publishedAt" | "author" | "status">) => void;
  toggleAutomation: (id: string) => void;
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
  const [posts, setPosts] = useState<Post[]>(seed.posts);
  const [messages] = useState<Message[]>(seed.messages);
  const [automations, setAutomations] = useState<Automation[]>(seed.automations);
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

  const updateSolicitacao: AppState["updateSolicitacao"] = (id, status) => {
    setSolicitacoes((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status, reviewer: currentUser?.name ?? s.reviewer }
          : s
      )
    );
    log({ user: currentUser?.email ?? "system", action: `Solicitação '${id}' → ${status}`, module: "Aprendizagem", severity: "info" });
  };

  const addInteresse: AppState["addInteresse"] = (i) => {
    const id = "int" + Math.random().toString(36).slice(2, 7);
    setInteresses((prev) => [{ ...i, id, registeredAt: now(), notified: false }, ...prev]);
  };

  const updateCertificado: AppState["updateCertificado"] = (id, status) => {
    setCertificados((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    log({ user: currentUser?.email ?? "system", action: `Certificado '${id}' → ${status}`, module: "Aprendizagem", severity: "alerta" });
  };

  const toggleAutomation: AppState["toggleAutomation"] = (id) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  };

  const updateSettings: AppState["updateSettings"] = (s) => {
    setSettings((prev) => ({ ...prev, ...s }));
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
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

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
      posts,
      messages,
      automations,
      auditLogs,
      settings,
      notifications,
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
      addInteresse,
      updateCertificado,
      addPost,
      toggleAutomation,
      updateSettings,
      updatePreferences,
      markNotificationRead,
      markAllNotificationsRead,
      log,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUser, users, courses, turmas, trilhas, salas, certificados, interesses, solicitacoes, posts, messages, automations, auditLogs, settings, notifications, preferences]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp deve ser usado dentro de AppProvider");
  return ctx;
}
