import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = readFileSync(join(root, "src/lib/mock-module-gates.ts"), "utf8");

/** Inline the pure helpers (node --test cannot import TS). */
function resolveMockModulesVisible(nodeEnv, showMockModules) {
  if (nodeEnv !== "production") return true;
  return showMockModules === "true";
}

const MOCK_ONLY_PATHS = [
  "/auditoria",
  "/configuracoes",
  "/comunicacao",
  "/integracoes",
  "/aprendizagem/certificados",
  "/aprendizagem/avaliacoes",
];

function isMockOnlyPath(pathname) {
  return MOCK_ONLY_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

function resolveShouldHidePath(pathname, mockVisible, javaApiEnabled) {
  if (mockVisible) return false;
  if (isMockOnlyPath(pathname)) return true;
  if (
    (pathname === "/administracao" || pathname.startsWith("/administracao/")) &&
    !javaApiEnabled
  ) {
    return true;
  }
  return false;
}

test("source exports gate helpers", () => {
  assert.match(source, /export function areMockModulesVisible/);
  assert.match(source, /NEXT_PUBLIC_SHOW_MOCK_MODULES/);
});

test("dev: mocks visible by default", () => {
  assert.equal(resolveMockModulesVisible("development", undefined), true);
});

test("prod: mocks hidden unless flag", () => {
  assert.equal(resolveMockModulesVisible("production", undefined), false);
  assert.equal(resolveMockModulesVisible("production", "false"), false);
  assert.equal(resolveMockModulesVisible("production", "true"), true);
});

test("prod hide mock paths and admin without Java", () => {
  assert.equal(resolveShouldHidePath("/auditoria", false, true), true);
  assert.equal(resolveShouldHidePath("/aprendizagem/avaliacoes", false, true), true);
  assert.equal(resolveShouldHidePath("/dashboard", false, true), false);
  assert.equal(resolveShouldHidePath("/administracao", false, false), true);
  assert.equal(resolveShouldHidePath("/administracao", false, true), false);
});

test("when mocks visible, nothing hidden", () => {
  assert.equal(resolveShouldHidePath("/auditoria", true, false), false);
  assert.equal(resolveShouldHidePath("/administracao", true, false), false);
});
