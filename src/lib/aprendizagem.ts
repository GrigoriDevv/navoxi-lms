import type { Course } from "./types";

export const modalityLabels: Record<Course["modality"], string> = {
  online: "EAD / Online",
  presencial: "Presencial",
  hibrido: "Híbrido",
};

export const modalityColors: Record<Course["modality"], string> = {
  online: "#2563eb",
  presencial: "#d97706",
  hibrido: "#7c3aed",
};

export const courseStatusLabels = {
  publicado: "Publicado",
  rascunho: "Rascunho",
  arquivado: "Arquivado",
} as const;

export const turmaStatusLabels = {
  agendada: "Agendada",
  em_andamento: "Em andamento",
  concluida: "Concluída",
} as const;

export const inscricaoStatusLabels = {
  ativa: "Em andamento",
  concluida: "Concluída",
  cancelada: "Cancelada",
} as const;

export const solicitacaoStatusLabels = {
  pendente: "Pendente",
  aprovada: "Aprovada",
  rejeitada: "Rejeitada",
  cancelada: "Cancelada",
} as const;
