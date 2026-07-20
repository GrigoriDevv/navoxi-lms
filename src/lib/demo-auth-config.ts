export function isDemoAuthEnabled(): boolean {
  if (process.env.NODE_ENV === "production") {
    return process.env.AUTH_DEMO_ENABLED === "true";
  }
  return process.env.AUTH_DEMO_ENABLED !== "false";
}
