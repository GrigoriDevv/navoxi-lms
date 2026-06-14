"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/lib/store";
import {
  notificationTypeLabel,
  notificationTypeStyles,
} from "@/lib/notifications-ui";
import { NotificationDetail } from "@/components/notifications/NotificationDetail";
import { PageHeader, Card, Badge, StatCard } from "@/components/ui";
import { Icon } from "@/components/Icon";

type Tab = "lista" | "detalhes";
type Filter = "todas" | "nao_lidas";

export function NotificacoesView() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id");

  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead } =
    useApp();

  const [tab, setTab] = useState<Tab>(initialId ? "detalhes" : "lista");
  const [filter, setFilter] = useState<Filter>("todas");
  const [selectedId, setSelectedId] = useState<string | null>(initialId);

  const filtered = useMemo(() => {
    if (filter === "nao_lidas") return notifications.filter((n) => !n.read);
    return notifications;
  }, [notifications, filter]);

  const selected = notifications.find((n) => n.id === selectedId) ?? null;

  const openDetail = (id: string) => {
    setSelectedId(id);
    setTab("detalhes");
    markNotificationRead(id);
  };

  return (
    <div>
      <PageHeader
        title="Notificações"
        subtitle="Acompanhe avisos, prazos e atualizações da plataforma"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard
          label="Total"
          value={notifications.length.toString()}
          icon={<Icon name="bell" className="w-5 h-5" />}
        />
        <StatCard
          label="Não lidas"
          value={unreadCount.toString()}
          color="#d97706"
          icon={<Icon name="mail" className="w-5 h-5" />}
        />
        <StatCard
          label="Alertas"
          value={notifications.filter((n) => n.type === "alerta").length.toString()}
          color="#dc2626"
          icon={<Icon name="shield" className="w-5 h-5" />}
        />
        <StatCard
          label="Cursos e prazos"
          value={notifications.filter((n) => n.type === "curso" || n.type === "prazo").length.toString()}
          color="#00a14b"
          icon={<Icon name="book" className="w-5 h-5" />}
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex gap-1 border-b border-slate-200">
          {(
            [
              ["lista", "Lista"],
              ["detalhes", "Detalhes"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              disabled={id === "detalhes" && !selected}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${
                tab === id
                  ? "border-brand text-brand"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              } ${id === "detalhes" && !selected ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "lista" && unreadCount > 0 && (
          <button
            onClick={markAllNotificationsRead}
            className="text-sm font-medium text-brand hover:underline self-start sm:self-auto"
          >
            Marcar todas como lidas
          </button>
        )}
      </div>

      {tab === "lista" && (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            {(
              [
                ["todas", "Todas"],
                ["nao_lidas", "Não lidas"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                  filter === id
                    ? "bg-brand text-white"
                    : "bg-white border border-slate-200 text-slate-600"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <Card className="p-12 text-center text-slate-400">
              <Icon name="bell" className="w-10 h-10 mx-auto mb-3 opacity-40" />
              Nenhuma notificação encontrada.
            </Card>
          ) : (
            <Card className="divide-y divide-slate-100">
              {filtered.map((n) => (
                <button
                  key={n.id}
                  onClick={() => openDetail(n.id)}
                  className={`w-full text-left px-4 py-4 hover:bg-slate-50 transition ${
                    !n.read ? "bg-emerald-50/40" : ""
                  } ${selectedId === n.id ? "ring-2 ring-inset ring-brand/30" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-brand mt-2 shrink-0" aria-hidden />
                    )}
                    <div className={`flex-1 min-w-0 ${n.read ? "ml-5" : ""}`}>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${notificationTypeStyles[n.type]}`}
                        >
                          {notificationTypeLabel[n.type]}
                        </span>
                        <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                        {!n.read && <Badge color="green">Nova</Badge>}
                      </div>
                      <p className="font-medium text-slate-800">{n.title}</p>
                      <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                    </div>
                    <Icon name="chevron" className="w-4 h-4 text-slate-300 shrink-0 mt-1 -rotate-90" />
                  </div>
                </button>
              ))}
            </Card>
          )}
        </>
      )}

      {tab === "detalhes" && selected && (
        <Card>
          <NotificationDetail
            notification={selected}
            onBack={() => setTab("lista")}
            onMarkRead={() => markNotificationRead(selected.id)}
          />
        </Card>
      )}

      {tab === "detalhes" && !selected && (
        <Card className="p-12 text-center text-slate-400">
          Selecione uma notificação na aba Lista para ver os detalhes.
        </Card>
      )}
    </div>
  );
}
