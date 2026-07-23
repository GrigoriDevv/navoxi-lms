"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/lib/store";
import { useAuthScope } from "@/lib/use-auth-scope";
import { computeProgress, getCourseLessons } from "@/lib/course-progress";
import type { Course, InscricaoCurso } from "@/lib/types";

type Tab = "catalogo" | "inscricoes";

export const inscricaoBadgeColor = {
  ativa: "green",
  concluida: "blue",
  cancelada: "slate",
} as const;

export const solicitacaoBadgeColor = {
  pendente: "amber",
  aprovada: "green",
  rejeitada: "red",
  cancelada: "slate",
} as const;

export function useCatalogoPage() {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");

  const { inscreverCurso, cancelarInscricao, currentUser } = useApp();
  const {
    courses,
    turmas,
    inscricoes,
    solicitacoes,
    courseLessons,
    lessonProgress,
    isGlobal,
    unitLabel,
  } = useAuthScope();

  const [tab, setTab] = useState<Tab>(
    tabFromUrl === "inscricoes" ? "inscricoes" : "catalogo"
  );
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("todos");
  const [modality, setModality] = useState("todos");
  const [enrollCourse, setEnrollCourse] = useState<Course | null>(null);
  const [selectedTurma, setSelectedTurma] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const myInscricoes = useMemo(
    () =>
      inscricoes.filter((i) => !currentUser || i.userId === currentUser.id),
    [inscricoes, currentUser]
  );

  const mySolicitacoes = useMemo(
    () =>
      solicitacoes.filter((s) => !currentUser || s.userId === currentUser.id),
    [solicitacoes, currentUser]
  );

  const enrolledCourseIds = useMemo(
    () =>
      new Set(
        myInscricoes.filter((i) => i.status === "ativa").map((i) => i.courseId)
      ),
    [myInscricoes]
  );

  const pendingCourseIds = useMemo(
    () =>
      new Set(
        mySolicitacoes
          .filter((s) => s.status === "pendente")
          .map((s) => s.courseId)
      ),
    [mySolicitacoes]
  );

  const catalog = useMemo(() => {
    return courses
      .filter((c) => c.status === "publicado")
      .filter((c) => category === "todos" || c.category === category)
      .filter((c) => modality === "todos" || c.modality === modality)
      .filter(
        (c) =>
          !query ||
          c.title.toLowerCase().includes(query.toLowerCase()) ||
          c.category.toLowerCase().includes(query.toLowerCase()) ||
          c.audience.toLowerCase().includes(query.toLowerCase())
      );
  }, [courses, query, category, modality]);

  const categories = useMemo(
    () => [
      "todos",
      ...Array.from(
        new Set(
          courses.filter((c) => c.status === "publicado").map((c) => c.category)
        )
      ),
    ],
    [courses]
  );

  const courseTurmas = (courseId: string) =>
    turmas.filter(
      (t) =>
        t.courseId === courseId &&
        t.status !== "concluida" &&
        t.enrolled < t.capacity
    );

  const openEnroll = (course: Course) => {
    setFeedback(null);
    setEnrollCourse(course);
    const available = courseTurmas(course.id);
    setSelectedTurma(available.length === 1 ? available[0].id : "");
  };

  const closeEnroll = () => setEnrollCourse(null);

  const handleEnroll = async () => {
    if (!enrollCourse) return;

    const available = courseTurmas(enrollCourse.id);
    const needsTurma =
      enrollCourse.modality !== "online" || available.length > 0;

    if (needsTurma && available.length > 0 && !selectedTurma) {
      setFeedback("Selecione uma turma para continuar.");
      return;
    }

    const result = await inscreverCurso(
      enrollCourse.id,
      selectedTurma || undefined
    );

    const messages: Record<
      "ok" | "pending" | "duplicate" | "lotada" | "login",
      string
    > = {
      ok: "Inscrição confirmada! Confira na aba Inscrições.",
      pending: "Solicitação enviada! Aguarde aprovação do gestor.",
      duplicate:
        "Você já está inscrito ou possui solicitação pendente neste curso.",
      lotada: "A turma selecionada está com vagas esgotadas.",
      login: "Faça login para se inscrever.",
    };

    setFeedback(messages[result]);
    if (result === "ok" || result === "pending") {
      setEnrollCourse(null);
      setTab("inscricoes");
    }
  };

  const enrollLabel = (courseId: string) => {
    if (enrolledCourseIds.has(courseId)) return "Inscrito";
    if (pendingCourseIds.has(courseId)) return "Aguardando aprovação";
    return "Inscrever-se";
  };

  const enrollDisabled = (courseId: string) =>
    enrolledCourseIds.has(courseId) || pendingCourseIds.has(courseId);

  const getInscricaoProgress = (i: InscricaoCurso) => {
    const course = courses.find((c) => c.id === i.courseId);
    const lessons = getCourseLessons(i.courseId, courseLessons);
    const progressStats =
      currentUser && lessons.length > 0
        ? computeProgress(
            currentUser.id,
            i.courseId,
            lessons,
            lessonProgress
          )
        : { completed: 0, total: 0, percent: i.progress };
    const barValue = lessons.length > 0 ? progressStats.percent : i.progress;
    return { course, lessons, progressStats, barValue };
  };

  const pendingSolicitacoes = useMemo(
    () => mySolicitacoes.filter((s) => s.status === "pendente"),
    [mySolicitacoes]
  );

  const inscricoesTabBadge = myInscricoes.filter((i) => i.status === "ativa")
    .length;

  return {
    currentUser,
    courses,
    turmas,
    isGlobal,
    unitLabel,
    tab,
    setTab,
    query,
    setQuery,
    category,
    setCategory,
    modality,
    setModality,
    enrollCourse,
    selectedTurma,
    setSelectedTurma,
    feedback,
    myInscricoes,
    mySolicitacoes,
    pendingSolicitacoes,
    catalog,
    categories,
    courseTurmas,
    openEnroll,
    closeEnroll,
    handleEnroll,
    enrollLabel,
    enrollDisabled,
    cancelarInscricao,
    getInscricaoProgress,
    inscricoesTabBadge,
  };
}
