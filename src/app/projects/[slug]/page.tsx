"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Clock,
  CheckCircle2,
  Circle,
  Wallet,
  X,
  ChevronRight,
  TrendingUp,
  Zap,
  Info,
} from "lucide-react";
import { mockProjects } from "@/lib/mockData";
import InvestModal from "@/components/projects/InvestModal";
import { useI18n } from "@/lib/i18n";
import { localizeProject } from "@/lib/i18n/projectContent";

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  "AI/ML": { bg: "rgba(139,92,246,0.12)", text: "#a78bfa" },
  DeFi: { bg: "rgba(59,130,246,0.12)", text: "#60a5fa" },
  EdTech: { bg: "rgba(34,197,94,0.12)", text: "#4ade80" },
  HealthTech: { bg: "rgba(239,68,68,0.12)", text: "#f87171" },
  GreenTech: { bg: "rgba(16,185,129,0.12)", text: "#34d399" },
  SaaS: { bg: "rgba(245,197,24,0.10)", text: "#f5c518" },
};

// ── Project Detail Page ───────────────────────────────────────────────────────
export default function ProjectDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { t, lang, locale } = useI18n();
  const base = mockProjects.find((p) => p.slug === slug);
  const project = base ? localizeProject(base, lang) : undefined;
  const [showInvest, setShowInvest] = useState(false);

  if (!project) {
    notFound();
    return null;
  }

  const progress = Math.min((project.raised / project.goal) * 100, 100);
  const catStyle = CATEGORY_COLORS[project.category] ?? { bg: "#222", text: "#888" };
  const completedMilestones = project.milestones.filter((m) => m.completed).length;

  return (
    <>
      <div style={{ background: "var(--color-black)", minHeight: "100vh" }}>
        {/* Back nav */}
        <div
          className="sticky top-[72px] z-20 px-6 py-3 flex items-center gap-2"
          style={{
            background: "rgba(10,10,10,0.95)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid var(--color-black-border)",
          }}
        >
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm transition-colors"
            style={{ color: "var(--color-white-muted)" }}
          >
            <ArrowLeft size={15} />
            {t("detail.back")}
          </Link>
          <ChevronRight size={13} style={{ color: "var(--color-white-dim)" }} />
          <span className="text-sm" style={{ color: "var(--color-white)" }}>
            {project.name}
          </span>
        </div>

        {/* Main Content */}
        <div
          className="px-6 py-10"
          style={{ maxWidth: "1100px", margin: "0 auto" }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ── LEFT COLUMN ────────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-6">
              {/* ① Top-left: Project name + emblem */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-start gap-4"
              >
                {/* Big emoji emblem */}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                  style={{ background: catStyle.bg, border: `1px solid ${catStyle.text}30` }}
                >
                  {project.emoji ?? "🚀"}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h1
                      className="text-3xl font-bold"
                      style={{ fontFamily: "var(--font-display)", color: "var(--color-white)" }}
                    >
                      {project.name}
                    </h1>
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ background: catStyle.bg, color: catStyle.text }}
                    >
                      {project.category}
                    </span>
                    {project.featured && (
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ background: "var(--color-yellow-glow)", color: "var(--color-yellow)" }}
                      >
                        ★ {t("detail.featured")}
                      </span>
                    )}
                  </div>
                  <p className="text-base" style={{ color: "var(--color-white-muted)" }}>
                    {project.tagline}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded text-xs"
                        style={{ background: "var(--color-black-muted)", color: "var(--color-white-dim)" }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* ③ Team (below emblem) */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="p-5 rounded-2xl"
                style={{
                  background: "var(--color-black-card)",
                  border: "1px solid var(--color-black-border)",
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Users size={16} style={{ color: "var(--color-yellow)" }} />
                  <h2
                    className="text-base font-bold"
                    style={{ fontFamily: "var(--font-display)", color: "var(--color-white)" }}
                  >
                    {t("detail.team")}
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {project.team.map((member) => (
                    <div
                      key={member.name}
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: "var(--color-black-muted)" }}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                        style={{ background: catStyle.bg, color: catStyle.text }}
                      >
                        {member.avatar}
                      </div>
                      <div className="min-w-0">
                        <p
                          className="text-sm font-semibold truncate"
                          style={{ color: "var(--color-white)" }}
                        >
                          {member.name}
                        </p>
                        <p
                          className="text-xs truncate"
                          style={{ color: "var(--color-white-dim)" }}
                        >
                          {member.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Milestones */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="p-5 rounded-2xl"
                style={{
                  background: "var(--color-black-card)",
                  border: "1px solid var(--color-black-border)",
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2
                    className="text-base font-bold"
                    style={{ fontFamily: "var(--font-display)", color: "var(--color-white)" }}
                  >
                    {t("detail.roadmap")}
                  </h2>
                  <span className="text-xs" style={{ color: "var(--color-white-dim)" }}>
                    {t("detail.done", completedMilestones, project.milestones.length)}
                  </span>
                </div>
                <div className="space-y-3">
                  {project.milestones.map((m, i) => (
                    <div
                      key={m.id}
                      className="flex gap-3 p-3 rounded-xl"
                      style={{
                        background: m.completed ? "rgba(34,197,94,0.05)" : "var(--color-black-muted)",
                        border: m.completed
                          ? "1px solid rgba(34,197,94,0.2)"
                          : "1px solid var(--color-black-border)",
                      }}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {m.completed ? (
                          <CheckCircle2 size={18} style={{ color: "var(--color-success)" }} />
                        ) : (
                          <Circle
                            size={18}
                            style={{
                              color: i === completedMilestones ? "var(--color-yellow)" : "var(--color-white-dim)",
                            }}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className="text-sm font-semibold"
                            style={{
                              color: m.completed ? "var(--color-white)" : i === completedMilestones ? "var(--color-yellow)" : "var(--color-white-muted)",
                            }}
                          >
                            {t("detail.stage", i + 1, m.title)}
                          </p>
                          <span
                            className="text-xs flex-shrink-0"
                            style={{ color: "var(--color-white-dim)" }}
                          >
                            {(m.targetAmount / 1000).toFixed(0)}K USDC
                          </span>
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: "var(--color-white-dim)" }}>
                          {m.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* ④ How it works (bottom-right of left col) */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="p-5 rounded-2xl"
                style={{
                  background: "var(--color-black-card)",
                  border: "1px solid var(--color-black-border)",
                }}
              >
                <h2
                  className="text-base font-bold mb-3"
                  style={{ fontFamily: "var(--font-display)", color: "var(--color-white)" }}
                >
                  {t("detail.how")}
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-white-muted)" }}>
                  {project.howItWorks ?? project.description}
                </p>
              </motion.div>
            </div>

            {/* ── RIGHT COLUMN: short description + sticky invest panel ── */}
            <div className="space-y-4">
              {/* ② Short description (top-right) */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
                className="p-5 rounded-2xl"
                style={{
                  background: "var(--color-black-card)",
                  border: "1px solid var(--color-black-border)",
                }}
              >
                <h2
                  className="text-sm font-bold mb-2"
                  style={{ fontFamily: "var(--font-display)", color: "var(--color-white)" }}
                >
                  {t("detail.about")}
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-white-muted)" }}>
                  {project.description}
                </p>
              </motion.div>

              {/* Sticky Invest Panel */}
              <div className="lg:sticky lg:top-32">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="p-5 rounded-2xl"
                  style={{
                    background: "var(--color-black-card)",
                    border: "1px solid var(--color-black-border)",
                  }}
                >
                  {/* Stats */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span style={{ color: "var(--color-white-dim)" }}>{t("detail.raised")}</span>
                      <span className="font-bold" style={{ color: "var(--color-white)" }}>
                        {project.raised.toLocaleString(locale)} USDC
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: "var(--color-white-dim)" }}>{t("detail.goal")}</span>
                      <span style={{ color: "var(--color-white-muted)" }}>
                        {project.goal.toLocaleString(locale)} USDC
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div
                      className="h-2 rounded-full overflow-hidden"
                      style={{ background: "var(--color-black-muted)" }}
                    >
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background: progress >= 80
                            ? "linear-gradient(90deg, var(--color-yellow-dark), var(--color-yellow))"
                            : "linear-gradient(90deg, #444, #666)",
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>

                    <div className="flex justify-between text-xs">
                      <span style={{ color: progress >= 80 ? "var(--color-yellow)" : "var(--color-white-dim)" }}>
                        {t("detail.funded", Math.round(progress))}
                      </span>
                      <span style={{ color: "var(--color-white-dim)" }}>
                        {t("detail.backers", project.backers)}
                      </span>
                    </div>
                  </div>

                  <div
                    className="flex items-center justify-between py-3 mb-4"
                    style={{ borderTop: "1px solid var(--color-black-border)", borderBottom: "1px solid var(--color-black-border)" }}
                  >
                    <div className="flex items-center gap-1.5" style={{ color: "var(--color-white-dim)" }}>
                      <Clock size={14} />
                      <span className="text-sm">{t("detail.timeLeft")}</span>
                    </div>
                    <span
                      className="text-sm font-bold"
                      style={{ color: project.daysLeft <= 5 ? "#f87171" : "var(--color-white)" }}
                    >
                      {t("detail.days", project.daysLeft)}
                    </span>
                  </div>

                  {/* Invest button */}
                  <p
                    className="text-xs text-center mb-3 font-medium"
                    style={{ color: "var(--color-white-muted)" }}
                  >
                    {t("detail.investTitle")}
                  </p>
                  <motion.button
                    onClick={() => setShowInvest(true)}
                    className="w-full py-3.5 rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-all"
                    style={{
                      background: "var(--color-yellow)",
                      color: "var(--color-black)",
                      boxShadow: "0 4px 20px var(--color-yellow-glow)",
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <TrendingUp size={17} />
                    {t("detail.support")}
                  </motion.button>

                  <p className="text-xs text-center mt-3" style={{ color: "var(--color-white-dim)" }}>
                    {t("detail.safe")}
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showInvest && (
          <InvestModal project={project} onClose={() => setShowInvest(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
