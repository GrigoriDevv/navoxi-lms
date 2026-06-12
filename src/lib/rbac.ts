import type { Role } from "./types";

export const roleLabels: Record<Role, string> = {
  admin_premium: "Administrador Premium",
  admin_unidade: "Administrador de Unidade",
  gestor_conteudo: "Gestor de Conteúdo",
  instrutor: "Instrutor",
  aluno: "Aluno",
};

export const roleDescriptions: Record<Role, string> = {
  admin_premium:
    "Acesso total à plataforma, incluindo configurações globais, todas as unidades e gerenciamento completo de usuários, conteúdos e relatórios.",
  admin_unidade:
    "Acesso limitado ao escopo da sua unidade. Pode gerenciar usuários, turmas, relatórios e conteúdos dentro de sua unidade de atuação.",
  gestor_conteudo:
    "Perfil complementar — a confirmar. Escopo previsto: gestão e publicação de conteúdos e repositório.",
  instrutor:
    "Perfil complementar — a confirmar. Escopo previsto: cursos, turmas e trilhas sob sua responsabilidade.",
  aluno:
    "Perfil complementar — a confirmar. Escopo previsto: consumo de cursos, trilhas e calendário.",
};

/** Perfis já mapeados e validados no levantamento atual */
export const confirmedRoles: Role[] = ["admin_premium", "admin_unidade"];

/** Perfis pendentes de levantamento complementar */
export const pendingRoles: Role[] = ["gestor_conteudo", "instrutor", "aluno"];

export function isConfirmedRole(role: Role): boolean {
  return confirmedRoles.includes(role);
}

export const unitLabels: Record<string, string> = {
  coelba: "Coelba · Bahia",
  celpe: "Celpe · Pernambuco",
  coelce: "Coelce · Ceará",
  elektro: "Elektro · SP/MS",
  holding: "Neoenergia · Holding",
};

export type PermissionKey =
  | "manage_identity"
  | "manage_users_all"
  | "manage_users_unit"
  | "manage_global_settings"
  | "manage_integrations"
  | "view_audit"
  | "manage_courses"
  | "manage_turmas"
  | "manage_content"
  | "view_reports_all"
  | "view_reports_unit"
  | "send_communications"
  | "view_all_units"
  | "consume_learning"
  | "manage_own_session";

const rolePermissions: Record<Role, PermissionKey[]> = {
  admin_premium: [
    "manage_identity",
    "manage_users_all",
    "manage_global_settings",
    "manage_integrations",
    "view_audit",
    "manage_courses",
    "manage_turmas",
    "manage_content",
    "view_reports_all",
    "send_communications",
    "view_all_units",
    "consume_learning",
    "manage_own_session",
  ],
  admin_unidade: [
    "manage_users_unit",
    "manage_courses",
    "manage_turmas",
    "manage_content",
    "view_reports_unit",
    "send_communications",
    "consume_learning",
    "manage_own_session",
  ],
  gestor_conteudo: ["manage_content", "manage_courses", "consume_learning", "manage_own_session"],
  instrutor: ["manage_courses", "manage_turmas", "consume_learning", "manage_own_session"],
  aluno: ["consume_learning", "manage_own_session"],
};

export function hasPermission(role: Role, permission: PermissionKey): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

/** Rotas acessíveis por perfil */
const routeAccess: Record<string, PermissionKey[]> = {
  "/dashboard": ["consume_learning"],
  "/perfil": ["manage_own_session"],
  "/preferencias": ["manage_own_session"],
  "/identidade": ["manage_identity"],
  "/administracao": ["manage_users_all", "manage_users_unit"],
  "/aprendizagem/cursos": ["manage_courses", "consume_learning"],
  "/aprendizagem/catalogo": ["consume_learning"],
  "/aprendizagem/biblioteca": ["consume_learning", "manage_content"],
  "/aprendizagem/turmas": ["manage_turmas"],
  "/aprendizagem/trilhas": ["manage_courses", "consume_learning"],
  "/aprendizagem/avaliacoes": ["manage_courses", "manage_turmas"],
  "/aprendizagem/salas": ["manage_turmas", "manage_courses"],
  "/aprendizagem/certificados": ["consume_learning", "manage_courses", "manage_turmas"],
  "/aprendizagem/interesses": ["manage_courses", "manage_turmas", "consume_learning"],
  "/aprendizagem/solicitacoes": ["manage_turmas", "manage_users_all", "manage_users_unit"],
  "/aprendizagem/calendario": ["manage_courses", "consume_learning"],
  "/repositorio": ["manage_content"],
  "/repositorio/questoes": ["manage_content"],
  "/comunicacao": ["send_communications"],
  "/relatorios": ["view_reports_all", "view_reports_unit"],
  "/configuracoes": ["manage_global_settings"],
  "/integracoes": ["manage_integrations"],
  "/auditoria": ["view_audit"],
};

