#!/usr/bin/env node
/**
 * CI gate: LMS_API_TOKEN must never be exposed via NEXT_PUBLIC_* or client code.
 * Exit 0 = ok; exit 1 = violations found.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  "target",
  "dist",
  "coverage",
  ".cursor",
  "agent-transcripts",
]);

const NEXT_PUBLIC_TOKEN_RE =
  /NEXT_PUBLIC_[A-Z0-9_]*LMS_API_TOKEN|NEXT_PUBLIC_LMS_API_TOKEN/i;

const PROCESS_ENV_TOKEN_RE =
  /process\.env\.LMS_API_TOKEN|process\.env\[\s*['"]LMS_API_TOKEN['"]\s*\]/;

/** Paths (posix-relative from repo root) allowed to read LMS_API_TOKEN. */
function isAllowedServerPath(relPosix) {
  if (relPosix.endsWith(".server.ts") || relPosix.endsWith(".server.js")) {
    return true;
  }
  if (relPosix.startsWith("src/app/api/")) {
    return true;
  }
  if (relPosix === "src/lib/lms-auth-api.ts") {
    return true;
  }
  return false;
}

function shouldScanFile(relPosix) {
  if (!/\.(ts|tsx|js|jsx|mjs|cjs|json|yml|yaml|md|env|example|toml)$/i.test(relPosix)) {
    // also plain .env*
    if (!/(^|\/)\.env/.test(relPosix)) return false;
  }
  // Skip this script and plan dumps
  if (relPosix.includes("check-lms-api-token-server-only")) return false;
  return true;
}

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) {
      walk(full, out);
    } else if (st.isFile()) {
      out.push(full);
    }
  }
  return out;
}

const violations = [];

for (const full of walk(ROOT)) {
  const rel = path.relative(ROOT, full);
  const relPosix = rel.split(path.sep).join("/");
  if (!shouldScanFile(relPosix)) continue;

  let text;
  try {
    text = fs.readFileSync(full, "utf8");
  } catch {
    continue;
  }

  if (NEXT_PUBLIC_TOKEN_RE.test(text)) {
    violations.push(`${relPosix}: NEXT_PUBLIC_*LMS_API_TOKEN is forbidden`);
  }

  if (PROCESS_ENV_TOKEN_RE.test(text) && !isAllowedServerPath(relPosix)) {
    violations.push(
      `${relPosix}: process.env.LMS_API_TOKEN only allowed in server modules (*.server.ts, src/app/api/**, lms-auth-api.ts)`
    );
  }
}

if (violations.length > 0) {
  console.error("LMS_API_TOKEN server-only check failed:\n");
  for (const v of violations) {
    console.error(`  - ${v}`);
  }
  console.error(
    "\nUse src/lib/api-config.server.ts (import \"server-only\") — never NEXT_PUBLIC_LMS_API_TOKEN."
  );
  process.exit(1);
}

console.log("OK: LMS_API_TOKEN is not exposed via NEXT_PUBLIC_* / client code");
