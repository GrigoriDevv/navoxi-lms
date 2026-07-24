import type {
  Course,
  CourseLesson,
  CourseModule,
  InscricaoCurso,
  LessonProgress,
  Notification,
  SolicitacaoMatricula,
  User,
} from "./types";
import { apiBaseUrl } from "./api-config";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function toBffPath(path: string): string {
  // Browser always hits same-origin BFF: /api/lms/<rest after /api/v1/>
  if (typeof window !== "undefined") {
    const stripped = path.replace(/^\/api\/v1\/?/, "");
    return `/api/lms/${stripped}`;
  }
  return `${apiBaseUrl()}${path}`;
}

async function request<T>(
  path: string,
  options: RequestInit & { email?: string } = {}
): Promise<T> {
  const { email: _email, headers: initHeaders, ...rest } = options;
  const headers = new Headers(initHeaders);
  if (!headers.has("Content-Type") && rest.body) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(toBffPath(path), {
    ...rest,
    headers,
    credentials: "same-origin",
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    const msg =
      data && typeof data === "object" && "error" in data
        ? String((data as { error: string }).error)
        : `API ${res.status}`;
    throw new ApiError(msg, res.status);
  }

  return data as T;
}

type ApiCourse = {
  id: string;
  title: string;
  category: string;
  instructor: string;
  unitId: Course["unitId"];
  modality: Course["modality"];
  audience: string;
  workload: number;
  status: Course["status"];
  enrolled: number;
  completion: number;
  cover: string;
};

type ApiModule = {
  id: string;
  courseId: string;
  title: string;
  order: number;
};

type ApiLesson = {
  id: string;
  courseId: string;
  moduleId: string;
  order: number;
  title: string;
  youtubeVideoId?: string | null;
  videoUrl?: string | null;
  durationSec?: number | null;
};

type ApiEnrollment = {
  id: string;
  userId: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  turmaId?: string | null;
  turmaName?: string | null;
  unitId: InscricaoCurso["unitId"];
  enrolledAt: string;
  progress: number;
  status: InscricaoCurso["status"];
};

type ApiProgress = {
  userId: string;
  lessonId: string;
  completedAt: string;
};

function mapCourse(c: ApiCourse): Course {
  return { ...c };
}

function mapModule(m: ApiModule): CourseModule {
  return { id: m.id, courseId: m.courseId, title: m.title, order: m.order };
}

function mapLesson(l: ApiLesson): CourseLesson {
  return {
    id: l.id,
    courseId: l.courseId,
    moduleId: l.moduleId,
    order: l.order,
    title: l.title,
    youtubeVideoId: l.youtubeVideoId ?? undefined,
    videoUrl: l.videoUrl ?? undefined,
    durationSec: l.durationSec ?? undefined,
  };
}

function mapEnrollment(e: ApiEnrollment): InscricaoCurso {
  return {
    id: e.id,
    userId: e.userId,
    userName: e.userName,
    courseId: e.courseId,
    courseTitle: e.courseTitle,
    turmaId: e.turmaId ?? undefined,
    turmaName: e.turmaName ?? undefined,
    unitId: e.unitId,
    enrolledAt: e.enrolledAt,
    progress: e.progress,
    status: e.status,
  };
}

export const lmsApi = {
  health: () => request<{ status: string }>("/api/v1/health"),

  listCourses: async () => {
    const data = await request<ApiCourse[]>("/api/v1/courses");
    return data.map(mapCourse);
  },

  getCourse: async (id: string) => {
    const data = await request<ApiCourse>(`/api/v1/courses/${id}`);
    return mapCourse(data);
  },

  createCourse: async (body: Omit<Course, "id" | "enrolled" | "completion">) => {
    const data = await request<ApiCourse>("/api/v1/courses", {
      method: "POST",
      body: JSON.stringify({
        title: body.title,
        category: body.category,
        instructor: body.instructor,
        unitId: body.unitId,
        modality: body.modality,
        audience: body.audience,
        workload: body.workload,
        status: body.status,
        cover: body.cover,
      }),
    });
    return mapCourse(data);
  },

  updateCourse: async (id: string, body: Partial<Course>) => {
    const data = await request<ApiCourse>(`/api/v1/courses/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        title: body.title,
        category: body.category,
        instructor: body.instructor,
        unitId: body.unitId,
        modality: body.modality,
        audience: body.audience,
        workload: body.workload,
        status: body.status,
        cover: body.cover,
      }),
    });
    return mapCourse(data);
  },

  listModules: async () => {
    const data = await request<ApiModule[]>("/api/v1/modules");
    return data.map(mapModule);
  },

  listLessons: async () => {
    const data = await request<ApiLesson[]>("/api/v1/lessons");
    return data.map(mapLesson);
  },

  listCourseLessons: async (courseId: string) => {
    const data = await request<ApiLesson[]>(`/api/v1/courses/${courseId}/lessons`);
    return data.map(mapLesson);
  },

  publishLesson: async (
    courseId: string,
    body: {
      moduleId?: string;
      moduleTitle?: string;
      title: string;
      youtubeVideoId?: string;
      videoUrl?: string;
      durationSec?: number;
    }
  ) => {
    const data = await request<ApiLesson>(`/api/v1/courses/${courseId}/lessons`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return mapLesson(data);
  },

  uploadLessonVideo: async (courseId: string, file: File) => {
    const form = new FormData();
    form.append("courseId", courseId);
    form.append("file", file);
    const res = await fetch(toBffPath("/api/v1/media/videos"), {
      method: "POST",
      body: form,
      credentials: "same-origin",
    });
    const text = await res.text();
    const data = text ? (JSON.parse(text) as { url?: string; error?: string }) : null;
    if (!res.ok) {
      throw new ApiError(data?.error || `API ${res.status}`, res.status);
    }
    if (!data?.url) {
      throw new ApiError("Upload sem URL de retorno", 502);
    }
    return data.url;
  },

  updateLesson: async (
    lessonId: string,
    body: Partial<Pick<CourseLesson, "title" | "moduleId" | "youtubeVideoId" | "videoUrl" | "order">>
  ) => {
    const data = await request<ApiLesson>(`/api/v1/lessons/${lessonId}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    return mapLesson(data);
  },

  deleteLesson: (lessonId: string) =>
    request<void>(`/api/v1/lessons/${lessonId}`, { method: "DELETE" }),

  deleteAllCourseLessons: (courseId: string) =>
    request<void>(`/api/v1/courses/${courseId}/lessons`, { method: "DELETE" }),

  completeLesson: async (lessonId: string, email: string) => {
    const data = await request<ApiProgress>(`/api/v1/lessons/${lessonId}/complete`, {
      method: "POST",
      email,
    });
    return {
      userId: data.userId,
      lessonId: data.lessonId,
      completedAt: data.completedAt,
    } satisfies LessonProgress;
  },

  listMyEnrollments: async (email: string) => {
    const data = await request<ApiEnrollment[]>("/api/v1/users/me/enrollments", { email });
    return data.map(mapEnrollment);
  },

  listMyProgress: async (email: string) => {
    const data = await request<ApiProgress[]>("/api/v1/users/me/progress", { email });
    return data.map(
      (p) =>
        ({
          userId: p.userId,
          lessonId: p.lessonId,
          completedAt: p.completedAt,
        }) satisfies LessonProgress
    );
  },

  enroll: async (courseId: string, turmaId?: string, turmaName?: string) => {
    const data = await request<ApiEnrollment>("/api/v1/enrollments", {
      method: "POST",
      body: JSON.stringify({ courseId, turmaId, turmaName }),
    });
    return mapEnrollment(data);
  },

  listEnrollmentRequests: async () => {
    const data = await request<ApiEnrollmentRequest[]>("/api/v1/enrollment-requests");
    return data.map(mapEnrollmentRequest);
  },

  createEnrollmentRequest: async (courseId: string, turmaId?: string, turmaName?: string) => {
    const data = await request<ApiEnrollmentRequest>("/api/v1/enrollment-requests", {
      method: "POST",
      body: JSON.stringify({ courseId, turmaId, turmaName }),
    });
    return mapEnrollmentRequest(data);
  },

  decideEnrollmentRequest: async (
    id: string,
    status: Extract<SolicitacaoMatricula["status"], "aprovada" | "rejeitada">
  ) => {
    const data = await request<ApiEnrollmentRequest>(
      `/api/v1/enrollment-requests/${id}/decision`,
      {
        method: "POST",
        body: JSON.stringify({ status }),
      }
    );
    return mapEnrollmentRequest(data);
  },

  listMyNotifications: async () => {
    const data = await request<ApiNotification[]>("/api/v1/users/me/notifications");
    return data.map(mapNotification);
  },

  markNotificationRead: async (id: string) => {
    const data = await request<ApiNotification>(
      `/api/v1/users/me/notifications/${id}/read`,
      { method: "POST" }
    );
    return mapNotification(data);
  },

  markAllNotificationsRead: () =>
    request<{ updated: number }>("/api/v1/users/me/notifications/read-all", {
      method: "POST",
    }),

  listUsers: async () => {
    const data = await request<ApiUser[]>("/api/v1/users");
    return data.map(mapUser);
  },

  updateUser: async (
    id: string,
    body: Partial<Pick<User, "role" | "unitId" | "status">>
  ) => {
    const data = await request<ApiUser>(`/api/v1/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return mapUser(data);
  },
};

type ApiEnrollmentRequest = {
  id: string;
  userId: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  turmaId?: string | null;
  turmaName?: string | null;
  unitId: SolicitacaoMatricula["unitId"];
  requestedAt: string;
  status: SolicitacaoMatricula["status"];
  reviewer?: string | null;
};

type ApiUser = {
  id: string;
  name: string;
  email: string;
  role: User["role"];
  unitId: User["unitId"];
  department: string;
  status: User["status"];
  lastAccess: string;
  avatarColor: string;
};

type ApiNotification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: Notification["type"];
  read: boolean;
  timestamp: string;
  href?: string | null;
  module?: string | null;
  details?: string | null;
};

function mapEnrollmentRequest(r: ApiEnrollmentRequest): SolicitacaoMatricula {
  return {
    id: r.id,
    userId: r.userId,
    userName: r.userName,
    courseId: r.courseId,
    courseTitle: r.courseTitle,
    turmaId: r.turmaId ?? undefined,
    unitId: r.unitId,
    requestedAt: r.requestedAt,
    status: r.status,
    reviewer: r.reviewer ?? undefined,
  };
}

function mapNotification(n: ApiNotification): Notification {
  return {
    id: n.id,
    userId: n.userId,
    title: n.title,
    message: n.message,
    type: n.type,
    read: n.read,
    timestamp: n.timestamp,
    href: n.href ?? undefined,
    module: n.module ?? undefined,
    details: n.details ?? undefined,
  };
}

function mapUser(u: ApiUser): User {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    unitId: u.unitId,
    department: u.department,
    status: u.status,
    lastAccess: u.lastAccess ?? "—",
    avatarColor: u.avatarColor,
  };
}
