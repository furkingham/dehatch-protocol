"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { History, LogOut, UserRound } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

/**
 * Round person-icon button at the top right.
 * Signed out: opens the sign in / sign up window. Signed in: opens a small account menu.
 */
export default function UserMenu() {
  const { t } = useI18n();
  const { user, ready, openAuth, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const signedIn = ready && !!user;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => (signedIn ? setOpen((v) => !v) : openAuth("login"))}
        aria-label={signedIn ? user!.name : t("auth.button")}
        title={signedIn ? user!.name : t("auth.button")}
        aria-haspopup={signedIn ? "menu" : "dialog"}
        aria-expanded={signedIn ? open : undefined}
        data-testid="user-button"
        data-signed-in={signedIn}
        className="flex items-center justify-center rounded-full transition-all hover:opacity-90 active:scale-[0.96]"
        style={{
          width: 38,
          height: 38,
          background: signedIn ? "var(--color-yellow)" : "transparent",
          color: signedIn ? "var(--color-black)" : "var(--color-white)",
          border: signedIn ? "1px solid var(--color-yellow)" : "1px solid rgba(245,197,24,0.4)",
        }}
      >
        <UserRound size={18} strokeWidth={1.75} />
      </button>

      {signedIn && open && (
        <div
          role="menu"
          className="absolute right-0 rounded-2xl overflow-hidden"
          style={{ top: "calc(100% + 10px)", width: 260, background: "var(--color-black-card)", border: "1px solid var(--color-black-border)", boxShadow: "0 24px 64px rgba(0,0,0,0.6)", zIndex: 60 }}
        >
          <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--color-black-border)" }}>
            <p className="text-[11px] uppercase" style={{ color: "var(--color-white-dim)", letterSpacing: "0.12em" }}>
              {t("auth.menu.signedInAs")}
            </p>
            <p className="text-sm font-semibold truncate" style={{ color: "var(--color-white)", marginTop: "6px" }}>{user!.name}</p>
            <p className="text-xs truncate" style={{ color: "var(--color-white-muted)" }}>{user!.email}</p>
          </div>
          <Link
            href="/applications"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 text-sm transition-colors hover:bg-white/5"
            style={{ padding: "12px 18px", color: "var(--color-white-muted)" }}
          >
            <History size={15} /> {t("nav.history")}
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="w-full flex items-center gap-2.5 text-sm text-left transition-colors hover:bg-white/5"
            style={{ padding: "12px 18px", color: "#f87171", borderTop: "1px solid var(--color-black-border)" }}
          >
            <LogOut size={15} /> {t("auth.menu.signOut")}
          </button>
        </div>
      )}
    </div>
  );
}
