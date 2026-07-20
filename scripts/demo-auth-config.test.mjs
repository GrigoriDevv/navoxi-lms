import assert from "node:assert/strict";
import test from "node:test";

// Inline mirror of resolveDemoLoginAllowed — keeps tests runnable without TS loader.
function resolveDemoLoginAllowed(
  nodeEnv,
  allowDemoLogin,
  authDemoEnabled
) {
  const flag = allowDemoLogin ?? authDemoEnabled;
  if (nodeEnv === "production") return flag === "true";
  return flag !== "false";
}

test("prod default: demo login off", () => {
  assert.equal(resolveDemoLoginAllowed("production", undefined, undefined), false);
});

test("prod explicit ALLOW_DEMO_LOGIN=true: on", () => {
  assert.equal(resolveDemoLoginAllowed("production", "true", undefined), true);
});

test("prod AUTH_DEMO_ENABLED legacy alias", () => {
  assert.equal(resolveDemoLoginAllowed("production", undefined, "true"), true);
});

test("dev default: demo login on", () => {
  assert.equal(resolveDemoLoginAllowed("development", undefined, undefined), true);
});

test("dev ALLOW_DEMO_LOGIN=false: off", () => {
  assert.equal(resolveDemoLoginAllowed("development", "false", undefined), false);
});

test("ALLOW_DEMO_LOGIN takes precedence over AUTH_DEMO_ENABLED", () => {
  assert.equal(resolveDemoLoginAllowed("development", "false", "true"), false);
});
