import { describe, expect, it } from "vitest";
import { lmsKeys } from "./query-keys";

describe("lmsKeys", () => {
  it("keeps stable root and resource segments", () => {
    expect(lmsKeys.all).toEqual(["lms"]);
    expect(lmsKeys.courses()).toEqual(["lms", "courses"]);
    expect(lmsKeys.modules()).toEqual(["lms", "modules"]);
    expect(lmsKeys.lessons()).toEqual(["lms", "lessons"]);
    expect(lmsKeys.enrollmentRequests()).toEqual([
      "lms",
      "enrollment-requests",
    ]);
  });

  it("scopes enrollments and progress by userId", () => {
    expect(lmsKeys.enrollments("u1")).toEqual(["lms", "enrollments", "u1"]);
    expect(lmsKeys.enrollments("u2")).toEqual(["lms", "enrollments", "u2"]);
    expect(lmsKeys.progress("u1")).toEqual(["lms", "progress", "u1"]);
    expect(lmsKeys.enrollments("u1")).not.toEqual(lmsKeys.enrollments("u2"));
  });
});
