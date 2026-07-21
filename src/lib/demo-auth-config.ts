/**
 * Mock login com senha compartilhada.
 * Em NODE_ENV=production fica sempre off (flags ignoradas).
 * Em local/dev: on por padrão; desliga com ALLOW_DEMO_LOGIN=false.
 */
export function resolveDemoLoginAllowed(
  nodeEnv: string | undefined,
  allowDemoLogin: string | undefined,
  authDemoEnabled: string | undefined
): boolean {
  if (nodeEnv === "production") {
    return false;
  }
  const flag = allowDemoLogin ?? authDemoEnabled;
  return flag !== "false";
}

export function isDemoLoginAllowed(): boolean {
  return resolveDemoLoginAllowed(
    process.env.NODE_ENV,
    process.env.ALLOW_DEMO_LOGIN,
    process.env.AUTH_DEMO_ENABLED
  );
}

/** @deprecated Use isDemoLoginAllowed() — alias para AUTH_DEMO_ENABLED legado */
export function isDemoAuthEnabled(): boolean {
  return isDemoLoginAllowed();
}
