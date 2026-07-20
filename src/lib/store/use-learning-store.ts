"use client";

import { useCallback, useEffect, useState } from "react";
import * as seed from "../mock-data";
import type {
  Certificado,
  Course,
  CourseLesson,
  CourseModule,
  InscricaoCurso,
  InteresseCurso,
  LessonProgress,
  Sala,
  SolicitacaoMatricula,
  Trilha,
  Turma,
  UnitId,
} from "../types";
import { hasPermission } from "../rbac";
import { computeProgress, syncInscricaoProgress } from "../course-progress";
import { isJavaApiEnabled } from "../api-config";
import { lmsApi } from "../api-client";
import type { AppState, AuthState } from "./types";
import { STORAGE_LESSON_PROGRESS, now } from "./shared";

type LogFn = AppState["log"];
type DispatchNotification = AppState["dispatchNotification"];

export function useLearningStore(deps: {
  currentUser: AuthState | null;
  approvalRequired: boolean;
  log: LogFn;
  dispatchNotification: DispatchNotification;
  refreshNotifications: () => Promise<void>;
}) {
  const {
    currentUser,
    approvalRequired,
    log,
    dispatchNotification,
    refreshNotifications,
  } = deps;

  const [courses, setCourses] = useState<Course[]>(seed.courses);
  const [turmas, setTurmas] = useState<Turma[]>(seed.turmas);
  const [trilhas, setTrilhas] = useState<Trilha[]>(seed.trilhas);
  const [salas, setSalas] = useState<Sala[]>(seed.salas);
  const [certificados, setCertificados] = useState<Certificado[]>(
    seed.certificados
  );
  const [interesses, setInteresses] = useState<InteresseCurso[]>(
    seed.interesses
  );
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoMatricula[]>(
    seed.solicitacoes
  );
  const [inscricoes, setInscricoes] = useState<InscricaoCurso[]>(
    seed.inscricoes
  );
  const [courseModules, setCourseModules] = useState<CourseModule[]>(
    seed.courseModules
  );
  const [courseLessons, setCourseLessons] = useState<CourseLesson[]>(
    seed.courseLessons
  );
  const [lessonProgress, setLessonProgress] = useState<LessonProgress[]>(() => {
    if (typeof window === "undefined" || isJavaApiEnabled()) {
      return seed.lessonProgress;
    }
    try {
      const storedProgress = localStorage.getItem(STORAGE_LESSON_PROGRESS);
      if (!storedProgress) return seed.lessonProgress;
      const parsed = JSON.parse(storedProgress) as LessonProgress[];
      if (!Array.isArray(parsed)) return seed.lessonProgress;
      const key = (p: LessonProgress) => `${p.userId}:${p.lessonId}`;
      const merged = new Map<string, LessonProgress>();
      for (const p of seed.lessonProgress) merged.set(key(p), p);
      for (const p of parsed) merged.set(key(p), p);
      return Array.from(merged.values());
    } catch {
      return seed.lessonProgress;
    }
  });

  useEffect(() => {
    if (isJavaApiEnabled()) return;
    try {
      localStorage.setItem(
        STORAGE_LESSON_PROGRESS,
        JSON.stringify(lessonProgress)
      );
    } catch {
      /* ignore */
    }
  }, [lessonProgress]);

  useEffect(() => {
    if (!isJavaApiEnabled()) return;
    let cancelled = false;
    void Promise.all([
      lmsApi.listCourses(),
      lmsApi.listModules(),
      lmsApi.listLessons(),
    ])
      .then(([apiCourses, apiModules, apiLessons]) => {
        if (cancelled) return;
        setCourses(apiCourses);
        setCourseModules(apiModules);
        setCourseLessons(apiLessons);
      })
      .catch((err) => {
        console.error("[lms-api] falha ao carregar catálogo", err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isJavaApiEnabled() || !currentUser?.email) return;
    let cancelled = false;
    void Promise.all([
      lmsApi.listMyEnrollments(currentUser.email),
      lmsApi.listMyProgress(currentUser.email),
      lmsApi.listEnrollmentRequests(),
    ])
      .then(([apiEnrollments, apiProgress, apiRequests]) => {
        if (cancelled) return;
        setInscricoes((prev) => {
          const others = prev.filter((i) => i.userId !== currentUser.id);
          return [...apiEnrollments, ...others];
        });
        setLessonProgress((prev) => {
          const others = prev.filter((p) => p.userId !== currentUser.id);
          return [...apiProgress, ...others];
        });
        setSolicitacoes(apiRequests);
      })
      .catch((err) => {
        console.error(
          "[lms-api] falha ao carregar matrículas/progresso/solicitações",
          err
        );
      });
    return () => {
      cancelled = true;
    };
  }, [currentUser?.email, currentUser?.id]);

  const refreshMyLearning = useCallback(async () => {
    if (!currentUser?.email || !isJavaApiEnabled()) return;
    const [apiEnrollments, apiProgress, apiRequests] = await Promise.all([
      lmsApi.listMyEnrollments(currentUser.email),
      lmsApi.listMyProgress(currentUser.email),
      lmsApi.listEnrollmentRequests(),
    ]);
    setInscricoes((prev) => {
      const others = prev.filter((i) => i.userId !== currentUser.id);
      return [...apiEnrollments, ...others];
    });
    setLessonProgress((prev) => {
      const others = prev.filter((p) => p.userId !== currentUser.id);
      return [...apiProgress, ...others];
    });
    setSolicitacoes(apiRequests);
    await refreshNotifications();
  }, [currentUser, refreshNotifications]);

  const finalizeEnrollment = useCallback(
    (params: {
      userId: string;
      userName: string;
      courseId: string;
      courseTitle: string;
      turmaId?: string;
      turmaName?: string;
      unitId: UnitId;
    }) => {
      const id = "ins" + Math.random().toString(36).slice(2, 7);
      setInscricoes((prev) => {
        if (
          prev.some(
            (i) =>
              i.userId === params.userId &&
              i.courseId === params.courseId &&
              i.status === "ativa"
          )
        ) {
          return prev;
        }
        return [
          {
            id,
            userId: params.userId,
            userName: params.userName,
            courseId: params.courseId,
            courseTitle: params.courseTitle,
            turmaId: params.turmaId,
            turmaName: params.turmaName,
            unitId: params.unitId,
            enrolledAt: now(),
            progress: 0,
            status: "ativa",
          },
          ...prev,
        ];
      });
      setCourses((prev) =>
        prev.map((c) =>
          c.id === params.courseId ? { ...c, enrolled: c.enrolled + 1 } : c
        )
      );
      if (params.turmaId) {
        setTurmas((prev) =>
          prev.map((t) =>
            t.id === params.turmaId ? { ...t, enrolled: t.enrolled + 1 } : t
          )
        );
      }
    },
    []
  );

  const addCourse: AppState["addCourse"] = useCallback(
    (c) => {
      const unitId =
        currentUser && !hasPermission(currentUser.role, "view_all_units")
          ? currentUser.unitId
          : c.unitId;
      const payload = { ...c, unitId };

      if (isJavaApiEnabled()) {
        void lmsApi
          .createCourse(payload)
          .then((created) => {
            setCourses((prev) => [created, ...prev]);
            log({
              user: currentUser?.email ?? "system",
              action: `Criou curso '${created.title}'`,
              module: "Aprendizagem",
              severity: "info",
            });
          })
          .catch((err) => console.error("[lms-api] createCourse", err));
        return;
      }

      const id = "c" + Math.random().toString(36).slice(2, 7);
      setCourses((prev) => [
        { ...payload, id, enrolled: 0, completion: 0 },
        ...prev,
      ]);
      log({
        user: currentUser?.email ?? "system",
        action: `Criou curso '${c.title}'`,
        module: "Aprendizagem",
        severity: "info",
      });
    },
    [currentUser, log]
  );

  const updateCourse: AppState["updateCourse"] = useCallback(
    (id, data) => {
      if (isJavaApiEnabled()) {
        const current = courses.find((c) => c.id === id);
        if (!current) return;
        const merged = { ...current, ...data };
        void lmsApi
          .updateCourse(id, merged)
          .then((updated) => {
            setCourses((prev) => prev.map((c) => (c.id === id ? updated : c)));
            log({
              user: currentUser?.email ?? "system",
              action: `Atualizou curso '${id}'`,
              module: "Aprendizagem",
              severity: "info",
            });
          })
          .catch((err) => console.error("[lms-api] updateCourse", err));
        return;
      }

      setCourses((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...data } : c))
      );
      log({
        user: currentUser?.email ?? "system",
        action: `Atualizou curso '${id}'`,
        module: "Aprendizagem",
        severity: "info",
      });
    },
    [courses, currentUser, log]
  );

  const addTurma: AppState["addTurma"] = useCallback(
    (t) => {
      const id = "t" + Math.random().toString(36).slice(2, 7);
      const unitId =
        currentUser && !hasPermission(currentUser.role, "view_all_units")
          ? currentUser.unitId
          : t.unitId;
      setTurmas((prev) => [{ ...t, id, unitId }, ...prev]);
      log({
        user: currentUser?.email ?? "system",
        action: `Criou turma '${t.name}'`,
        module: "Aprendizagem",
        severity: "info",
      });
    },
    [currentUser, log]
  );

  const updateTurma: AppState["updateTurma"] = useCallback(
    (id, data) => {
      setTurmas((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...data } : t))
      );
      log({
        user: currentUser?.email ?? "system",
        action: `Atualizou turma '${id}'`,
        module: "Aprendizagem",
        severity: "info",
      });
    },
    [currentUser, log]
  );

  const addTrilha: AppState["addTrilha"] = useCallback(
    (t) => {
      const id = "tr" + Math.random().toString(36).slice(2, 7);
      setTrilhas((prev) => [{ ...t, id, progress: 0 }, ...prev]);
      log({
        user: currentUser?.email ?? "system",
        action: `Criou trilha '${t.name}'`,
        module: "Aprendizagem",
        severity: "info",
      });
    },
    [currentUser, log]
  );

  const updateTrilha: AppState["updateTrilha"] = useCallback((id, data) => {
    setTrilhas((prev) =>
      prev.map((tr) => (tr.id === id ? { ...tr, ...data } : tr))
    );
  }, []);

  const addSala: AppState["addSala"] = useCallback(
    (s) => {
      const id = "s" + Math.random().toString(36).slice(2, 7);
      const unitId =
        currentUser && !hasPermission(currentUser.role, "view_all_units")
          ? currentUser.unitId
          : s.unitId;
      setSalas((prev) => [{ ...s, id, unitId }, ...prev]);
      log({
        user: currentUser?.email ?? "system",
        action: `Cadastrou sala '${s.name}'`,
        module: "Aprendizagem",
        severity: "info",
      });
    },
    [currentUser, log]
  );

  const updateSolicitacao: AppState["updateSolicitacao"] = useCallback(
    async (id, status) => {
      if (isJavaApiEnabled()) {
        if (status !== "aprovada" && status !== "rejeitada") return;
        try {
          const updated = await lmsApi.decideEnrollmentRequest(id, status);
          setSolicitacoes((prev) =>
            prev.map((s) => (s.id === id ? updated : s))
          );
          await refreshMyLearning();
          log({
            user: currentUser?.email ?? "system",
            action: `Solicitação '${id}' → ${status}`,
            module: "Aprendizagem",
            severity: "info",
          });
        } catch (err) {
          console.error("[lms-api] updateSolicitacao", err);
        }
        return;
      }

      const sol = solicitacoes.find((s) => s.id === id);
      if (sol && status === "aprovada" && sol.status === "pendente") {
        const turma = sol.turmaId
          ? turmas.find((t) => t.id === sol.turmaId)
          : undefined;
        finalizeEnrollment({
          userId: sol.userId,
          userName: sol.userName,
          courseId: sol.courseId,
          courseTitle: sol.courseTitle,
          turmaId: sol.turmaId,
          turmaName: turma?.name,
          unitId: sol.unitId,
        });
        dispatchNotification({
          userId: sol.userId,
          title: "Matrícula aprovada",
          message: `Sua inscrição em "${sol.courseTitle}" foi aprovada.`,
          type: "curso",
          href: "/aprendizagem/catalogo?tab=inscricoes",
        });
      }
      setSolicitacoes((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, status, reviewer: currentUser?.name ?? s.reviewer }
            : s
        )
      );
      log({
        user: currentUser?.email ?? "system",
        action: `Solicitação '${id}' → ${status}`,
        module: "Aprendizagem",
        severity: "info",
      });
    },
    [
      currentUser,
      dispatchNotification,
      finalizeEnrollment,
      log,
      refreshMyLearning,
      solicitacoes,
      turmas,
    ]
  );

  const inscreverCurso: AppState["inscreverCurso"] = useCallback(
    async (courseId, turmaId) => {
      if (!currentUser) return "login";

      const course = courses.find((c) => c.id === courseId);
      if (!course) return "duplicate";

      const turma = turmaId ? turmas.find((t) => t.id === turmaId) : undefined;
      if (turma && turma.enrolled >= turma.capacity) return "lotada";

      const alreadyEnrolled = inscricoes.some(
        (i) =>
          i.userId === currentUser.id &&
          i.courseId === courseId &&
          i.status === "ativa"
      );
      if (alreadyEnrolled) return "duplicate";

      const pending = solicitacoes.some(
        (s) =>
          s.userId === currentUser.id &&
          s.courseId === courseId &&
          s.status === "pendente"
      );
      if (pending) return "duplicate";

      if (isJavaApiEnabled()) {
        try {
          if (approvalRequired) {
            const created = await lmsApi.createEnrollmentRequest(
              course.id,
              turmaId,
              turma?.name
            );
            setSolicitacoes((prev) => [created, ...prev]);
            await refreshNotifications();
            log({
              user: currentUser.email,
              action: `Solicitou matrícula em '${course.title}'`,
              module: "Aprendizagem",
              severity: "info",
            });
            return "pending";
          }
          const enrolled = await lmsApi.enroll(course.id, turmaId, turma?.name);
          setInscricoes((prev) => [
            enrolled,
            ...prev.filter((i) => i.id !== enrolled.id),
          ]);
          await refreshNotifications();
          log({
            user: currentUser.email,
            action: `Inscreveu-se em '${course.title}'`,
            module: "Aprendizagem",
            severity: "info",
          });
          return "ok";
        } catch (err) {
          console.error("[lms-api] inscreverCurso", err);
          return "duplicate";
        }
      }

      if (approvalRequired) {
        const id = "sol" + Math.random().toString(36).slice(2, 7);
        setSolicitacoes((prev) => [
          {
            id,
            userId: currentUser.id,
            userName: currentUser.name,
            courseId: course.id,
            courseTitle: course.title,
            turmaId,
            unitId: currentUser.unitId,
            requestedAt: now(),
            status: "pendente",
          },
          ...prev,
        ]);
        dispatchNotification({
          userId: currentUser.id,
          title: "Solicitação enviada",
          message: `Sua inscrição em "${course.title}" aguarda aprovação.`,
          type: "info",
          href: "/aprendizagem/catalogo?tab=inscricoes",
        });
        log({
          user: currentUser.email,
          action: `Solicitou matrícula em '${course.title}'`,
          module: "Aprendizagem",
          severity: "info",
        });
        return "pending";
      }

      finalizeEnrollment({
        userId: currentUser.id,
        userName: currentUser.name,
        courseId: course.id,
        courseTitle: course.title,
        turmaId,
        turmaName: turma?.name,
        unitId: currentUser.unitId,
      });
      dispatchNotification({
        userId: currentUser.id,
        title: "Inscrição confirmada",
        message: `Você foi matriculado em "${course.title}".`,
        type: "curso",
        href: "/aprendizagem/catalogo?tab=inscricoes",
      });
      log({
        user: currentUser.email,
        action: `Inscreveu-se em '${course.title}'`,
        module: "Aprendizagem",
        severity: "info",
      });
      return "ok";
    },
    [
      approvalRequired,
      courses,
      currentUser,
      dispatchNotification,
      finalizeEnrollment,
      inscricoes,
      log,
      refreshNotifications,
      solicitacoes,
      turmas,
    ]
  );

  const cancelarInscricao: AppState["cancelarInscricao"] = useCallback(
    (id) => {
      const ins = inscricoes.find((i) => i.id === id);
      if (!ins || ins.status !== "ativa") return;

      setInscricoes((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: "cancelada" } : i))
      );
      setCourses((prev) =>
        prev.map((c) =>
          c.id === ins.courseId
            ? { ...c, enrolled: Math.max(0, c.enrolled - 1) }
            : c
        )
      );
      if (ins.turmaId) {
        setTurmas((prev) =>
          prev.map((t) =>
            t.id === ins.turmaId
              ? { ...t, enrolled: Math.max(0, t.enrolled - 1) }
              : t
          )
        );
      }
      log({
        user: currentUser?.email ?? "system",
        action: `Cancelou inscrição em '${ins.courseTitle}'`,
        module: "Aprendizagem",
        severity: "info",
      });
    },
    [currentUser, inscricoes, log]
  );

  const completeLesson: AppState["completeLesson"] = useCallback(
    (lessonId) => {
      if (!currentUser) return;
      const lesson = courseLessons.find((l) => l.id === lessonId);
      if (!lesson) return;

      const alreadyDone = lessonProgress.some(
        (p) => p.userId === currentUser.id && p.lessonId === lessonId
      );
      if (alreadyDone) return;

      const applyLocal = (entry: LessonProgress) => {
        const nextProgress = [...lessonProgress, entry];
        setLessonProgress(nextProgress);
        const { percent } = computeProgress(
          currentUser.id,
          lesson.courseId,
          courseLessons,
          nextProgress
        );
        setInscricoes((prev) =>
          syncInscricaoProgress(prev, currentUser.id, lesson.courseId, percent)
        );
        if (percent >= 100) {
          dispatchNotification({
            userId: currentUser.id,
            title: "Curso concluído",
            message: `Parabéns! Você concluiu "${courses.find((c) => c.id === lesson.courseId)?.title ?? "o curso"}".`,
            type: "curso",
            href: `/aprendizagem/cursos/${lesson.courseId}`,
          });
        }
        log({
          user: currentUser.email,
          action: `Concluiu aula '${lesson.title}'`,
          module: "Aprendizagem",
          severity: "info",
        });
      };

      if (isJavaApiEnabled()) {
        void lmsApi
          .completeLesson(lessonId, currentUser.email)
          .then(async (entry) => {
            applyLocal(entry);
            try {
              await refreshMyLearning();
            } catch (err) {
              console.error("[lms-api] refresh after completeLesson", err);
            }
          })
          .catch((err) => console.error("[lms-api] completeLesson", err));
        return;
      }

      applyLocal({ userId: currentUser.id, lessonId, completedAt: now() });
    },
    [
      courseLessons,
      courses,
      currentUser,
      dispatchNotification,
      lessonProgress,
      log,
      refreshMyLearning,
    ]
  );

  const notifyNewLessons = useCallback(
    (
      courseId: string,
      courseTitle: string,
      count: number,
      lessonId?: string
    ) => {
      const enrolled = inscricoes.filter(
        (i) => i.courseId === courseId && i.status === "ativa"
      );
      for (const ins of enrolled) {
        dispatchNotification({
          userId: ins.userId,
          title: count > 1 ? "Novas aulas disponíveis" : "Nova aula disponível",
          message:
            count > 1
              ? `${count} nova(s) aula(s) em "${courseTitle}".`
              : `Nova aula publicada em "${courseTitle}".`,
          type: "curso",
          href: lessonId
            ? `/aprendizagem/cursos/${courseId}?aula=${lessonId}`
            : `/aprendizagem/cursos/${courseId}`,
        });
      }
    },
    [dispatchNotification, inscricoes]
  );

  const refreshLearningCatalog = useCallback(async () => {
    const [apiModules, apiLessons] = await Promise.all([
      lmsApi.listModules(),
      lmsApi.listLessons(),
    ]);
    setCourseModules(apiModules);
    setCourseLessons(apiLessons);
  }, []);

  const importPlaylistLessons: AppState["importPlaylistLessons"] = useCallback(
    (courseId, moduleTitle, items, existingModuleId) => {
      if (items.length === 0) return;

      const course = courses.find((c) => c.id === courseId);

      if (isJavaApiEnabled()) {
        void (async () => {
          try {
            let moduleId = existingModuleId;
            for (const item of items) {
              const created = await lmsApi.publishLesson(courseId, {
                moduleId,
                moduleTitle: moduleId ? undefined : moduleTitle,
                title: item.title,
                youtubeVideoId: item.videoId,
                videoUrl: item.videoUrl,
                durationSec: item.durationSec,
              });
              moduleId = created.moduleId;
            }
            await refreshLearningCatalog();
            notifyNewLessons(
              courseId,
              course?.title ?? "seu curso",
              items.length
            );
            log({
              user: currentUser?.email ?? "system",
              action: `Importou ${items.length} aulas no curso '${courseId}'`,
              module: "Aprendizagem",
              severity: "info",
            });
          } catch (err) {
            console.error("[lms-api] importPlaylistLessons", err);
          }
        })();
        return;
      }

      let moduleId = existingModuleId;

      if (!moduleId) {
        moduleId = "m" + Math.random().toString(36).slice(2, 7);
        const existingModules = courseModules.filter(
          (m) => m.courseId === courseId
        );
        const moduleOrder =
          existingModules.length === 0
            ? 1
            : Math.max(...existingModules.map((m) => m.order)) + 1;

        const newModule: CourseModule = {
          id: moduleId,
          courseId,
          title: moduleTitle,
          order: moduleOrder,
        };
        setCourseModules((prev) => [...prev, newModule]);
      }

      const existingLessons = courseLessons.filter(
        (l) => l.courseId === courseId
      );
      const orderBase =
        existingLessons.length === 0
          ? 0
          : Math.max(...existingLessons.map((l) => l.order));

      const newLessons: CourseLesson[] = items.map((item, idx) => ({
        id: "l" + Math.random().toString(36).slice(2, 7),
        courseId,
        moduleId: moduleId!,
        order: orderBase + idx + 1,
        title: item.title,
        youtubeVideoId: item.videoId,
        videoUrl: item.videoUrl,
        durationSec: item.durationSec,
      }));

      setCourseLessons((prev) => [...prev, ...newLessons]);
      notifyNewLessons(courseId, course?.title ?? "seu curso", items.length);

      log({
        user: currentUser?.email ?? "system",
        action: `Importou ${items.length} aulas do YouTube no curso '${courseId}'`,
        module: "Aprendizagem",
        severity: "info",
      });
    },
    [
      courseLessons,
      courseModules,
      courses,
      currentUser,
      log,
      notifyNewLessons,
      refreshLearningCatalog,
    ]
  );

  const publishCourseLesson: AppState["publishCourseLesson"] = useCallback(
    (params) => {
      const course = courses.find((c) => c.id === params.courseId);
      if (!course) return;
      if (!params.youtubeVideoId && !params.videoUrl) return;

      if (isJavaApiEnabled()) {
        void lmsApi
          .publishLesson(params.courseId, {
            moduleId: params.moduleId,
            moduleTitle: params.moduleTitle,
            title: params.title,
            youtubeVideoId: params.youtubeVideoId,
            videoUrl: params.videoUrl,
            durationSec: params.durationSec,
          })
          .then(async (lesson) => {
            await refreshLearningCatalog();
            notifyNewLessons(params.courseId, course.title, 1, lesson.id);
            log({
              user: currentUser?.email ?? "system",
              action: `Publicou aula '${params.title}' no curso '${course.title}'`,
              module: "Aprendizagem",
              severity: "info",
            });
          })
          .catch((err) => console.error("[lms-api] publishCourseLesson", err));
        return;
      }

      let moduleId = params.moduleId;
      if (!moduleId) {
        const existingModules = courseModules.filter(
          (m) => m.courseId === params.courseId
        );
        const moduleOrder =
          existingModules.length === 0
            ? 1
            : Math.max(...existingModules.map((m) => m.order)) + 1;
        moduleId = "m" + Math.random().toString(36).slice(2, 7);
        const newModule: CourseModule = {
          id: moduleId,
          courseId: params.courseId,
          title: params.moduleTitle?.trim() || "Módulo",
          order: moduleOrder,
        };
        setCourseModules((prev) => [...prev, newModule]);
      }

      const existingLessons = courseLessons.filter(
        (l) => l.courseId === params.courseId
      );
      const order =
        existingLessons.length === 0
          ? 1
          : Math.max(...existingLessons.map((l) => l.order)) + 1;

      const lesson: CourseLesson = {
        id: "l" + Math.random().toString(36).slice(2, 7),
        courseId: params.courseId,
        moduleId,
        order,
        title: params.title,
        youtubeVideoId: params.youtubeVideoId,
        videoUrl: params.videoUrl,
        durationSec: params.durationSec,
      };

      setCourseLessons((prev) => [...prev, lesson]);
      notifyNewLessons(params.courseId, course.title, 1, lesson.id);

      log({
        user: currentUser?.email ?? "system",
        action: `Publicou aula '${params.title}' no curso '${course.title}'`,
        module: "Aprendizagem",
        severity: "info",
      });
    },
    [
      courseLessons,
      courseModules,
      courses,
      currentUser,
      log,
      notifyNewLessons,
      refreshLearningCatalog,
    ]
  );

  const updateCourseLesson: AppState["updateCourseLesson"] = useCallback(
    (lessonId, data) => {
      const lesson = courseLessons.find((l) => l.id === lessonId);
      if (!lesson) return;

      if (isJavaApiEnabled()) {
        void lmsApi
          .updateLesson(lessonId, data)
          .then((updated) => {
            setCourseLessons((prev) =>
              prev.map((l) => (l.id === lessonId ? updated : l))
            );
            log({
              user: currentUser?.email ?? "system",
              action: `Editou aula '${lesson.title}'`,
              module: "Aprendizagem",
              severity: "info",
            });
          })
          .catch((err) => console.error("[lms-api] updateCourseLesson", err));
        return;
      }

      setCourseLessons((prev) =>
        prev.map((l) => (l.id === lessonId ? { ...l, ...data } : l))
      );

      log({
        user: currentUser?.email ?? "system",
        action: `Editou aula '${lesson.title}'`,
        module: "Aprendizagem",
        severity: "info",
      });
    },
    [courseLessons, currentUser, log]
  );

  const deleteCourseLesson: AppState["deleteCourseLesson"] = useCallback(
    (lessonId) => {
      const lesson = courseLessons.find((l) => l.id === lessonId);
      if (!lesson) return;

      if (isJavaApiEnabled()) {
        void lmsApi
          .deleteLesson(lessonId)
          .then(() => {
            setCourseLessons((prev) => prev.filter((l) => l.id !== lessonId));
            setLessonProgress((prev) =>
              prev.filter((p) => p.lessonId !== lessonId)
            );
            log({
              user: currentUser?.email ?? "system",
              action: `Removeu aula '${lesson.title}' do curso`,
              module: "Aprendizagem",
              severity: "alerta",
            });
          })
          .catch((err) => console.error("[lms-api] deleteCourseLesson", err));
        return;
      }

      setCourseLessons((prev) => prev.filter((l) => l.id !== lessonId));
      setLessonProgress((prev) => prev.filter((p) => p.lessonId !== lessonId));

      log({
        user: currentUser?.email ?? "system",
        action: `Removeu aula '${lesson.title}' do curso`,
        module: "Aprendizagem",
        severity: "alerta",
      });
    },
    [courseLessons, currentUser, log]
  );

  const deleteAllCourseLessons: AppState["deleteAllCourseLessons"] =
    useCallback(
      (courseId) => {
        const toRemove = courseLessons.filter((l) => l.courseId === courseId);
        if (toRemove.length === 0) return;

        const removedIds = new Set(toRemove.map((l) => l.id));
        const course = courses.find((c) => c.id === courseId);

        if (isJavaApiEnabled()) {
          void lmsApi
            .deleteAllCourseLessons(courseId)
            .then(() => {
              setCourseLessons((prev) =>
                prev.filter((l) => l.courseId !== courseId)
              );
              setLessonProgress((prev) =>
                prev.filter((p) => !removedIds.has(p.lessonId))
              );
              log({
                user: currentUser?.email ?? "system",
                action: `Removeu ${toRemove.length} aula(s) do curso '${course?.title ?? courseId}'`,
                module: "Aprendizagem",
                severity: "alerta",
              });
            })
            .catch((err) =>
              console.error("[lms-api] deleteAllCourseLessons", err)
            );
          return;
        }

        setCourseLessons((prev) =>
          prev.filter((l) => l.courseId !== courseId)
        );
        setLessonProgress((prev) =>
          prev.filter((p) => !removedIds.has(p.lessonId))
        );

        log({
          user: currentUser?.email ?? "system",
          action: `Removeu ${toRemove.length} aula(s) do curso '${course?.title ?? courseId}'`,
          module: "Aprendizagem",
          severity: "alerta",
        });
      },
      [courseLessons, courses, currentUser, log]
    );

  const addInteresse: AppState["addInteresse"] = useCallback((i) => {
    const id = "int" + Math.random().toString(36).slice(2, 7);
    setInteresses((prev) => [
      { ...i, id, registeredAt: now(), notified: false },
      ...prev,
    ]);
  }, []);

  const updateCertificado: AppState["updateCertificado"] = useCallback(
    (id, status) => {
      setCertificados((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status } : c))
      );
      log({
        user: currentUser?.email ?? "system",
        action: `Certificado '${id}' → ${status}`,
        module: "Aprendizagem",
        severity: "alerta",
      });
    },
    [currentUser, log]
  );

  return {
    courses,
    turmas,
    trilhas,
    salas,
    certificados,
    interesses,
    solicitacoes,
    inscricoes,
    courseModules,
    courseLessons,
    lessonProgress,
    addCourse,
    updateCourse,
    addTurma,
    updateTurma,
    addTrilha,
    updateTrilha,
    addSala,
    updateSolicitacao,
    inscreverCurso,
    cancelarInscricao,
    completeLesson,
    importPlaylistLessons,
    publishCourseLesson,
    updateCourseLesson,
    deleteCourseLesson,
    deleteAllCourseLessons,
    addInteresse,
    updateCertificado,
  };
}
