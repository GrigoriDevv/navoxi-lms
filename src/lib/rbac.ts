import type { Role, Settings } from "./types";

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
  matriz: "Navoxi · Matriz",
  nordeste: "Navoxi · Nordeste",
  sul: "Navoxi · Sul",
  centro: "Navoxi · Centro-Oeste",
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
  | "manage_own_session"
  | "publish_lessons"
  | "review_enrollments";

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
    "review_enrollments",
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
    "review_enrollments",
  ],
  gestor_conteudo: [
    "manage_content",
    "manage_courses",
    "consume_learning",
    "manage_own_session",
    "review_enrollments",
  ],
  instrutor: ["manage_courses", "manage_turmas", "consume_learning", "manage_own_session", "publish_lessons"],
  aluno: ["consume_learning", "manage_own_session"],
};

export function hasPermission(role: Role, permission: PermissionKey): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

/** Rotas acessíveis por perfil */
const routeAccess: Record<string, PermissionKey[]> = {
  "/dashboard": ["consume_learning"],
  "/notificacoes": ["manage_own_session"],
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
  "/aprendizagem/solicitacoes": [
    "review_enrollments",
    "manage_turmas",
    "manage_users_all",
    "manage_users_unit",
  ],
  "/aprendizagem/calendario": ["manage_courses", "consume_learning"],
  "/aprendizagem/publicar-aulas": ["publish_lessons"],
  "/repositorio": ["manage_content"],
  "/repositorio/questoes": ["manage_content"],
  "/comunicacao": ["send_communications"],
  "/relatorios": ["view_reports_all", "view_reports_unit"],
  "/configuracoes": ["manage_global_settings"],
  "/integracoes": ["manage_integrations"],
  "/auditoria": ["view_audit"],
};

export function canAccessRoute(role: Role, pathname: string): boolean {
  // Match longest prefix first (fail-closed for unknown routes)
  const route = Object.keys(routeAccess)
    .filter((r) => pathname === r || pathname.startsWith(r + "/"))
    .sort((a, b) => b.length - a.length)[0];
  if (!route) return false;
  const required = routeAccess[route];
  return required.some((p) => hasPermission(role, p));
}

/** Export for middleware — same map as client RouteGuard */
export function requiredPermissionsForPath(pathname: string): PermissionKey[] | null {
  const route = Object.keys(routeAccess)
    .filter((r) => pathname === r || pathname.startsWith(r + "/"))
    .sort((a, b) => b.length - a.length)[0];
  return route ? routeAccess[route] : null;
}

export interface NavItemDef {
  label: string;
  href: string;
  icon: string;
  permissions: PermissionKey[];
  group: string;
  module?: keyof Settings["modules"];
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
    module: "administracao",
  },
  {
    label: "Administração",
    href: "/administracao",
    icon: "users",
    permissions: ["manage_users_all", "manage_users_unit"],
    group: "Administração",
    module: "administracao",
  },
  {
    label: "Catálogo",
    href: "/aprendizagem/catalogo",
    icon: "grid",
    permissions: ["consume_learning"],
    group: "Aprendizagem",
    module: "aprendizagem",
  },
  {
    label: "Cursos",
    href: "/aprendizagem/cursos",
    icon: "book",
    permissions: ["manage_courses"],
    group: "Aprendizagem",
    module: "aprendizagem",
  },
  {
    label: "Turmas",
    href: "/aprendizagem/turmas",
    icon: "group",
    permissions: ["manage_turmas"],
    group: "Aprendizagem",
    module: "aprendizagem",
  },
  {
    label: "Publicar aulas",
    href: "/aprendizagem/publicar-aulas",
    icon: "video",
    permissions: ["publish_lessons"],
    group: "Aprendizagem",
    module: "aprendizagem",
  },
  {
    label: "Trilhas",
    href: "/aprendizagem/trilhas",
    icon: "route",
    permissions: ["manage_courses", "consume_learning"],
    group: "Aprendizagem",
    module: "aprendizagem",
  },
  {
    label: "Calendário",
    href: "/aprendizagem/calendario",
    icon: "calendar",
    permissions: ["consume_learning"],
    group: "Aprendizagem",
    module: "aprendizagem",
  },
  {
    label: "Biblioteca",
    href: "/aprendizagem/biblioteca",
    icon: "folder",
    permissions: ["consume_learning", "manage_content"],
    group: "Aprendizagem",
    module: "aprendizagem",
  },
  {
    label: "Salas",
    href: "/aprendizagem/salas",
    icon: "plug",
    permissions: ["manage_turmas", "manage_courses"],
    group: "Aprendizagem",
    module: "aprendizagem",
  },
  {
    label: "Certificados",
    href: "/aprendizagem/certificados",
    icon: "check",
    permissions: ["consume_learning", "manage_courses", "manage_turmas"],
    group: "Aprendizagem",
    module: "aprendizagem",
  },
  {
    label: "Interesses",
    href: "/aprendizagem/interesses",
    icon: "trend",
    permissions: ["manage_courses", "manage_turmas", "consume_learning"],
    group: "Aprendizagem",
    module: "aprendizagem",
  },
  {
    label: "Solicitações",
    href: "/aprendizagem/solicitacoes",
    icon: "mail",
    permissions: ["review_enrollments", "manage_turmas", "manage_users_all", "manage_users_unit"],
    group: "Aprendizagem",
    module: "aprendizagem",
  },
  {
    label: "Questões",
    href: "/repositorio/questoes",
    icon: "list",
    permissions: ["manage_content"],
    group: "Conteúdo",
    module: "repositorio",
  },
  {
    label: "Avaliações",
    href: "/aprendizagem/avaliacoes",
    icon: "check",
    permissions: ["manage_courses", "manage_turmas"],
    group: "Aprendizagem",
    module: "aprendizagem",
  },
  {
    label: "Repositório",
    href: "/repositorio",
    icon: "folder",
    permissions: ["manage_content"],
    group: "Conteúdo",
    module: "repositorio",
  },
  {
    label: "Comunicação",
    href: "/comunicacao",
    icon: "mail",
    permissions: ["send_communications"],
    group: "Conteúdo",
    module: "comunicacao",
  },
  {
    label: "Relatórios & Analytics",
    href: "/relatorios",
    icon: "chart",
    permissions: ["view_reports_all", "view_reports_unit"],
    group: "Inteligência",
    module: "relatorios",
  },
  {
    label: "Configurações",
    href: "/configuracoes",
    icon: "cog",
    permissions: ["manage_global_settings"],
    group: "Sistema",
    module: "sistema",
  },
  {
    label: "Automação & Integrações",
    href: "/integracoes",
    icon: "plug",
    permissions: ["manage_integrations"],
    group: "Sistema",
    module: "sistema",
  },
  {
    label: "Auditoria & Logs",
    href: "/auditoria",
    icon: "list",
    permissions: ["view_audit"],
    group: "Sistema",
    module: "sistema",
  },
];

export function getNavItemsForRole(
  role: Role,
  modules?: Settings["modules"]
): NavItemDef[] {
  return navItems.filter((item) => {
    if (!item.permissions.some((p) => hasPermission(role, p))) return false;
    if (item.module && modules && !modules[item.module]) return false;
    return true;
  });
}

export const roleColor: Record<
  Role,
  "green" | "blue" | "purple" | "amber" | "slate"
> = {
  admin_premium: "blue",
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
