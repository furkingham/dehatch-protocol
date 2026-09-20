"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Shield, Layers, Landmark } from "lucide-react";
import { mockProjects } from "@/lib/mockData";
import ProjectCard from "@/components/projects/ProjectCard";
import { useI18n } from "@/lib/i18n";

const FEATURES = [
  { icon: Shield, key: "contracts" },
  { icon: Layers, key: "milestone" },
  { icon: Landmark, key: "fiat" },
] as const;

// Show only featured projects on home (max 6), filled up with others
const featuredProjects = mockProjects.filter((p) => p.featured).slice(0, 6);
const homeProjects =
  featuredProjects.length >= 6
    ? featuredProjects
    : [
        ...featuredProjects,
        ...mockProjects.filter((p) => !p.featured).slice(0, 6 - featuredProjects.length),
      ];

const wrap = { maxWidth: "1200px", margin: "0 auto", padding: "0 32px" } as const;

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, ease: "easeOut" as const },
};

export default function HomePage() {
  const { t } = useI18n();

  return (
    <div
      style={{
        background: "linear-gradient(180deg, var(--color-black) 0%, var(--color-black-soft) 100%)",
        minHeight: "100vh",
      }}
    >
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ padding: "168px 0 176px" }}>
        <div
          className="absolute top-0 left-1/2 pointer-events-none"
          style={{
            width: "720px",
            height: "420px",
            borderRadius: "50%",
            background: "var(--color-yellow)",
            opacity: 0.05,
            filter: "blur(150px)",
            transform: "translateX(-50%)",
          }}
        />

        <div className="relative z-10 flex flex-col items-center text-center" style={wrap}>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="font-serif-display"
            style={{
              color: "var(--color-white)",
              fontSize: "clamp(56px, 9vw, 104px)",
              fontWeight: 500,
              lineHeight: 1,
              letterSpacing: "-0.015em",
            }}
          >
            Incubate.{" "}
            <em style={{ color: "var(--color-yellow)", fontWeight: 500 }}>Fund.</em> Hatch.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            style={{
              marginTop: "32px",
              maxWidth: "460px",
              fontSize: "17px",
              lineHeight: 1.65,
              color: "var(--color-white-muted)",
            }}
          >
            {t("home.subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.28 }}
            className="flex items-center justify-center gap-4 flex-wrap"
            style={{ marginTop: "52px" }}
          >
            <Link
              href="/projects"
              className="inline-flex items-center rounded-full font-semibold whitespace-nowrap transition-opacity hover:opacity-90"
              style={{
                background: "var(--color-yellow)",
                color: "var(--color-black)",
                padding: "11px 26px",
                fontSize: "13px",
                letterSpacing: "0.02em",
              }}
            >
              {t("nav.explore")}
            </Link>
            <Link
              href="/launch"
              className="inline-flex items-center gap-2 rounded-full font-semibold whitespace-nowrap transition-colors hover:bg-[var(--color-yellow-glow)]"
              style={{
                color: "var(--color-yellow)",
                border: "1px solid rgba(245,197,24,0.45)",
                padding: "11px 26px",
                fontSize: "13px",
                letterSpacing: "0.02em",
              }}
            >
              {t("nav.apply")}
              <ArrowRight size={14} strokeWidth={1.5} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Featured Projects ────────────────────────────────────────── */}
      <section style={{ ...wrap, paddingBottom: "176px" }}>
        <motion.div {...fadeUp} className="flex items-end justify-between flex-wrap gap-4" style={{ marginBottom: "64px" }}>
          <h2
            className="font-serif-display"
            style={{ fontSize: "clamp(32px, 4vw, 44px)", fontWeight: 500, color: "var(--color-white)", lineHeight: 1.1 }}
          >
            {t("home.featured")}
          </h2>
          <Link href="/projects" className="link-arrow">
            {t("home.viewAll")} <ArrowRight size={14} strokeWidth={1.5} />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {homeProjects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </section>

      {/* ── Why DeHatch ──────────────────────────────────────────────── */}
      <section style={{ ...wrap, paddingBottom: "176px" }}>
        <motion.h2
          {...fadeUp}
          className="font-serif-display"
          style={{
            fontSize: "clamp(32px, 4vw, 44px)",
            fontWeight: 500,
            color: "var(--color-white)",
            lineHeight: 1.1,
            marginBottom: "64px",
          }}
        >
          {t("home.why")}
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.key}
              {...fadeUp}
              transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
              className="card-lux flex flex-col justify-between"
              style={{ minHeight: "320px" }}
            >
              <div className="flex items-start justify-between">
                <f.icon size={26} strokeWidth={1.25} style={{ color: "var(--color-yellow)" }} />
                <span className="font-serif-display" style={{ fontSize: "18px", color: "var(--color-white-dim)" }}>
                  0{i + 1}
                </span>
              </div>
              <div>
                <div className="h-px w-8" style={{ background: "var(--color-yellow)", opacity: 0.6, marginBottom: "24px" }} />
                <h3 className="font-serif-display" style={{ fontSize: "28px", fontWeight: 500, color: "var(--color-white)", lineHeight: 1.15 }}>
                  {t(`feat.${f.key}.title`)}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-white-muted)", marginTop: "12px" }}>
                  {t(`feat.${f.key}.desc`)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid var(--color-black-border)", padding: "36px 0" }}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4" style={wrap}>
          <p className="text-xs" style={{ color: "var(--color-white-dim)" }}>
            {t("footer.copy", new Date().getFullYear())}
          </p>
          <div className="flex items-center gap-8">
            <Link href="/applications" className="text-xs transition-colors hover:text-white" style={{ color: "var(--color-white-dim)" }}>
              {t("nav.history")}
            </Link>
            {(["privacy", "terms", "docs"] as const).map((item) => (
              <a key={item} href="#" className="text-xs transition-colors hover:text-white" style={{ color: "var(--color-white-dim)" }}>
                {t(`footer.${item}`)}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
