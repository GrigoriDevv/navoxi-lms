import type { Question, Evaluation } from "./types";

export const questionTypeLabels: Record<Question["type"], string> = {
  multipla: "Múltipla escolha",
  verdadeiro: "Verdadeiro/Falso",
  dissertativa: "Dissertativa",
};

export const evaluationStatusLabels: Record<Evaluation["status"], string> = {
  rascunho: "Rascunho",
  publicada: "Publicada",
  encerrada: "Encerrada",
  aplicada: "Aplicada",
};

export const contentUsageLabels = {
  curso: "Cursos",
  biblioteca: "Biblioteca",
  avaliacao: "Avaliações",
  comunicacao: "Comunicação",
} as const;
