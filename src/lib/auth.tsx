"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  clearSession,
  getSessionUser,
  loginUser,
  registerUser,
  type AuthUser,
} from "@/lib/authStore";

export type AuthMode = "login" | "register";

interface AuthValue {
  user: AuthUser | null;
  /** false until the saved session has been read (localStorage does not exist during server render) */
  ready: boolean;
  register: (input: { name: string; email: string; password: string }) => Promise<void>;
  login: (input: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  /** Open the sign in / sign up window. `onSuccess` runs after the user signs in or registers. */
  openAuth: (mode?: AuthMode, onSuccess?: () => void) => void;
  closeAuth: () => void;
  /** Run `action` now if signed in; otherwise ask the user to sign in first and then run it. */
  requireAuth: (action: () => void) => void;
  modal: { open: boolean; mode: AuthMode };
  setModalMode: (mode: AuthMode) => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);
  const [modal, setModal] = useState<{ open: boolean; mode: AuthMode }>({ open: false, mode: "login" });
  const pending = useRef<(() => void) | null>(null);

  useEffect(() => {
    setUser(getSessionUser());
    setReady(true);
    // keep several tabs in sync (sign in / out in one tab updates the others)
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === "dehatch_session" || e.key === "dehatch_users") setUser(getSessionUser());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const finish = useCallback((u: AuthUser) => {
    setUser(u);
    setModal((m) => ({ ...m, open: false }));
    const next = pending.current;
    pending.current = null;
    next?.();
  }, []);

  const register = useCallback(async (input: { name: string; email: string; password: string }) => {
    finish(await registerUser(input));
  }, [finish]);

  const login = useCallback(async (input: { email: string; password: string }) => {
    finish(await loginUser(input));
  }, [finish]);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const openAuth = useCallback((mode: AuthMode = "login", onSuccess?: () => void) => {
    pending.current = onSuccess ?? null;
    setModal({ open: true, mode });
  }, []);

  const closeAuth = useCallback(() => {
    pending.current = null;
    setModal((m) => ({ ...m, open: false }));
  }, []);

  const requireAuth = useCallback(
    (action: () => void) => {
      if (user) action();
      else openAuth("login", action);
    },
    [user, openAuth],
  );

  const value = useMemo<AuthValue>(
    () => ({
      user,
      ready,
      register,
      login,
      logout,
      openAuth,
      closeAuth,
      requireAuth,
      modal,
      setModalMode: (mode) => setModal((m) => ({ ...m, mode })),
    }),
    [user, ready, register, login, logout, openAuth, closeAuth, requireAuth, modal],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
