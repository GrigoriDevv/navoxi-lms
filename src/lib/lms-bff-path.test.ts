import { describe, expect, it } from "vitest";
import { bffSessionGateError, isAllowedLmsPath } from "@/lib/lms-bff-path";

describe("isAllowedLmsPath", () => {
  it("allows allowlisted prefixes", () => {
    expect(isAllowedLmsPath(["courses"])).toBe(true);
    expect(isAllowedLmsPath(["courses", "c1", "lessons"])).toBe(true);
    expect(isAllowedLmsPath(["enrollments"])).toBe(true);
    expect(isAllowedLmsPath(["enrollment-requests", "id", "decision"])).toBe(true);
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
