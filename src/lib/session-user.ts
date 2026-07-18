import { users } from "./mock-data";
import type { Role } from "./types";

export function resolveUserProfile(email: string, nameHint?: string) {
  const normalized = email.trim().toLowerCase();
  const existing = users.find((u) => u.email.toLowerCase() === normalized);
  return {
    email: normalized,
    name: nameHint?.trim() || existing?.name || normalized.split("@")[0] || "Usuário",
    role: (existing?.role ?? "aluno") as Role,
  };
}