export function canAccessRoute(role: Role, pathname: string): boolean {
  const route = Object.keys(routeAccess).find(
    (r) => pathname === r || pathname.startsWith(r + "/")
  );
  if (!route) return true;
  const required = routeAccess[route];
  return required.some((p) => hasPermission(role, p));
}

export interface NavItemDef {
  label: string;
  href: string;
  icon: string;
  permissions: PermissionKey[];
  group: string;
}

export const navItems: NavItemDef[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "grid",
    permissions: ["consume_learning"],
    group: "Geral",
  },
  {
    label: "Identidade & Acesso",
    href: "/identidade",
    icon: "shield",
    permissions: ["manage_identity"],
    group: "Administração",
  },
  {
    label: "Administração",
    href: "/administracao",
    icon: "users",
    permissions: ["manage_users_all", "manage_users_unit"],
    group: "Administração",
  },
  {
    label: "Catálogo",
    href: "/aprendizagem/catalogo",
    icon: "grid",
    permissions: ["consume_learning"],
    group: "Aprendizagem",
  },
  {
    label: "Cursos",
    href: "/aprendizagem/cursos",
    icon: "book",
    permissions: ["manage_courses"],
    group: "Aprendizagem",
  },
  {
    label: "Turmas",
    href: "/aprendizagem/turmas",
    icon: "group",
    permissions: ["manage_turmas"],
    group: "Aprendizagem",
  },
  {
    label: "Trilhas",
    href: "/aprendizagem/trilhas",
    icon: "route",
    permissions: ["manage_courses", "consume_learning"],
    group: "Aprendizagem",
  },
  {
    label: "Calendário",
    href: "/aprendizagem/calendario",
    icon: "calendar",
    permissions: ["consume_learning"],
    group: "Aprendizagem",
  },
  {
    label: "Biblioteca",
    href: "/aprendizagem/biblioteca",
    icon: "folder",
    permissions: ["consume_learning", "manage_content"],
    group: "Aprendizagem",
  },
  {
    label: "Salas",
    href: "/aprendizagem/salas",
    icon: "plug",
    permissions: ["manage_turmas", "manage_courses"],
    group: "Aprendizagem",
  },
  {
    label: "Certificados",
    href: "/aprendizagem/certificados",
    icon: "check",
    permissions: ["consume_learning", "manage_courses", "manage_turmas"],
    group: "Aprendizagem",
  },
  {
    label: "Interesses",
    href: "/aprendizagem/interesses",
    icon: "trend",
    permissions: ["manage_courses", "manage_turmas", "consume_learning"],
    group: "Aprendizagem",
  },
  {
    label: "Solicitações",
    href: "/aprendizagem/solicitacoes",
    icon: "mail",
    permissions: ["manage_turmas", "manage_users_all", "manage_users_unit"],
    group: "Aprendizagem",
  },
  {
    label: "Questões",
    href: "/repositorio/questoes",
    icon: "list",
    permissions: ["manage_content"],
    group: "Conteúdo",
  },
  {
    label: "Avaliações",
    href: "/aprendizagem/avaliacoes",
    icon: "check",
    permissions: ["manage_courses", "manage_turmas"],
    group: "Aprendizagem",
  },
  {
    label: "Repositório",
    href: "/repositorio",
    icon: "folder",
    permissions: ["manage_content"],
    group: "Conteúdo",
  },
  {
    label: "Comunicação",
    href: "/comunicacao",
    icon: "mail",
    permissions: ["send_communications"],
    group: "Conteúdo",
  },
  {
    label: "Relatórios & Analytics",
    href: "/relatorios",
    icon: "chart",
    permissions: ["view_reports_all", "view_reports_unit"],
    group: "Inteligência",
  },
  {
    label: "Configurações",
    href: "/configuracoes",
    icon: "cog",
    permissions: ["manage_global_settings"],
    group: "Sistema",
  },
  {
    label: "Automação & Integrações",
    href: "/integracoes",
    icon: "plug",
    permissions: ["manage_integrations"],
    group: "Sistema",
  },
  {
    label: "Auditoria & Logs",
    href: "/auditoria",
    icon: "list",
    permissions: ["view_audit"],
    group: "Sistema",
  },
];

export function getNavItemsForRole(role: Role): NavItemDef[] {
  return navItems.filter((item) =>
    item.permissions.some((p) => hasPermission(role, p))
  );
}

export const roleColor: Record<
  Role,
  "green" | "blue" | "purple" | "amber" | "slate"
> = {
  admin_premium: "green",
  admin_unidade: "blue",
  gestor_conteudo: "purple",
  instrutor: "amber",
  aluno: "slate",
};

/** Filtra registros pelo escopo de unidade do usuário autenticado */
export function scopeByUnit<T extends { unitId?: string }>(
  items: T[],
  role: Role,
  unitId?: string
): T[] {
  if (hasPermission(role, "view_all_units")) return items;
  if (!unitId) return items;
  return items.filter((item) => !item.unitId || item.unitId === unitId);
}
