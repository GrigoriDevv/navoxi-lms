import { isDemoLoginAllowed } from "@/lib/demo-auth-config";
import { isDemoSeedEmail } from "@/lib/demo-seed-emails";

/**
 * Contas seed nunca autenticam por senha em produção.
 * Em local/dev, só bloqueia se o mock demo estiver desligado.
 */
export function resolveDemoAccountLoginBlocked(
  email: string,
  nodeEnv: string | undefined,
  demoLoginAllowed: boolean
): boolean {
  if (!isDemoSeedEmail(email)) return false;
  if (nodeEnv === "production") return true;
  return !demoLoginAllowed;
}

export function isDemoAccountLoginBlocked(email: string): boolean {
  return resolveDemoAccountLoginBlocked(
    email,
    process.env.NODE_ENV,
    isDemoLoginAllowed()
  );
}
