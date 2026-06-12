import type { Settings } from "./types";

export const moduleDefinitions: {
  key: keyof Settings["modules"];
  label: string;
  description: string;
}[] = [
  { key: "aprendizagem", label: "Aprendizagem", description: "Cursos, turmas, trilhas, calendário e certificados" },
  { key: "repositorio", label: "Repositório", description: "Conteúdos, questões e biblioteca de materiais" },
  { key: "comunicacao", label: "Comunicação", description: "Destaques, notificações, posts e campanhas" },
  { key: "relatorios", label: "Relatórios", description: "Analytics e indicadores de acompanhamento" },
  { key: "administracao", label: "Administração", description: "Usuários, identidade e gestão de acesso" },
  { key: "sistema", label: "Sistema", description: "Configurações, integrações e auditoria" },
];

export type NavModuleKey = keyof Settings["modules"] | "geral";

export function groupToModule(group: string): NavModuleKey {
  if (group === "Geral") return "geral";
  if (group === "Aprendizagem") return "aprendizagem";
  if (group === "Conteúdo") return "repositorio"; // comunicacao items handled per-item
  if (group === "Inteligência") return "relatorios";
  if (group === "Administração") return "administracao";
  if (group === "Sistema") return "sistema";
  return "geral";
}

export function applyBrandColor(hex: string) {
  if (typeof document === "undefined") return;
  document.documentElement.style.setProperty("--brand", hex);
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const dark = `#${[r, g, b].map((c) => Math.max(0, Math.floor(c * 0.75)).toString(16).padStart(2, "0")).join("")}`;
  document.documentElement.style.setProperty("--brand-dark", dark);
}
