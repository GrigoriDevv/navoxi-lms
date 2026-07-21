import assert from "node:assert/strict";
import test from "node:test";

// Inline mirror of resolveDemoLoginAllowed — keeps tests runnable without TS loader.
function resolveDemoLoginAllowed(nodeEnv, allowDemoLogin, authDemoEnabled) {
  if (nodeEnv === "production") return false;
  const flag = allowDemoLogin ?? authDemoEnabled;
  return flag !== "false";
}

const DEMO_SEED = new Set([
  "ana.souza@navoxi.com",
  "bruno.ferreira@navoxi.com",
  "carla.mendes@navoxi.com",
  "henrique.castro@navoxi.com",
  "diego.alves@navoxi.com",
  "felipe.rocha@navoxi.com",
]);

function isDemoSeedEmail(email) {
  return DEMO_SEED.has(String(email).trim().toLowerCase());
}

function resolveDemoAccountLoginBlocked(email, nodeEnv, demoLoginAllowed) {
  if (!isDemoSeedEmail(email)) return false;
  if (nodeEnv === "production") return true;
  return !demoLoginAllowed;
}

test("prod default: demo login off", () => {
  assert.equal(resolveDemoLoginAllowed("production", undefined, undefined), false);
});

test("prod hard-disable: ALLOW_DEMO_LOGIN=true ignored", () => {
  assert.equal(resolveDemoLoginAllowed("production", "true", undefined), false);
});

test("prod hard-disable: AUTH_DEMO_ENABLED=true ignored", () => {
  assert.equal(resolveDemoLoginAllowed("production", undefined, "true"), false);
});

test("dev default: demo login on", () => {
  assert.equal(resolveDemoLoginAllowed("development", undefined, undefined), true);
});

test("dev ALLOW_DEMO_LOGIN=false: off", () => {
  assert.equal(resolveDemoLoginAllowed("development", "false", undefined), false);
});

test("ALLOW_DEMO_LOGIN takes precedence over AUTH_DEMO_ENABLED in non-prod", () => {
  assert.equal(resolveDemoLoginAllowed("development", "false", "true"), false);
});

test("prod always blocks seed email password login", () => {
  assert.equal(
    resolveDemoAccountLoginBlocked("ana.souza@navoxi.com", "production", true),
    true
  );
});

test("dev allows seed email when demo login on", () => {
  assert.equal(
    resolveDemoAccountLoginBlocked("diego.alves@navoxi.com", "development", true),
    false
  );
});

test("dev blocks seed email when demo login off", () => {
  assert.equal(
    resolveDemoAccountLoginBlocked("diego.alves@navoxi.com", "development", false),
    true
  );
});

test("non-seed email never blocked by demo account guard", () => {
  assert.equal(
    resolveDemoAccountLoginBlocked("real.user@navoxi.com", "production", false),
    false
  );
});
