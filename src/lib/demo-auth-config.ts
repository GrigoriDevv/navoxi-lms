/** Mock login com senha compartilhada — off em prod salvo ALLOW_DEMO_LOGIN=true */
export function resolveDemoLoginAllowed(
  nodeEnv: string | undefined,
  allowDemoLogin: string | undefined,
  authDemoEnabled: string | undefined
): boolean {
  const flag = allowDemoLogin ?? authDemoEnabled;
  if (nodeEnv === "production") {
    return flag === "true";
  }
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
