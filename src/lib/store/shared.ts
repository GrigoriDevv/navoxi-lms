export const STORAGE_USER = "navoxi-user";
export const STORAGE_PREFS = "navoxi-prefs";
export const STORAGE_LESSON_PROGRESS = "navoxi-lesson-progress";
export const LEGACY_STORAGE_USER = "neo-lms-user";
export const LEGACY_STORAGE_PREFS = "neo-lms-prefs";

export const avatarColors = [
  "#2563eb",
  "#1d4ed8",
  "#3b82f6",
  "#0ea5e9",
  "#6366f1",
  "#0891b2",
];

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase().replace("@neoenergia.com", "@navoxi.com");
}

export function now(): string {
  return new Date().toLocaleString("pt-BR", { hour12: false }).replace(",", "");
}
