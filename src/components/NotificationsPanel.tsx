"use client";

import { useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/store";
import {
  notificationTypeLabel,
  notificationTypeStyles,
} from "@/lib/notifications-ui";
import { NotificationDetail } from "@/components/notifications/NotificationDetail";
import { Icon } from "@/components/Icon";
import { DropdownPanel } from "@/components/DropdownPanel";

type Tab = "lista" | "detalhes";

export function NotificationsPanel() {
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead } =
    useApp();

  const [tab, setTab] = useState<Tab>("lista");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = notifications.find((n) => n.id === selectedId) ?? null;

  const openDetail = (id: string) => {
    setSelectedId(id);
    setTab("detalhes");
    markNotificationRead(id);
  };

  const backToList = () => {
    setTab("lista");
  };

  return (
    <DropdownPanel
      width="w-96"
      trigger={({ open, toggle }) => (
        <button
          onClick={toggle}
          aria-expanded={open}
          aria-label={`Notificações${unreadCount ? `, ${unreadCount} não lidas` : ""}`}
          className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition"
        >
          <Icon name="bell" className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold grid place-items-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      )}
    >
      {({ close }) => (
        <>
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <h3 className="font-semibold text-slate-800">Notificações</h3>
        {tab === "lista" && unreadCount > 0 && (
          <button
            onClick={markAllNotificationsRead}
            className="text-xs font-medium text-brand hover:underline"
          >
            Marcar todas como lidas
          </button>
        )}
      </div>

      <div className="flex gap-1 px-4 pt-2 border-b border-slate-100">
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
            className={`px-3 py-2 text-xs font-medium border-b-2 -mb-px transition ${
              tab === id
                ? "border-brand text-brand"
                : "border-transparent text-slate-500 hover:text-slate-800"
            } ${id === "detalhes" && !selected ? "opacity-40 cursor-not-allowed" : ""}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "lista" && (
        <ul className="max-h-80 overflow-y-auto divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-slate-400">
              Nenhuma notificação no momento.
            </li>
          ) : (
            notifications.map((n) => (
              <li key={n.id}>
                <button
                  onClick={() => openDetail(n.id)}
                  className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition ${
                    !n.read ? "bg-emerald-50/40" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-brand mt-2 shrink-0" aria-hidden />
                    )}
                    <div className={`flex-1 min-w-0 ${n.read ? "ml-5" : ""}`}>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${notificationTypeStyles[n.type]}`}
                        >
                          {notificationTypeLabel[n.type]}
                        </span>
                        <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-800">{n.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-snug line-clamp-2">
                        {n.message}
                      </p>
                    </div>
                  </div>
                </button>
              </li>
            ))
          )}
        </ul>
      )}

      {tab === "detalhes" && selected && (
        <div className="max-h-96 overflow-y-auto">
          <NotificationDetail
            notification={selected}
            onBack={backToList}
            onMarkRead={() => markNotificationRead(selected.id)}
            onNavigate={close}
            compact
          />
        </div>
      )}

      {tab === "detalhes" && !selected && (
        <div className="px-4 py-8 text-center text-sm text-slate-400">
          Selecione uma notificação na lista.
        </div>
      )}

      <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
        <Link
          href={selected ? `/notificacoes?id=${selected.id}` : "/notificacoes"}
          className="text-xs font-medium text-brand hover:underline"
        >
          Ver todas as notificações
        </Link>
      </div>
        </>
      )}
    </DropdownPanel>
  );
}
