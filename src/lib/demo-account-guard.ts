import { isDemoLoginAllowed } from "@/lib/demo-auth-config";
import { isDemoSeedEmail } from "@/lib/demo-seed-emails";

export function isDemoAccountLoginBlocked(email: string): boolean {
  return !isDemoLoginAllowed() && isDemoSeedEmail(email);
}
