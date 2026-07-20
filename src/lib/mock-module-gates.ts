import { isJavaApiEnabled } from "@/lib/api-config";

/**
 * Rotas com UI/dados mock (seed/localStorage) — não vender como prontas em produção.
 * Escape hatch: NEXT_PUBLIC_SHOW_MOCK_MODULES=true (demo/staging).
 */
export const MOCK_ONLY_PATHS = [
  "/auditoria",
  "/configuracoes",
  "/comunicacao",
  "/integracoes",
  "/aprendizagem/certificados",
  "/aprendizagem/avaliacoes",
] as const;

const ADMIN_PATH = "/administracao";

export function resolveMockModulesVisible(
  nodeEnv: string | undefined,
  showMockModules: string | undefined
): boolean {
  if (nodeEnv !== "production") return true;
  return showMockModules === "true";
}

export function areMockModulesVisible(): boolean {
  return resolveMockModulesVisible(
    process.env.NODE_ENV,
    process.env.NEXT_PUBLIC_SHOW_MOCK_MODULES
  );
}

export function isMockOnlyPath(pathname: string): boolean {
  return MOCK_ONLY_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

function isAdminPath(pathname: string): boolean {
  return pathname === ADMIN_PATH || pathname.startsWith(`${ADMIN_PATH}/`);
}

export function resolveShouldHidePath(
  pathname: string,
  mockVisible: boolean,
  javaApiEnabled: boolean
): boolean {
  if (mockVisible) return false;
  if (isMockOnlyPath(pathname)) return true;
  if (isAdminPath(pathname) && !javaApiEnabled) return true;
  return false;
}

/** True when the path must be blocked (nav + deep link) in this environment. */
export function shouldHidePath(pathname: string): boolean {
  return resolveShouldHidePath(
    pathname,
    areMockModulesVisible(),
    isJavaApiEnabled()
  );
}
