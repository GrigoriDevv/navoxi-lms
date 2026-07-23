/** E-mails das contas seed (DataSeeder / mock-data) — somente demo/local. */
export const DEMO_SEED_EMAILS = [
  "ana.souza@navoxi.com",
  "bruno.ferreira@navoxi.com",
  "carla.mendes@navoxi.com",
  "diego.alves@navoxi.com",
  "eduarda.lima@navoxi.com",
  "felipe.rocha@navoxi.com",
  "gabriela.nunes@navoxi.com",
  "henrique.castro@navoxi.com",
] as const;

const DEMO_SEED_EMAIL_SET = new Set<string>(
  DEMO_SEED_EMAILS.map((e) => e.toLowerCase())
);

export function normalizeDemoEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isDemoSeedEmail(email: string): boolean {
  return DEMO_SEED_EMAIL_SET.has(normalizeDemoEmail(email));
}
