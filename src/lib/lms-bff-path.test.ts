import { describe, expect, it } from "vitest";
import { bffSessionGateError, isAllowedLmsPath } from "@/lib/lms-bff-path";

describe("isAllowedLmsPath", () => {
  it("allows allowlisted prefixes", () => {
    expect(isAllowedLmsPath(["courses"])).toBe(true);
    expect(isAllowedLmsPath(["courses", "c1", "lessons"])).toBe(true);
    expect(isAllowedLmsPath(["enrollments"])).toBe(true);
    expect(isAllowedLmsPath(["enrollment-requests", "id", "decision"])).toBe(true);
    expect(isAllowedLmsPath(["questions"])).toBe(true);
    expect(isAllowedLmsPath(["questions", "q1"])).toBe(true);
    expect(isAllowedLmsPath(["evaluations"])).toBe(true);
    expect(isAllowedLmsPath(["evaluations", "av1", "apply"])).toBe(true);
    expect(isAllowedLmsPath(["evaluations", "av1", "attempts"])).toBe(true);
    expect(isAllowedLmsPath(["attempts"])).toBe(true);
    expect(isAllowedLmsPath(["attempts", "a1", "submit"])).toBe(true);
    expect(isAllowedLmsPath(["posts"])).toBe(true);
    expect(isAllowedLmsPath(["posts", "p1"])).toBe(true);
    expect(isAllowedLmsPath(["destaques"])).toBe(true);
    expect(isAllowedLmsPath(["destaques", "d1"])).toBe(true);
    expect(isAllowedLmsPath(["permissions"])).toBe(true);
    expect(isAllowedLmsPath(["permissions", "p1"])).toBe(true);
    expect(isAllowedLmsPath(["scheduled-jobs"])).toBe(true);
    expect(isAllowedLmsPath(["scheduled-jobs", "sj1"])).toBe(true);
    expect(isAllowedLmsPath(["media", "videos"])).toBe(true);
  });

  it("rejects empty, unknown, and traversal", () => {
    expect(isAllowedLmsPath([])).toBe(false);
    expect(isAllowedLmsPath(["admin"])).toBe(false);
    expect(isAllowedLmsPath(["courses", "..", "secret"])).toBe(false);
    expect(isAllowedLmsPath(["courses\\evil"])).toBe(false);
  });
});

describe("bffSessionGateError", () => {
  it("flags missing cookie / invalid / missing JWT", () => {
    expect(bffSessionGateError(undefined)).toBe("unauthenticated");
    expect(bffSessionGateError(null)).toBe("invalid");
    expect(bffSessionGateError({})).toBe("missing_access_token");
    expect(bffSessionGateError({ accessToken: "jwt" })).toBe(null);
  });
});
