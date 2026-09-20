"use client";

import { Lock } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

/** Shown instead of protected content when nobody is signed in. */
export default function AuthGate({
  kind,
  compact = false,
}: {
  kind: "apply" | "invest" | "history";
  compact?: boolean;
}) {
  const { t } = useI18n();
  const { openAuth } = useAuth();

  const body = (
    <div className="text-center" data-testid="auth-gate">
      <div
        className="mx-auto flex items-center justify-center rounded-full"
        style={{ width: 56, height: 56, background: "var(--color-yellow-glow)", border: "1px solid rgba(245,197,24,0.35)", marginBottom: "20px" }}
      >
        <Lock size={22} style={{ color: "var(--color-yellow)" }} />
      </div>
      <h2 className="font-serif-display" style={{ fontSize: compact ? "24px" : "32px", fontWeight: 500, lineHeight: 1.15, color: "var(--color-white)" }}>
        {t(`gate.${kind}.title`)}
      </h2>
      <p className="text-sm" style={{ color: "var(--color-white-muted)", margin: "10px auto 24px", maxWidth: "380px" }}>
        {t(`gate.${kind}.body`)}
      </p>
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={() => openAuth("login")}
          className="rounded-full font-semibold transition-opacity hover:opacity-90"
          style={{ background: "var(--color-yellow)", color: "var(--color-black)", padding: "11px 28px", fontSize: "13px" }}
        >
          {t("auth.tab.login")}
        </button>
        <button
          type="button"
          onClick={() => openAuth("register")}
          className="rounded-full font-semibold transition-colors hover:bg-[var(--color-yellow-glow)]"
          style={{ color: "var(--color-yellow)", border: "1px solid rgba(245,197,24,0.45)", padding: "11px 28px", fontSize: "13px" }}
        >
          {t("auth.tab.register")}
        </button>
      </div>
    </div>
  );

  if (compact) return <div style={{ padding: "8px 0" }}>{body}</div>;
  return (
    <div className="px-6" style={{ maxWidth: "560px", margin: "0 auto", padding: "96px 24px" }}>
      <div className="card-lux">{body}</div>
    </div>
  );
}
