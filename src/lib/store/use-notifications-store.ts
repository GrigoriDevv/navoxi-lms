"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import * as seed from "../mock-data";
import type { Notification } from "../types";
import { isJavaApiEnabled } from "../api-config";
import { lmsApi } from "../api-client";
import type { AppState, AuthState } from "./types";

type LogFn = AppState["log"];

export function useNotificationsStore(
  currentUser: AuthState | null,
  log: LogFn
) {
  const [notifications, setNotifications] = useState<Notification[]>(
    seed.notifications
  );

  useEffect(() => {
    if (!isJavaApiEnabled() || !currentUser?.email) return;
    let cancelled = false;
    void lmsApi
      .listMyNotifications()
      .then((apiNotifications) => {
        if (cancelled) return;
        setNotifications(apiNotifications);
      })
      .catch((err) => {
        console.error("[lms-api] falha ao carregar notificações", err);
      });
    return () => {
      cancelled = true;
    };
  }, [currentUser?.email, currentUser?.id]);

  const refreshNotifications = useCallback(async () => {
    if (!isJavaApiEnabled()) return;
    const notes = await lmsApi.listMyNotifications();
    setNotifications(notes);
  }, []);

  const dispatchNotification: AppState["dispatchNotification"] = useCallback(
    (n) => {
      const userId = n.userId ?? currentUser?.id;
      if (!userId) return;
      setNotifications((prev) => [
        {
          ...n,
          userId,
          id: "n" + Math.random().toString(36).slice(2, 7),
          read: false,
          timestamp: "Agora",
        },
        ...prev,
      ]);
      log({
        user: currentUser?.email ?? "system",
        action: `Disparou notificação '${n.title}'`,
        module: "Comunicação",
        severity: "info",
      });
    },
    [currentUser, log]
  );

  const markNotificationRead: AppState["markNotificationRead"] = useCallback(
    async (id) => {
      if (isJavaApiEnabled()) {
        try {
          const updated = await lmsApi.markNotificationRead(id);
          setNotifications((prev) =>
            prev.map((n) => (n.id === id ? updated : n))
          );
        } catch (err) {
          console.error("[lms-api] markNotificationRead", err);
        }
        return;
      }
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    },
    []
  );

  const markAllNotificationsRead: AppState["markAllNotificationsRead"] =
    useCallback(async () => {
      if (!currentUser) return;
      if (isJavaApiEnabled()) {
        try {
          await lmsApi.markAllNotificationsRead();
          setNotifications((prev) =>
            prev.map((n) =>
              n.userId === currentUser.id ? { ...n, read: true } : n
            )
          );
        } catch (err) {
          console.error("[lms-api] markAllNotificationsRead", err);
        }
        return;
      }
      setNotifications((prev) =>
        prev.map((n) =>
          n.userId === currentUser.id ? { ...n, read: true } : n
        )
      );
    }, [currentUser]);

  const myNotifications = useMemo(
    () =>
      currentUser
        ? notifications.filter((n) => n.userId === currentUser.id)
        : [],
    [notifications, currentUser]
  );

  const unreadCount = myNotifications.filter((n) => !n.read).length;

  return {
    notifications,
    setNotifications,
    myNotifications,
    unreadCount,
    dispatchNotification,
    markNotificationRead,
    markAllNotificationsRead,
    refreshNotifications,
  };
}
