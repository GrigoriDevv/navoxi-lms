import type { PermissionKey } from "./rbac";

export interface QuickShortcut {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: string;
  color: string;
  permissions: PermissionKey[];
}

export interface QuickActionDef {
  id: string;
  label: string;
  icon: string;
  permissions: PermissionKey[];
  action: "create_turma" | "create_user" | "publish_post";
}

export const quickShortcuts: QuickShortcut[] = [
  {
    id: "cursos",
    label: "Cursos",
    description: "Gestão e listagem de cursos",
    href: "/aprendizagem/cursos",
    icon: "book",
    color: "#2563eb",
    permissions: ["manage_courses"],
  },
  {
    id: "turmas",
    label: "Turmas",
    description: "Gestão e listagem de turmas",
    href: "/aprendizagem/turmas",
    icon: "group",
    color: "#2563eb",
    permissions: ["manage_turmas"],
  },
  {
    id: "catalogo",
    label: "Catálogo",
    description: "Catálogo de cursos disponíveis",
    href: "/aprendizagem/catalogo",
    icon: "grid",
    color: "#0891b2",
    permissions: ["consume_learning"],
  },
  {
    id: "usuarios",
    label: "Usuários",
    description: "Gestão e listagem de usuários",
    href: "/administracao",
    icon: "users",
    color: "#7c3aed",
    permissions: ["manage_users_all", "manage_users_unit"],
  },
  {
    id: "relatorios",
    label: "Relatórios",
    description: "Analytics e indicadores",
    href: "/relatorios",
    icon: "chart",
    color: "#d97706",
    permissions: ["view_reports_all", "view_reports_unit"],
  },
  {
    id: "questoes",
    label: "Questões",
    description: "Repositório de questões",
    href: "/repositorio/questoes",
    icon: "list",
    color: "#db2777",
    permissions: ["manage_content"],
  },
  {
    id: "avaliacoes",
    label: "Avaliações",
    description: "Gestão de avaliações",
    href: "/aprendizagem/avaliacoes",
    icon: "check",
    color: "#dc2626",
    permissions: ["manage_courses", "manage_turmas"],
  },
  {
    id: "publicar-aulas",
    label: "Publicar aulas",
    description: "Publicar vídeos-aula nos seus cursos",
    href: "/aprendizagem/publicar-aulas",
    icon: "video",
    color: "#d97706",
    permissions: ["publish_lessons"],
  },
  {
    id: "trilhas",
    label: "Trilhas",
    description: "Trilhas de aprendizagem",
    href: "/aprendizagem/trilhas",
    icon: "route",
    color: "#1e3a8a",
    permissions: ["manage_courses", "consume_learning"],
  },
];

export const quickActions: QuickActionDef[] = [
  {
    id: "create_turma",
    label: "Criar turma",
    icon: "plus",
    permissions: ["manage_turmas"],
    action: "create_turma",
  },
  {
    id: "create_user",
    label: "Criar usuário",
    icon: "users",
    permissions: ["manage_users_all", "manage_users_unit"],
    action: "create_user",
  },
  {
    id: "publish_post",
    label: "Publicar post",
    icon: "mail",
    permissions: ["send_communications"],
    action: "publish_post",
  },
];

export function getShortcutsForPermissions(
  can: (p: PermissionKey) => boolean
): QuickShortcut[] {
  return quickShortcuts.filter((s) =>
    s.permissions.some((p) => can(p))
  );
}

export function getActionsForPermissions(
  can: (p: PermissionKey) => boolean
): QuickActionDef[] {
  return quickActions.filter((a) =>
    a.permissions.some((p) => can(p))
  );
}
