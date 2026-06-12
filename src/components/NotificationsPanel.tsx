"use client";

import Link from "next/link";
import { useApp } from "@/lib/store";
import { Icon } from "@/components/Icon";
import { DropdownPanel } from "@/components/DropdownPanel";

const typeStyles = {
  info: "bg-blue-100 text-blue-700",
  alerta: "bg-amber-100 text-amber-700",
  curso: "bg-emerald-100 text-emerald-700",
  prazo: "bg-red-100 text-red-700",
} as const;

const typeLabel = {
  info: "Info",
  alerta: "Alerta",
  curso: "Curso",
  prazo: "Prazo",
} as const;

export function NotificationsPanel() {
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead } =
    useApp();

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
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <h3 className="font-semibold text-slate-800">Notificações</h3>
        {unreadCount > 0 && (
          <button
            onClick={markAllNotificationsRead}
            className="text-xs font-medium text-brand hover:underline"
          >
            Marcar todas como lidas
          </button>
        )}
      </div>

      <ul className="max-h-80 overflow-y-auto divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <li className="px-4 py-8 text-center text-sm text-slate-400">
            Nenhuma notificação no momento.
          </li>
        ) : (
          notifications.map((n) => (
            <li
              key={n.id}
              className={`px-4 py-3 hover:bg-slate-50 transition ${!n.read ? "bg-emerald-50/40" : ""}`}
            >
              <div className="flex items-start gap-3">
                {!n.read && (
                  <span className="w-2 h-2 rounded-full bg-brand mt-2 shrink-0" aria-hidden />
                )}
                <div className={`flex-1 min-w-0 ${n.read ? "ml-5" : ""}`}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${typeStyles[n.type]}`}>
                      {typeLabel[n.type]}
                    </span>
                    <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-800">{n.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-snug">{n.message}</p>
                  <div className="flex items-center gap-3 mt-2">
                    {n.href && (
                      <Link
                        href={n.href}
                        className="text-xs font-medium text-brand hover:underline"
                      >
                        Ver detalhes
                      </Link>
                    )}
                    {!n.read && (
                      <button
                        onClick={() => markNotificationRead(n.id)}
                        className="text-xs text-slate-400 hover:text-slate-600"
                      >
                        Marcar como lida
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </DropdownPanel>
  );
}
