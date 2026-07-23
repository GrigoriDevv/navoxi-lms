"use client";

import Link from "next/link";
import {
  modalityLabels,
  modalityColors,
  inscricaoStatusLabels,
  solicitacaoStatusLabels,
} from "@/lib/aprendizagem";
import { unitLabels } from "@/lib/rbac";
import { PageHeader, Card, Badge, ProgressBar, Modal, Button } from "@/components/ui";
import { Icon } from "@/components/Icon";
import {
  inscricaoBadgeColor,
  solicitacaoBadgeColor,
  useCatalogoPage,
} from "./use-catalogo-page";

export default function CatalogoPage() {
  const {
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
  } = useCatalogoPage();

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
            {id === "inscricoes" &&
              myInscricoes.length + pendingSolicitacoes.length > 0 && (
                <span className="ml-2 text-xs bg-brand/10 text-brand px-1.5 py-0.5 rounded-full">
                  {inscricoesTabBadge}
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
                          : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-sm"
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
          {pendingSolicitacoes.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-slate-700 mb-3">
                Solicitações pendentes
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingSolicitacoes.map((s) => (
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
                  const { course, lessons, progressStats, barValue } =
                    getInscricaoProgress(i);
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
                      <ProgressBar value={barValue} />
                      <p className="text-xs text-slate-400 mt-1">
                        {lessons.length > 0
                          ? `${progressStats.completed}/${progressStats.total} aulas · ${barValue}%`
                          : `${i.progress}% concluído`}
                      </p>
                      {course && (
                        <p className="text-xs text-slate-500 mt-2">
                          {course.workload}h · {modalityLabels[course.modality]}
                        </p>
                      )}
                      {i.status === "ativa" && lessons.length > 0 && (
                        <Link
                          href={`/aprendizagem/cursos/${i.courseId}`}
                          className="mt-3 block w-full py-2 rounded-lg text-sm font-semibold text-center bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-sm"
                        >
                          Continuar curso
                        </Link>
                      )}
                      {i.status === "ativa" && lessons.length === 0 && (
                        <p className="mt-3 text-xs text-slate-400 text-center">
                          Aguardando publicação das aulas
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
        onClose={closeEnroll}
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
              <Button variant="outline" onClick={closeEnroll}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
