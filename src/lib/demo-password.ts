import { timingSafeEqual } from "crypto";

/** Senha compartilhada das contas demo (override via DEMO_LOGIN_PASSWORD). */
export const DEFAULT_DEMO_PASSWORD = "demo1234";

export function getExpectedDemoPassword(): string {
  return process.env.DEMO_LOGIN_PASSWORD?.trim() || DEFAULT_DEMO_PASSWORD;
}

export function isValidDemoPassword(password: string | undefined | null): boolean {
  if (password == null || password === "") return false;
  const expected = getExpectedDemoPassword();
  const a = Buffer.from(password, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
