"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/lib/store";
import { useAuthScope } from "@/lib/use-auth-scope";
import {
  modalityLabels,
  modalityColors,
  inscricaoStatusLabels,
  solicitacaoStatusLabels,
} from "@/lib/aprendizagem";
import { unitLabels } from "@/lib/rbac";
import { PageHeader, Card, Badge, ProgressBar, Modal, Button } from "@/components/ui";
import { Icon } from "@/components/Icon";
import type { Course } from "@/lib/types";

type Tab = "catalogo" | "inscricoes";

const inscricaoBadgeColor = {
  ativa: "green",
  concluida: "blue",
  cancelada: "slate",
} as const;

const solicitacaoBadgeColor = {
  pendente: "amber",
  aprovada: "green",
  rejeitada: "red",
  cancelada: "slate",
} as const;

export default function CatalogoPage() {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");

  const { inscreverCurso, cancelarInscricao, currentUser } = useApp();
  const { courses, turmas, inscricoes, solicitacoes, isGlobal, unitLabel } = useAuthScope();

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
      inscricoes.filter(
        (i) => !currentUser || i.userId === currentUser.id
      ),
    [inscricoes, currentUser]
  );

  const mySolicitacoes = useMemo(
    () =>
      solicitacoes.filter(
        (s) => !currentUser || s.userId === currentUser.id
      ),
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
        mySolicitacoes.filter((s) => s.status === "pendente").map((s) => s.courseId)
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

  const categories = [
    "todos",
    ...Array.from(
      new Set(courses.filter((c) => c.status === "publicado").map((c) => c.category))
    ),
  ];

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

  const handleEnroll = () => {
    if (!enrollCourse) return;

    const available = courseTurmas(enrollCourse.id);
    const needsTurma =
      enrollCourse.modality !== "online" || available.length > 0;

    if (needsTurma && available.length > 0 && !selectedTurma) {
      setFeedback("Selecione uma turma para continuar.");
      return;
    }

    const result = inscreverCurso(
      enrollCourse.id,
      selectedTurma || undefined
    );

    const messages: Record<typeof result, string> = {
      ok: "Inscrição confirmada! Confira na aba Inscrições.",
      pending: "Solicitação enviada! Aguarde aprovação do gestor.",
      duplicate: "Você já está inscrito ou possui solicitação pendente neste curso.",
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

  return (
    <div>
      <PageHeader
        title="Catálogo de Cursos"
        subtitle={
          isGlobal
            ? "Navegue, inscreva-se e acompanhe seus cursos (RF-040)"
            : `Catálogo · ${unitLabel}`
        }
      />

      <div className="flex gap-1 mb-4 border-b border-slate-200">
        {(
          [
            ["catalogo", "Catálogo"],
            ["inscricoes", "Inscrições"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${
              tab === id
                ? "border-brand text-brand"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {label}
            {id === "inscricoes" && myInscricoes.length + mySolicitacoes.filter((s) => s.status === "pendente").length > 0 && (
              <span className="ml-2 text-xs bg-brand/10 text-brand px-1.5 py-0.5 rounded-full">
                {myInscricoes.filter((i) => i.status === "ativa").length}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "catalogo" && (
        <>
          <Card className="p-4 mb-4">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="relative flex-1">
                <Icon
                  name="search"
                  className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por título, categoria ou público-alvo…"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-100 text-sm outline-none"
                />
              </div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === "todos" ? "Todas categorias" : c}
                  </option>
                ))}
              </select>
              <select
                value={modality}
                onChange={(e) => setModality(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white"
              >
                <option value="todos">Todas modalidades</option>
                <option value="online">{modalityLabels.online}</option>
                <option value="presencial">{modalityLabels.presencial}</option>
                <option value="hibrido">{modalityLabels.hibrido}</option>
              </select>
            </div>
          </Card>

          {catalog.length === 0 ? (
            <Card className="p-12 text-center text-slate-400">
              Nenhum curso encontrado. Ajuste os filtros de navegação.
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {catalog.map((c) => (
                <Card
                  key={c.id}
                  className="overflow-hidden flex flex-col hover:shadow-md transition"
                >
                  <div
                    className="h-24 p-4 flex items-end justify-between"
                    style={{
                      background: `linear-gradient(135deg, ${c.cover}, ${c.cover}99)`,
                    }}
                  >
                    <Badge color="green">Disponível</Badge>
                    <span
                      className="text-[10px] font-semibold text-white px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: modalityColors[c.modality] }}
                    >
                      {modalityLabels[c.modality]}
                    </span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <span className="text-xs font-medium text-brand">{c.category}</span>
                    <h3 className="font-semibold text-slate-800 mt-1">{c.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {c.workload}h · {unitLabels[c.unitId]} · {c.audience}
                    </p>
                    <div className="mt-auto pt-3">
                      <ProgressBar value={c.completion} />
                      <p className="text-xs text-slate-400 mt-1">
                        {c.enrolled.toLocaleString("pt-BR")} matriculados
                      </p>
                    </div>
                    <button
                      onClick={() => !enrollDisabled(c.id) && openEnroll(c)}
                      disabled={enrollDisabled(c.id)}
                      className={`mt-3 w-full py-2 rounded-lg text-sm font-semibold transition ${
                        enrollDisabled(c.id)
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : "bg-brand text-white hover:bg-brand-dark"
                      }`}
                    >
                      {enrollLabel(c.id)}
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "inscricoes" && (
        <div className="space-y-6">
          {mySolicitacoes.filter((s) => s.status === "pendente").length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-slate-700 mb-3">
                Solicitações pendentes
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mySolicitacoes
                  .filter((s) => s.status === "pendente")
                  .map((s) => (
                    <Card key={s.id} className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-slate-800">{s.courseTitle}</h3>
                          <p className="text-xs text-slate-400 mt-1">
                            Solicitado em {s.requestedAt}
                          </p>
                          {s.turmaId && (
                            <p className="text-xs text-slate-500 mt-1">
                              Turma: {turmas.find((t) => t.id === s.turmaId)?.name ?? "—"}
                            </p>
                          )}
                        </div>
                        <Badge color={solicitacaoBadgeColor[s.status]}>
                          {solicitacaoStatusLabels[s.status]}
                        </Badge>
                      </div>
                    </Card>
                  ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="text-sm font-semibold text-slate-700 mb-3">
              Minhas matrículas
            </h2>
            {myInscricoes.length === 0 ? (
              <Card className="p-12 text-center text-slate-400">
                <Icon name="book" className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>Você ainda não possui inscrições.</p>
                <button
                  onClick={() => setTab("catalogo")}
                  className="mt-3 text-sm text-brand font-medium hover:underline"
                >
                  Explorar catálogo
                </button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myInscricoes.map((i) => {
                  const course = courses.find((c) => c.id === i.courseId);
                  return (
                    <Card key={i.id} className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <h3 className="font-semibold text-slate-800">{i.courseTitle}</h3>
                          <p className="text-xs text-slate-400 mt-1">
                            Inscrito em {i.enrolledAt}
                            {i.turmaName && ` · ${i.turmaName}`}
                          </p>
                        </div>
                        <Badge color={inscricaoBadgeColor[i.status]}>
                          {inscricaoStatusLabels[i.status]}
                        </Badge>
                      </div>
                      <ProgressBar value={i.progress} />
                      <p className="text-xs text-slate-400 mt-1">{i.progress}% concluído</p>
                      {course && (
                        <p className="text-xs text-slate-500 mt-2">
                          {course.workload}h · {modalityLabels[course.modality]}
                        </p>
                      )}
                      {i.status === "ativa" && (
                        <button
                          onClick={() => cancelarInscricao(i.id)}
                          className="mt-3 text-xs text-red-600 font-medium hover:underline"
                        >
                          Cancelar inscrição
                        </button>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}

      <Modal
        open={!!enrollCourse}
        onClose={() => setEnrollCourse(null)}
        title="Confirmar inscrição"
      >
        {enrollCourse && (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-slate-800">{enrollCourse.title}</h4>
              <p className="text-sm text-slate-500 mt-1">
                {enrollCourse.workload}h · {modalityLabels[enrollCourse.modality]} ·{" "}
                {unitLabels[enrollCourse.unitId]}
              </p>
            </div>

            {(() => {
              const available = courseTurmas(enrollCourse.id);
              if (available.length === 0) return null;
              return (
                <label className="block">
                  <span className="block text-sm font-medium text-slate-700 mb-1">
                    Turma
                  </span>
                  <select
                    value={selectedTurma}
                    onChange={(e) => setSelectedTurma(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white"
                  >
                    <option value="">Selecione uma turma…</option>
                    {available.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} · {t.enrolled}/{t.capacity} vagas · início{" "}
                        {t.startDate}
                      </option>
                    ))}
                  </select>
                </label>
              );
            })()}

            {feedback && (
              <p className="text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
                {feedback}
              </p>
            )}

            <div className="flex gap-2 pt-2">
              <Button onClick={handleEnroll}>Confirmar inscrição</Button>
              <Button variant="outline" onClick={() => setEnrollCourse(null)}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
