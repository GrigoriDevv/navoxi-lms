"use client";

import { useMemo, useState } from "react";
import { events } from "@/lib/mock-data";
import { useAuthScope } from "@/lib/use-auth-scope";
import { modalityLabels } from "@/lib/aprendizagem";
import { PageHeader, Card, Badge } from "@/components/ui";

const typeColor = {
  aula: "green",
  prova: "red",
  webinar: "blue",
  prazo: "amber",
  presencial: "slate",
} as const;

const typeLabel = {
  aula: "Aula",
  prova: "Prova",
  webinar: "Webinar",
  prazo: "Prazo",
  presencial: "Presencial",
} as const;

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function CalendarioPage() {
  const { courses, turmas, salas } = useAuthScope();
  const [view, setView] = useState<"todos" | "curso" | "turma" | "sala">("todos");

  const year = 2026;
  const month = 5;
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const scopedEvents = useMemo(() => {
    const courseIds = new Set(courses.map((c) => c.id));
    const turmaIds = new Set(turmas.map((t) => t.id));
    return events.filter((e) => {
      if (e.courseId && !courseIds.has(e.courseId)) return false;
      if (e.turmaId && !turmaIds.has(e.turmaId)) return false;
      if (view === "curso") return !!e.courseId;
      if (view === "turma") return !!e.turmaId;
      if (view === "sala") return !!e.salaId;
      return true;
    });
  }, [courses, turmas, view]);

  const eventsByDay: Record<number, typeof events> = {};
  scopedEvents.forEach((e) => {
    const day = Number(e.date.split("-")[2]);
    (eventsByDay[day] ??= []).push(e);
  });

  const courseName = (id?: string) => courses.find((c) => c.id === id)?.title;
  const turmaName = (id?: string) => turmas.find((t) => t.id === id)?.name;
  const salaName = (id?: string) => salas.find((s) => s.id === id)?.name;

  return (
    <div>
      <PageHeader
        title="Calendário Acadêmico"
        subtitle="Visão de eventos, cursos, turmas e salas (RF-044)"
      />

      <div className="flex flex-wrap gap-2 mb-4">
        {(["todos", "curso", "turma", "sala"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize transition ${
              view === v ? "bg-brand text-white" : "bg-white border border-slate-200 text-slate-600"
            }`}
          >
            {v === "todos" ? "Todos eventos" : v === "curso" ? "Por curso" : v === "turma" ? "Por turma" : "Por sala"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="lg:col-span-3 p-4">
          <div className="text-sm font-semibold text-slate-600 mb-3">Junho de 2026</div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((w) => (
              <div key={w} className="text-center text-xs font-semibold text-slate-400 py-1">{w}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((d, i) => (
              <div key={i} className={`min-h-20 rounded-lg border p-1.5 ${d ? "border-slate-200" : "border-transparent"}`}>
                {d && (
                  <>
                    <div className="text-xs font-medium text-slate-500 mb-1">{d}</div>
                    <div className="space-y-1">
                      {(eventsByDay[d] ?? []).map((e) => (
                        <div
                          key={e.id}
                          className={`text-[10px] leading-tight px-1.5 py-0.5 rounded truncate ${
                            e.type === "aula" ? "bg-sky-100 text-sky-800"
                            : e.type === "prova" ? "bg-red-100 text-red-700"
                            : e.type === "webinar" ? "bg-blue-100 text-blue-700"
                            : e.type === "presencial" ? "bg-slate-100 text-slate-700"
                            : "bg-amber-100 text-amber-700"
                          }`}
                          title={e.title}
                        >
                          {e.title}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Próximos eventos</h3>
          <div className="space-y-3">
            {[...scopedEvents]
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((e) => (
                <div key={e.id} className="flex gap-3">
                  <div className="text-center shrink-0 w-10">
                    <div className="text-lg font-bold text-slate-800 leading-none">{e.date.split("-")[2]}</div>
                    <div className="text-[10px] text-slate-400 uppercase">Jun</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-700 leading-snug">{e.title}</div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <Badge color={typeColor[e.type]}>{typeLabel[e.type]}</Badge>
                      {e.modality && <Badge color="blue">{modalityLabels[e.modality]}</Badge>}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 space-y-0.5">
                      {e.courseId && <div>Curso: {courseName(e.courseId)}</div>}
                      {e.turmaId && <div>Turma: {turmaName(e.turmaId)}</div>}
                      {e.salaId && <div>Sala: {salaName(e.salaId)}</div>}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
