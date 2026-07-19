import type {
  AuditLog,
  Automation,
  Course,
  CourseLesson,
  CourseModule,
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
  LessonProgress,
} from "../types";

export interface AuthState {
  id: string;
  name: string;
  email: string;
  role: Role;
  unitId: UnitId;
  avatarColor: string;
  authProvider?: "microsoft" | "password";
}

export interface AppState {
  // auth
  currentUser: AuthState | null;
  login: (
    email: string,
    options?: {
      name?: string;
      password?: string;
      provider?: AuthState["authProvider"];
    }
  ) => Promise<void>;
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
  courseModules: CourseModule[];
  courseLessons: CourseLesson[];
  lessonProgress: LessonProgress[];
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
  updateSolicitacao: (
    id: string,
    status: SolicitacaoMatricula["status"]
  ) => void | Promise<void>;
  inscreverCurso: (
    courseId: string,
    turmaId?: string
  ) =>
    | "ok"
    | "duplicate"
    | "pending"
    | "lotada"
    | "login"
    | Promise<"ok" | "duplicate" | "pending" | "lotada" | "login">;
  cancelarInscricao: (id: string) => void;
  completeLesson: (lessonId: string) => void;
  importPlaylistLessons: (
    courseId: string,
    moduleTitle: string,
    items: Array<{
      videoId?: string;
      videoUrl?: string;
      title: string;
      durationSec?: number;
    }>,
    existingModuleId?: string
  ) => void;
  publishCourseLesson: (params: {
    courseId: string;
    moduleId?: string;
    moduleTitle?: string;
    title: string;
    youtubeVideoId?: string;
    videoUrl?: string;
    durationSec?: number;
  }) => void;
  updateCourseLesson: (
    lessonId: string,
    data: Partial<
      Pick<CourseLesson, "title" | "youtubeVideoId" | "videoUrl" | "moduleId" | "order">
    >
  ) => void;
  deleteCourseLesson: (lessonId: string) => void;
  deleteAllCourseLessons: (courseId: string) => void;
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
  sendInternalMail: (
    m: Omit<InternalMail, "id" | "sentAt" | "read" | "fromUserId" | "fromName">
  ) => void;
  markMailRead: (id: string) => void;
  addMessage: (m: Omit<Message, "id">) => void;
  dispatchNotification: (n: Omit<Notification, "id" | "read" | "timestamp">) => void;
  toggleAutomation: (id: string) => void;
  updateIntegration: (id: string, data: Partial<Integration>) => void;
  togglePermissionRole: (permId: string, role: Role) => void;
  toggleScheduledJob: (id: string) => void;
  updateSettings: (s: Partial<Settings>) => void;
  updatePreferences: (p: Partial<UserPreferences>) => void;
  markNotificationRead: (id: string) => void | Promise<void>;
  markAllNotificationsRead: () => void | Promise<void>;
  log: (entry: Omit<AuditLog, "id" | "timestamp" | "ip">) => void;
}
