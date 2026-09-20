"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Trash2 } from "lucide-react";
import {
  clearApplications,
  listApplications,
  removeApplication,
  type StoredApplication,
} from "@/lib/applicationStore";
import { useI18n } from "@/lib/i18n";


export default function ApplicationHistoryPage() {
  const { t, locale } = useI18n();
  const fmtDate = (iso: string) => new Date(iso).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" });
  const fmtAmount = (v: string) => Number(v).toLocaleString(locale, { maximumFractionDigits: 7 });
  // null = not read yet (localStorage does not exist during server render)
  const [items, setItems] = useState<StoredApplication[] | null>(null);

  useEffect(() => setItems(listApplications()), []);

  const remove = (id: string) => {
    if (!window.confirm(t("app.confirmOne", id))) return;
    removeApplication(id);
    setItems(listApplications());
  };

  const clearAll = () => {
    if (!window.confirm(t("app.confirmAll"))) return;
    clearApplications();
    setItems([]);
  };

  return (
    <div style={{ background: "linear-gradient(180deg, var(--color-black) 0%, var(--color-black-soft) 100%)", minHeight: "100vh" }}>
      <div className="px-6" style={{ maxWidth: "860px", margin: "0 auto", padding: "56px 24px 96px" }}>
        <Link href="/" className="link-arrow" style={{ marginBottom: "32px" }}>
          <ArrowLeft size={14} strokeWidth={1.5} /> {t("app.home")}
        </Link>

        <div className="flex items-end justify-between flex-wrap gap-4" style={{ marginBottom: "40px" }}>
          <div>
            <h1 className="font-serif-display" style={{ fontSize: "clamp(36px, 5vw, 52px)", fontWeight: 500, lineHeight: 1.05, color: "var(--color-white)" }}>
              {t("app.title")}
            </h1>
            <p className="text-sm" style={{ color: "var(--color-white-muted)", marginTop: "10px" }}>
              {t("app.sub")}
            </p>
          </div>
          {items && items.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="text-xs rounded-full transition-colors hover:bg-[rgba(239,68,68,0.1)]"
              style={{ color: "#f87171", border: "1px solid rgba(239,68,68,0.3)", padding: "8px 16px" }}
            >
              {t("app.clear")}
            </button>
          )}
        </div>

        {items === null ? null : items.length === 0 ? (
          <div className="card-lux text-center" style={{ padding: "64px 24px" }}>
            <p className="font-serif-display" style={{ fontSize: "26px", color: "var(--color-white)" }}>{t("app.empty")}</p>
            <p className="text-sm" style={{ color: "var(--color-white-muted)", margin: "10px 0 28px" }}>
              {t("app.emptyHint")}
            </p>
            <Link
              href="/launch"
              className="inline-flex items-center gap-2 rounded-full font-semibold"
              style={{ background: "var(--color-yellow)", color: "var(--color-black)", padding: "11px 26px", fontSize: "13px" }}
            >
              {t("nav.apply")} <ArrowRight size={14} strokeWidth={1.5} />
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-6">
            {items.map((a) => {
              const { personal, team, project } = a.data;
              return (
                <li key={a.id} className="card-lux">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="min-w-0">
                      <p className="font-mono text-xs" style={{ color: "var(--color-yellow)" }}>
                        {a.id} <span style={{ color: "var(--color-white-dim)" }}>· {fmtDate(a.submittedAt)}</span>
                      </p>
                      <h2 className="text-lg font-semibold" style={{ color: "var(--color-white)", marginTop: "8px" }}>
                        {project.projectName}
                        <span style={{ color: "var(--color-white-dim)", fontWeight: 400 }}> — {project.category}</span>
                      </h2>
                      <p className="text-sm" style={{ color: "var(--color-white-muted)", marginTop: "4px" }}>
                        {personal.fullName} · {personal.university}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className="text-xs rounded-full"
                        style={{ border: "1px solid rgba(245,197,24,0.4)", color: "var(--color-yellow)", padding: "4px 12px" }}
                      >
                        {t("app.pending")}
                      </span>
                      <button
                        type="button"
                        onClick={() => remove(a.id)}
                        aria-label={t("app.deleteAria", a.id)}
                        className="p-1.5 rounded-lg transition-colors hover:bg-[rgba(239,68,68,0.1)]"
                        style={{ color: "#f87171" }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-2" style={{ margin: "28px 0 4px" }}>
                    <span className="font-serif-display" style={{ fontSize: "36px", lineHeight: 1, color: "var(--color-white)" }}>
                      {fmtAmount(project.goalAmount)}
                    </span>
                    <span className="text-sm" style={{ color: "var(--color-white-muted)" }}>
                      {t("app.goal", project.milestones.length)}
                    </span>
                  </div>

                  <details style={{ marginTop: "20px" }}>
                    <summary className="text-xs cursor-pointer select-none" style={{ color: "var(--color-white-muted)" }}>
                      {t("app.details")}
                    </summary>
                    <div className="text-sm flex flex-col gap-5" style={{ color: "var(--color-white-muted)", marginTop: "16px" }}>
                      <p>{project.tagline}</p>
                      <div>
                        <p className="text-xs uppercase" style={{ color: "var(--color-white-dim)", letterSpacing: "0.12em", marginBottom: "8px" }}>{t("app.stages")}</p>
                        <ol className="flex flex-col gap-2">
                          {project.milestones.map((m, i) => (
                            <li key={i} className="flex justify-between gap-4">
                              <span>{i + 1}. {m.title} <span style={{ color: "var(--color-white-dim)" }}>({m.date})</span></span>
                              <span style={{ color: "var(--color-white)" }}>{fmtAmount(m.amount)} USDC</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                      <div>
                        <p className="text-xs uppercase" style={{ color: "var(--color-white-dim)", letterSpacing: "0.12em", marginBottom: "8px" }}>{t("app.team")}</p>
                        <ul className="flex flex-col gap-1">
                          <li>{personal.fullName} <span style={{ color: "var(--color-white-dim)" }}>· {t("app.leader")} · {personal.email}</span></li>
                          {team.members.map((m, i) => (
                            <li key={i}>{m.name} <span style={{ color: "var(--color-white-dim)" }}>· {m.role} · {m.email}</span></li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </details>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
