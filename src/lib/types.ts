export type Role =
  | "admin_premium"
  | "admin_unidade"
  | "gestor_conteudo"
  | "instrutor"
  | "aluno";

export type UnitId = "coelba" | "celpe" | "coelce" | "elektro" | "holding";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  unitId: UnitId;
  department: string;
  status: "ativo" | "inativo" | "bloqueado";
  lastAccess: string;
  avatarColor: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  roles: Role[];
}

export interface Course {
  id: string;
  title: string;
  category: string;
  instructor: string;
  unitId: UnitId;
  modality: "online" | "presencial" | "hibrido";
  audience: string;
  workload: number; // horas
  status: "publicado" | "rascunho" | "arquivado";
  enrolled: number;
  completion: number; // %
  cover: string;
}

export interface Turma {
  id: string;
  courseId: string;
  name: string;
  instructor: string;
  unitId: UnitId;
  salaId?: string;
  startDate: string;
  endDate: string;
  capacity: number;
  enrolled: number;
  status: "agendada" | "em_andamento" | "concluida";
}

export interface TrilhaStep {
  order: number;
  courseId: string;
  title: string;
  required: boolean;
}

export interface Trilha {
  id: string;
  name: string;
  description: string;
  courseIds: string[];
  steps: TrilhaStep[];
  audience: string;
  progress: number; // %
  status: "ativa" | "rascunho" | "arquivada";
}

export interface Sala {
  id: string;
  name: string;
  unitId: UnitId;
  location: string;
  capacity: number;
  resources: string[];
  status: "disponivel" | "manutencao" | "indisponivel";
}

export interface Certificado {
  id: string;
  userId: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  unitId: UnitId;
  issuedAt: string;
  expiresAt: string;
  status: "valido" | "expirado" | "revogado";
}

export interface InteresseCurso {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  courseId: string;
  courseTitle: string;
  unitId: UnitId;
  registeredAt: string;
  notified: boolean;
}

export interface SolicitacaoMatricula {
  id: string;
  userId: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  turmaId?: string;
  unitId: UnitId;
  requestedAt: string;
  status: "pendente" | "aprovada" | "rejeitada" | "cancelada";
  reviewer?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: "aula" | "prova" | "webinar" | "prazo" | "presencial";
  turma?: string;
  courseId?: string;
  turmaId?: string;
  salaId?: string;
  modality?: Course["modality"];
}

export interface ContentAsset {
  id: string;
  name: string;
  type: "video" | "pdf" | "scorm" | "imagem" | "link";
  size: string;
  category: string;
  unitId: UnitId;
  uploadedBy: string;
  uploadedAt: string;
  downloads: number;
  usedIn: ("curso" | "biblioteca" | "avaliacao" | "comunicacao")[];
}

export interface Message {
  id: string;
  title: string;
  channel: "email" | "push" | "mural" | "sms";
  audience: string;
  status: "enviado" | "agendado" | "rascunho";
  sentAt: string;
  openRate: number; // %
}

export interface Integration {
  id: string;
  name: string;
  type: "SSO" | "RH" | "BI" | "Webhook" | "API";
  status: "conectado" | "desconectado" | "erro";
  lastSync: string;
}

export interface Automation {
  id: string;
  name: string;
  trigger: string;
  action: string;
  enabled: boolean;
  runs: number;
}

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  module: string;
  ip: string;
  timestamp: string;
  severity: "info" | "alerta" | "critico";
}

export interface Settings {
  orgName: string;
  language: string;
  timezone: string;
  passwordMinLength: number;
  mfaRequired: boolean;
  certificateValidity: number; // meses
  approvalRequired: boolean;
  brandColor: string;
  modules: {
    aprendizagem: boolean;
    repositorio: boolean;
    comunicacao: boolean;
    relatorios: boolean;
    administracao: boolean;
    sistema: boolean;
  };
  layout: {
    navStyle: "sidebar" | "top";
    density: "comfortable" | "compact";
    showDestaques: boolean;
  };
}

export interface ScheduledJob {
  id: string;
  name: string;
  schedule: string;
  module: string;
  action: string;
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "alerta" | "curso" | "prazo";
  read: boolean;
  timestamp: string;
  href?: string;
}

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  language: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  compactSidebar: boolean;
}

export interface Question {
  id: string;
  text: string;
  type: "multipla" | "verdadeiro" | "dissertativa";
  category: string;
  unitId: UnitId;
  usageCount: number;
}

export interface Evaluation {
  id: string;
  name: string;
  courseId: string;
  turmaId?: string;
  unitId: UnitId;
  questionIds: string[];
  questionCount: number;
  status: "rascunho" | "publicada" | "encerrada" | "aplicada";
  dueDate: string;
  appliedAt?: string;
}

export interface Destaque {
  id: string;
  title: string;
  body: string;
  unitId: UnitId;
  visible: boolean;
  pinned: boolean;
  publishedAt: string;
  expiresAt?: string;
}

export interface AlertRule {
  id: string;
  name: string;
  criteria: string;
  channel: "email" | "push" | "sistema";
  audience: string;
  unitId: UnitId;
  enabled: boolean;
  lastTriggered?: string;
}

export interface InternalMail {
  id: string;
  fromUserId: string;
  fromName: string;
  toUserId: string;
  toName: string;
  subject: string;
  body: string;
  unitId: UnitId;
  read: boolean;
  sentAt: string;
}

export interface Post {
  id: string;
  title: string;
  body: string;
  author: string;
  unitId: UnitId;
  status: "rascunho" | "publicado";
  publishedAt: string;
}
