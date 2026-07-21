import assert from "node:assert/strict";
import test from "node:test";

// Inline mirror of isWeakLmsApiToken — keeps tests runnable without TS loader.
const WEAK_API_TOKENS = new Set([
  "local-dev-token",
  "changeme",
  "change-me",
  "secret",
  "password",
  "token",
  "apikey",
  "api-token",
]);

function isWeakLmsApiToken(token) {
  if (!token || !String(token).trim()) return true;
  const normalized = String(token).trim().toLowerCase();
  if (WEAK_API_TOKENS.has(normalized) || normalized.startsWith("local-dev")) return true;
  return String(token).trim().length < 24;
}

test("weak: missing / empty / local-dev-token", () => {
  assert.equal(isWeakLmsApiToken(undefined), true);
  assert.equal(isWeakLmsApiToken(""), true);
  assert.equal(isWeakLmsApiToken("local-dev-token"), true);
  assert.equal(isWeakLmsApiToken("short"), true);
});

test("strong token accepted", () => {
  assert.equal(isWeakLmsApiToken("a-strong-deploy-token-value-ok"), false);
});
