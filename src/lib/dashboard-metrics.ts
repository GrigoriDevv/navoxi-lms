import type { Course, Turma, UnitId, User } from "./types";
import { dailyAccesses } from "./mock-data";

export interface DashboardFilters {
  unitId: UnitId | "all";
  category: string;
  modality: string;
  courseId: string;
  audience: string;
  dateFrom: string;
  dateTo: string;
}

export const defaultDashboardFilters = (unitId?: UnitId): DashboardFilters => ({
  unitId: unitId ?? "all",
  category: "all",
  modality: "all",
  courseId: "all",
  audience: "all",
  dateFrom: "2026-05-01",
  dateTo: "2026-06-12",
});

export function formatDateTime(d: Date): string {
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function inDateRange(date: string, from: string, to: string): boolean {
  return date >= from && date <= to;
}

export function filterCourses(courses: Course[], f: DashboardFilters): Course[] {
  return courses.filter((c) => {
    if (f.unitId !== "all" && c.unitId !== f.unitId) return false;
    if (f.category !== "all" && c.category !== f.category) return false;
    if (f.modality !== "all" && c.modality !== f.modality) return false;
    if (f.courseId !== "all" && c.id !== f.courseId) return false;
    if (f.audience !== "all" && c.audience !== f.audience) return false;
    return true;
  });
}

export function filterTurmas(turmas: Turma[], f: DashboardFilters, courseIds: Set<string>): Turma[] {
  return turmas.filter((t) => {
    if (!courseIds.has(t.courseId)) return false;
    if (f.unitId !== "all" && t.unitId !== f.unitId) return false;
    return inDateRange(t.startDate, f.dateFrom, f.dateTo) ||
      inDateRange(t.endDate, f.dateFrom, f.dateTo) ||
      (t.startDate <= f.dateFrom && t.endDate >= f.dateTo);
  });
}

export function filterUsers(users: User[], f: DashboardFilters): User[] {
  return users.filter((u) => {
    if (f.unitId !== "all" && u.unitId !== f.unitId) return false;
    return true;
  });
}

export function filterAccesses(f: DashboardFilters) {
  return dailyAccesses.filter((a) => inDateRange(a.date, f.dateFrom, f.dateTo));
}

export interface DashboardMetrics {
  activeEnrollments: number;
  totalEnrollments: number;
  avgCompletion: number;
  totalAccesses: number;
  avgDailyAccess: number;
  enrollByCategory: { label: string; value: number }[];
  accessTrend: { label: string; value: number }[];
  enrollmentTrend: number[];
  filteredCourseCount: number;
  activeUsers: number;
}

export function computeMetrics(
  courses: Course[],
  users: User[],
  f: DashboardFilters
): DashboardMetrics {
  const filtered = filterCourses(courses, f);
  const courseIds = new Set(filtered.map((c) => c.id));
  const scopedUsers = filterUsers(users, f);
  const accesses = filterAccesses(f);

  const publicados = filtered.filter((c) => c.status === "publicado");
  const totalEnrollments = filtered.reduce((s, c) => s + c.enrolled, 0);
  const activeEnrollments = publicados.reduce(
    (s, c) => s + Math.round(c.enrolled * (1 - c.completion / 100)),
    0
  );
  const avgCompletion =
    publicados.length === 0
      ? 0
      : Math.round(publicados.reduce((s, c) => s + c.completion, 0) / publicados.length);

  const totalAccesses = accesses.reduce((s, a) => s + a.count, 0);
  const avgDailyAccess = accesses.length ? Math.round(totalAccesses / accesses.length) : 0;

  const enrollByCategory = Object.entries(
    filtered.reduce<Record<string, number>>((acc, c) => {
      acc[c.category] = (acc[c.category] ?? 0) + c.enrolled;
      return acc;
    }, {})
  )
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  const accessTrend = accesses.slice(-14).map((a) => ({
    label: a.date.slice(8, 10) + "/" + a.date.slice(5, 7),
    value: a.count,
  }));

  const enrollmentTrend = accesses.slice(-12).map((_, i) => {
    const slice = filtered.slice(0, Math.max(1, filtered.length));
    const base = slice.reduce((s, c) => s + c.enrolled, 0);
    return Math.round((base / 12) * (0.7 + (i / 12) * 0.6));
  });

  return {
    activeEnrollments,
    totalEnrollments,
    avgCompletion,
    totalAccesses,
    avgDailyAccess,
    enrollByCategory,
    accessTrend,
    enrollmentTrend,
    filteredCourseCount: filtered.length,
    activeUsers: scopedUsers.filter((u) => u.status === "ativo").length,
  };
}

export function getFilterOptions(courses: Course[]) {
  return {
    categories: ["all", ...Array.from(new Set(courses.map((c) => c.category)))],
    modalities: ["all", "online", "presencial", "hibrido"],
    audiences: ["all", ...Array.from(new Set(courses.map((c) => c.audience)))],
    courses: courses.map((c) => ({ id: c.id, title: c.title })),
  };
}
