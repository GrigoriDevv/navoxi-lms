import assert from "node:assert/strict";
import test from "node:test";

/**
 * Mirrors BFF catch gate in src/app/api/auth/login/route.ts:
 * 429 from upstream must return 429 (no demo fallback / no 401).
 */
function resolveLoginBffStatus(upstreamStatus, demoLoginAllowed) {
  if (upstreamStatus === 429) return 429;
  if (!demoLoginAllowed) return 401;
  return "demo-fallback";
}

test("BFF: upstream 429 → 429 (demo off)", () => {
  assert.equal(resolveLoginBffStatus(429, false), 429);
});

test("BFF: upstream 429 → 429 (demo on, still no fallback)", () => {
  assert.equal(resolveLoginBffStatus(429, true), 429);
});

test("BFF: upstream 401 + demo off → 401", () => {
  assert.equal(resolveLoginBffStatus(401, false), 401);
});

test("BFF: upstream 401 + demo on → demo fallback", () => {
  assert.equal(resolveLoginBffStatus(401, true), "demo-fallback");
});
