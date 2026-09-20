"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { mockProjects } from "@/lib/mockData";
import ProjectGrid from "@/components/projects/ProjectGrid";
import Logo from "@/components/layout/Logo";
import { TrendingUp, Users, Clock } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { localizeProject } from "@/lib/i18n/projectContent";

export default function ProjectsPage() {
  const { t, lang, locale } = useI18n();
  const projects = useMemo(() => mockProjects.map((p) => localizeProject(p, lang)), [lang]);
  const totalRaised = projects.reduce((a, p) => a + p.raised, 0);
  const totalBackers = projects.reduce((a, p) => a + p.backers, 0);

  return (
    <div style={{ background: "var(--color-black)", minHeight: "100vh" }}>
      {/* Header */}
      <div
        className="px-6 py-10"
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          borderBottom: "1px solid var(--color-black-border)",
        }}
      >
        <div className="flex items-center gap-2 mb-6">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={30} />
            <span className="text-base font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--color-white)" }}>
              De<span style={{ color: "var(--color-yellow)" }}>Hatch</span>
            </span>
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--color-yellow)" }}>
            {t("projects.eyebrow")}
          </p>
          <h1 className="text-4xl font-bold mb-3" style={{ fontFamily: "var(--font-display)", color: "var(--color-white)" }}>
            {t("projects.title")}
          </h1>
          <p className="text-base mb-8" style={{ color: "var(--color-white-muted)" }}>
            {t("projects.subtitle")}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 p-5 rounded-2xl" style={{ background: "var(--color-black-card)", border: "1px solid var(--color-black-border)", maxWidth: "480px" }}>
            {[
              { icon: <TrendingUp size={16} />, label: t("projects.stat.raised"), value: `${(totalRaised / 1000).toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}K USDC` },
              { icon: <Users size={16} />, label: t("projects.stat.backers"), value: totalBackers.toLocaleString(locale) },
              { icon: <Clock size={16} />, label: t("projects.stat.active"), value: projects.length },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="flex justify-center mb-1" style={{ color: "var(--color-yellow)" }}>{s.icon}</div>
                <p className="text-lg font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--color-white)" }}>{s.value}</p>
                <p className="text-xs" style={{ color: "var(--color-white-dim)" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Projects Grid */}
      <div className="px-6 py-10" style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <ProjectGrid projects={projects} />
      </div>
    </div>
  );
}
