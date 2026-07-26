import type {
  Course,
  CourseLesson,
  CourseModule,
  Destaque,
  Evaluation,
  EvaluationAttempt,
  AttemptAnswer,
  InscricaoCurso,
  LessonProgress,
  Notification,
  Post,
  Question,
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

type ApiQuestion = {
  id: string;
  text: string;
  type: Question["type"];
  category: string;
  unitId: Question["unitId"];
  usageCount: number;
  options?: string[] | null;
  correctKey?: string | null;
};

type ApiEvaluation = {
  id: string;
  name: string;
  courseId: string;
  turmaId?: string | null;
  unitId: Evaluation["unitId"];
  questionIds: string[];
  questionCount: number;
  status: Evaluation["status"];
  dueDate: string;
  appliedAt?: string | null;
};

type ApiAttemptAnswer = {
  id: string;
  questionId: string;
  responseText?: string | null;
  selectedOption?: string | null;
  isCorrect?: boolean | null;
};

type ApiAttempt = {
  id: string;
  evaluationId: string;
  userId: string;
  userName: string;
  attemptNumber: number;
  status: EvaluationAttempt["status"];
  startedAt: string;
  submittedAt?: string | null;
  scorePct?: number | null;
  answers: ApiAttemptAnswer[];
};

type ApiPost = {
  id: string;
  title: string;
  body: string;
  author: string;
  unitId: Post["unitId"];
  status: Post["status"];
  publishedAt: string;
};

type ApiDestaque = {
  id: string;
  title: string;
  body: string;
  unitId: Destaque["unitId"];
  visible: boolean;
  pinned: boolean;
  publishedAt: string;
  expiresAt?: string | null;
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

function mapQuestion(q: ApiQuestion): Question {
  return {
    id: q.id,
    text: q.text,
    type: q.type,
    category: q.category,
    unitId: q.unitId,
    usageCount: q.usageCount,
    options: q.options ?? undefined,
    correctKey: q.correctKey ?? undefined,
  };
}

function mapEvaluation(e: ApiEvaluation): Evaluation {
  return {
    id: e.id,
    name: e.name,
    courseId: e.courseId,
    turmaId: e.turmaId ?? undefined,
    unitId: e.unitId,
    questionIds: e.questionIds ?? [],
    questionCount: e.questionCount,
    status: e.status,
    dueDate: e.dueDate,
    appliedAt: e.appliedAt ?? undefined,
  };
}

function mapAttemptAnswer(a: ApiAttemptAnswer): AttemptAnswer {
  return {
    id: a.id,
    questionId: a.questionId,
    responseText: a.responseText ?? null,
    selectedOption: a.selectedOption ?? null,
    isCorrect: a.isCorrect ?? null,
  };
}

function mapAttempt(a: ApiAttempt): EvaluationAttempt {
  return {
    id: a.id,
    evaluationId: a.evaluationId,
    userId: a.userId,
    userName: a.userName,
    attemptNumber: a.attemptNumber,
    status: a.status,
    startedAt: a.startedAt,
    submittedAt: a.submittedAt ?? null,
    scorePct: a.scorePct ?? null,
    answers: (a.answers ?? []).map(mapAttemptAnswer),
  };
}

function mapPost(p: ApiPost): Post {
  return {
    id: p.id,
    title: p.title,
    body: p.body,
    author: p.author,
    unitId: p.unitId,
    status: p.status,
    publishedAt: p.publishedAt,
  };
}

function mapDestaque(d: ApiDestaque): Destaque {
  return {
    id: d.id,
    title: d.title,
    body: d.body,
    unitId: d.unitId,
    visible: d.visible,
    pinned: d.pinned,
    publishedAt: d.publishedAt,
    expiresAt: d.expiresAt ?? undefined,
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

  createUser: async (body: {
    name: string;
    email: string;
    role: User["role"];
    unitId: User["unitId"];
    department: string;
    authProvider?: "local" | "microsoft" | "both";
    password?: string;
  }) => {
    const data = await request<ApiUser>("/api/v1/users", {
      method: "POST",
      body: JSON.stringify({
        name: body.name,
        email: body.email,
        role: body.role,
        unitId: body.unitId,
        department: body.department,
        authProvider: body.authProvider ?? "microsoft",
        password: body.password,
      }),
    });
    return mapUser(data);
  },

  updateUser: async (
    id: string,
    body: Partial<Pick<User, "role" | "unitId" | "status" | "name" | "department">>
  ) => {
    const data = await request<ApiUser>(`/api/v1/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return mapUser(data);
  },

  deleteUser: async (id: string) => {
    const data = await request<ApiUser>(`/api/v1/users/${id}`, {
      method: "DELETE",
    });
    return mapUser(data);
  },

  listQuestions: async () => {
    const data = await request<ApiQuestion[]>("/api/v1/questions");
    return data.map(mapQuestion);
  },

  createQuestion: async (body: Omit<Question, "id" | "usageCount">) => {
    const data = await request<ApiQuestion>("/api/v1/questions", {
      method: "POST",
      body: JSON.stringify({
        text: body.text,
        type: body.type,
        category: body.category,
        unitId: body.unitId,
        options: body.options ?? null,
        correctKey: body.correctKey ?? null,
      }),
    });
    return mapQuestion(data);
  },

  updateQuestion: async (id: string, body: Omit<Question, "id" | "usageCount">) => {
    const data = await request<ApiQuestion>(`/api/v1/questions/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        text: body.text,
        type: body.type,
        category: body.category,
        unitId: body.unitId,
        options: body.options ?? null,
        correctKey: body.correctKey ?? null,
      }),
    });
    return mapQuestion(data);
  },

  deleteQuestion: (id: string) =>
    request<void>(`/api/v1/questions/${id}`, { method: "DELETE" }),

  listEvaluations: async () => {
    const data = await request<ApiEvaluation[]>("/api/v1/evaluations");
    return data.map(mapEvaluation);
  },

  createEvaluation: async (body: Omit<Evaluation, "id" | "questionCount" | "appliedAt">) => {
    const data = await request<ApiEvaluation>("/api/v1/evaluations", {
      method: "POST",
      body: JSON.stringify({
        name: body.name,
        courseId: body.courseId,
        turmaId: body.turmaId,
        unitId: body.unitId,
        questionIds: body.questionIds,
        status: body.status,
        dueDate: body.dueDate,
      }),
    });
    return mapEvaluation(data);
  },

  updateEvaluation: async (
    id: string,
    body: Omit<Evaluation, "id" | "questionCount" | "appliedAt">
  ) => {
    const data = await request<ApiEvaluation>(`/api/v1/evaluations/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        name: body.name,
        courseId: body.courseId,
        turmaId: body.turmaId,
        unitId: body.unitId,
        questionIds: body.questionIds,
        status: body.status,
        dueDate: body.dueDate,
      }),
    });
    return mapEvaluation(data);
  },

  applyEvaluation: async (id: string) => {
    const data = await request<ApiEvaluation>(`/api/v1/evaluations/${id}/apply`, {
      method: "POST",
    });
    return mapEvaluation(data);
  },

  listMyAttempts: async () => {
    const data = await request<ApiAttempt[]>("/api/v1/attempts/mine");
    return data.map(mapAttempt);
  },

  listEvaluationAttempts: async (evaluationId: string) => {
    const data = await request<ApiAttempt[]>(`/api/v1/evaluations/${evaluationId}/attempts`);
    return data.map(mapAttempt);
  },

  startEvaluationAttempt: async (evaluationId: string) => {
    const data = await request<ApiAttempt>(`/api/v1/evaluations/${evaluationId}/attempts`, {
      method: "POST",
    });
    return mapAttempt(data);
  },

  getAttempt: async (id: string) => {
    const data = await request<ApiAttempt>(`/api/v1/attempts/${id}`);
    return mapAttempt(data);
  },

  saveAttemptAnswers: async (
    id: string,
    answers: Array<{
      questionId: string;
      responseText?: string | null;
      selectedOption?: string | null;
    }>
  ) => {
    const data = await request<ApiAttempt>(`/api/v1/attempts/${id}/answers`, {
      method: "PUT",
      body: JSON.stringify({ answers }),
    });
    return mapAttempt(data);
  },

  submitAttempt: async (id: string) => {
    const data = await request<ApiAttempt>(`/api/v1/attempts/${id}/submit`, {
      method: "POST",
    });
    return mapAttempt(data);
  },

  listPosts: async () => {
    const data = await request<ApiPost[]>("/api/v1/posts");
    return data.map(mapPost);
  },

  createPost: async (
    body: Omit<Post, "id"> | Omit<Post, "id" | "author" | "status" | "publishedAt">
  ) => {
    const data = await request<ApiPost>("/api/v1/posts", {
      method: "POST",
      body: JSON.stringify({
        title: body.title,
        body: body.body,
        unitId: body.unitId,
        ...("author" in body ? { author: body.author } : {}),
        ...("status" in body ? { status: body.status } : {}),
        ...("publishedAt" in body ? { publishedAt: body.publishedAt } : {}),
      }),
    });
    return mapPost(data);
  },

  updatePost: async (id: string, body: Partial<Omit<Post, "id">>) => {
    const data = await request<ApiPost>(`/api/v1/posts/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        title: body.title,
        body: body.body,
        author: body.author,
        unitId: body.unitId,
        status: body.status,
        publishedAt: body.publishedAt,
      }),
    });
    return mapPost(data);
  },

  listDestaques: async () => {
    const data = await request<ApiDestaque[]>("/api/v1/destaques");
    return data.map(mapDestaque);
  },

  createDestaque: async (body: Omit<Destaque, "id" | "publishedAt"> & { publishedAt?: string }) => {
    const data = await request<ApiDestaque>("/api/v1/destaques", {
      method: "POST",
      body: JSON.stringify({
        title: body.title,
        body: body.body,
        unitId: body.unitId,
        visible: body.visible,
        pinned: body.pinned,
        publishedAt: body.publishedAt,
        expiresAt: body.expiresAt,
      }),
    });
    return mapDestaque(data);
  },

  updateDestaque: async (id: string, body: Partial<Omit<Destaque, "id">>) => {
    const data = await request<ApiDestaque>(`/api/v1/destaques/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        title: body.title,
        body: body.body,
        unitId: body.unitId,
        visible: body.visible,
        pinned: body.pinned,
        publishedAt: body.publishedAt,
        expiresAt: body.expiresAt,
      }),
    });
    return mapDestaque(data);
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
