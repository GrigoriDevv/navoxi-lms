"use client";

import { useRouter } from "next/navigation";
import type { Notification } from "@/lib/types";
import {
  notificationTypeLabel,
  notificationTypeStyles,
} from "@/lib/notifications-ui";
import { Badge, Button } from "@/components/ui";
import { Icon } from "@/components/Icon";

function actionLabel(href: string) {
  if (href.includes("solicitacoes")) return "Ir para solicitações";
  if (href.includes("tab=inscricoes")) return "Ir para inscrições";
  return "Ir para o conteúdo";
}

export function NotificationDetail({
  notification,
  onBack,
  onMarkRead,
  onNavigate,
  compact,
}: {
  notification: Notification;
  onBack?: () => void;
  onMarkRead?: () => void;
  onNavigate?: () => void;
  compact?: boolean;
}) {
  const router = useRouter();

  const goToContent = () => {
    if (!notification.href) return;
    onNavigate?.();
    router.push(notification.href);
  };
  return (
    <div className={compact ? "px-4 py-3" : "p-6"}>
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 mb-3"
        >
          <Icon name="chevron" className="w-4 h-4 rotate-180" />
          Voltar à lista
        </button>
      )}

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span
          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${notificationTypeStyles[notification.type]}`}
        >
          {notificationTypeLabel[notification.type]}
        </span>
        <Badge color={notification.read ? "slate" : "green"}>
          {notification.read ? "Lida" : "Não lida"}
        </Badge>
        {notification.module && (
          <span className="text-[10px] text-slate-400">{notification.module}</span>
        )}
      </div>

      <h2 className={`font-semibold text-slate-800 ${compact ? "text-base" : "text-xl"}`}>
        {notification.title}
      </h2>
      <p className="text-xs text-slate-400 mt-1">{notification.timestamp}</p>

      <div className={`mt-4 space-y-3 ${compact ? "text-sm" : ""}`}>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">
            Resumo
          </h3>
          <p className="text-slate-700 leading-relaxed">{notification.message}</p>
        </div>
        {notification.details && notification.details !== notification.message && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">
              Detalhes
            </h3>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line">
              {notification.details}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-slate-100">
        {notification.href && (
          <Button onClick={goToContent}>
            {actionLabel(notification.href)}
          </Button>
        )}
        {!notification.read && onMarkRead && (
          <Button variant="outline" onClick={onMarkRead}>
            Marcar como lida
          </Button>
        )}
      </div>
    </div>
  );
}
