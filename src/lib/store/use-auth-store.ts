"use client";

import { useCallback, useEffect, useState } from "react";
import * as seed from "../mock-data";
import type { User, UserPreferences } from "../types";
import type { AppState, AuthState } from "./types";
import {
  LEGACY_STORAGE_PREFS,
  LEGACY_STORAGE_USER,
  STORAGE_PREFS,
  STORAGE_USER,
  normalizeEmail,
} from "./shared";

function authStateFromSession(data: {
  id?: string;
  email: string;
  name?: string;
  role: AuthState["role"];
  unitId?: AuthState["unitId"];
  avatarColor?: string;
  provider?: AuthState["authProvider"];
}): AuthState {
  const email = normalizeEmail(data.email);
  const existing = seed.users.find((u) => u.email === email);
  return {
    id: data.id ?? existing?.id ?? "guest",
    name: data.name ?? existing?.name ?? email.split("@")[0],
    email,
    role: data.role,
    unitId: data.unitId ?? existing?.unitId ?? "matriz",
    avatarColor: data.avatarColor ?? existing?.avatarColor ?? "#2563eb",
    authProvider: data.provider ?? "password",
  };
}

export function useAuthStore(_users: User[]) {
  const [currentUser, setCurrentUser] = useState<AuthState | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    if (typeof window === "undefined") return seed.defaultPreferences;
    try {
      const prefs =
        localStorage.getItem(STORAGE_PREFS) ??
        localStorage.getItem(LEGACY_STORAGE_PREFS);
      if (!prefs) return seed.defaultPreferences;
      const parsed = JSON.parse(prefs) as UserPreferences;
      if (localStorage.getItem(LEGACY_STORAGE_PREFS)) {
        localStorage.setItem(STORAGE_PREFS, prefs);
        localStorage.removeItem(LEGACY_STORAGE_PREFS);
      }
      return parsed;
    } catch {
      return seed.defaultPreferences;
    }
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/session", { credentials: "same-origin" });
        const data = (await res.json()) as {
          authenticated?: boolean;
          id?: string;
          email?: string;
          name?: string;
          role?: AuthState["role"];
          unitId?: AuthState["unitId"];
          avatarColor?: string;
          provider?: AuthState["authProvider"];
        };
        if (cancelled) return;
        if (data.authenticated && data.email && data.role) {
          const u = authStateFromSession({
            id: data.id,
            email: data.email,
            name: data.name,
            role: data.role,
            unitId: data.unitId,
            avatarColor: data.avatarColor,
            provider: data.provider,
          });
          setCurrentUser(u);
          localStorage.setItem(STORAGE_USER, JSON.stringify(u));
          localStorage.removeItem(LEGACY_STORAGE_USER);
          return;
        }
        localStorage.removeItem(STORAGE_USER);
        localStorage.removeItem(LEGACY_STORAGE_USER);
        setCurrentUser(null);
      } catch {
        if (!cancelled) setCurrentUser(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const login: AppState["login"] = useCallback(
    async (email, options) => {
      const normalized = normalizeEmail(email);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          email: normalized,
          password: options?.password,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error || "Falha ao autenticar");
      }
      const data = (await res.json()) as {
        id?: string;
        email: string;
        name: string;
        role: AuthState["role"];
        unitId?: AuthState["unitId"];
        avatarColor?: string;
        provider?: AuthState["authProvider"];
      };
      const u = authStateFromSession({
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
        unitId: data.unitId,
        avatarColor: data.avatarColor,
        provider: data.provider ?? options?.provider ?? "password",
      });
      setCurrentUser(u);
      try {
        localStorage.setItem(STORAGE_USER, JSON.stringify(u));
      } catch {
        /* ignore */
      }
    },
    []
  );

  const logout = useCallback(async () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(STORAGE_USER);
      localStorage.removeItem(LEGACY_STORAGE_USER);
    } catch {
      /* ignore */
    }
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      const data = (await res.json().catch(() => null)) as {
        microsoftLogoutUrl?: string;
      } | null;
      if (data?.microsoftLogoutUrl) {
        window.location.href = data.microsoftLogoutUrl;
        return;
      }
    } catch {
      /* ignore */
    }
  }, []);

  const updatePreferences: AppState["updatePreferences"] = useCallback((p) => {
    setPreferences((prev) => {
      const next = { ...prev, ...p };
      try {
        localStorage.setItem(STORAGE_PREFS, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return {
    currentUser,
    preferences,
    login,
    logout,
    updatePreferences,
  };
}
