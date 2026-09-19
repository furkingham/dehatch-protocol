"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Users, Clock, ArrowUpRight } from "lucide-react";
import { Project } from "@/types";

const CATEGORY_COLORS: Record<Project["category"], { bg: string; text: string }> = {
  "AI/ML": { bg: "rgba(139,92,246,0.12)", text: "#a78bfa" },
  DeFi: { bg: "rgba(59,130,246,0.12)", text: "#60a5fa" },
  EdTech: { bg: "rgba(34,197,94,0.12)", text: "#4ade80" },
  HealthTech: { bg: "rgba(239,68,68,0.12)", text: "#f87171" },
  GreenTech: { bg: "rgba(16,185,129,0.12)", text: "#34d399" },
  SaaS: { bg: "rgba(245,197,24,0.10)", text: "#f5c518" },
};

interface ProjectCardProps {
  project: Project;
  index: number;
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  const progress = Math.min((project.raised / project.goal) * 100, 100);
  const categoryStyle = CATEGORY_COLORS[project.category];
  const isAlmostFunded = progress >= 80;
  const isUrgent = project.daysLeft <= 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: "easeOut" }}
      whileHover={{ y: -3, transition: { duration: 0.18 } }}
      className="group relative flex flex-col h-full rounded-xl overflow-hidden cursor-pointer"
      style={{
        background: "var(--color-black-card)",
        border: "1px solid var(--color-black-border)",
      }}
    >
      <Link href={`/projects/${project.slug}`} className="flex flex-col h-full">
        {/* Top Row: emoji + name + category badge */}
        <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Emoji avatar */}
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
              style={{ background: categoryStyle.bg }}
            >
              {project.emoji ?? "🚀"}
            </div>
            <div className="min-w-0">
              <h3
                className="text-sm font-bold leading-tight truncate"
                style={{ fontFamily: "var(--font-display)", color: "var(--color-white)" }}
              >
                {project.name}
              </h3>
              {project.featured && (
                <span
                  className="text-xs font-medium"
                  style={{ color: "var(--color-yellow)" }}
                >
                  ★ Öne Çıkan
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span
              className="px-2 py-0.5 rounded-md text-xs font-medium"
              style={{ background: categoryStyle.bg, color: categoryStyle.text }}
            >
              {project.category}
            </span>
            {isUrgent && (
              <span
                className="px-2 py-0.5 rounded-md text-xs font-medium flex items-center gap-0.5"
                style={{ background: "rgba(239,68,68,0.12)", color: "#f87171" }}
              >
                <Clock size={9} />
                {project.daysLeft}g
              </span>
            )}
          </div>
        </div>

        {/* Tagline */}
        <div className="px-4 pb-3">
          <p
            className="text-xs leading-relaxed line-clamp-2"
            style={{ color: "var(--color-white-muted)" }}
          >
            {project.tagline}
          </p>
        </div>

        {/* Tags */}
        <div className="px-4 pb-3 flex flex-wrap gap-1">
          {project.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 rounded text-xs"
              style={{ background: "var(--color-black-muted)", color: "var(--color-white-dim)" }}
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Progress */}
        <div className="px-4 pb-4 mt-auto">
          <div className="flex justify-between items-baseline mb-1.5">
            <span
              className="text-base font-bold"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-white)" }}
            >
              {(project.raised / 1000).toFixed(1)}K
              <span className="text-xs font-normal ml-0.5" style={{ color: "var(--color-white-dim)" }}>
                / {(project.goal / 1000).toFixed(0)}K USDC
              </span>
            </span>
            <span
              className="text-xs font-bold"
              style={{ color: isAlmostFunded ? "var(--color-yellow)" : "var(--color-white-dim)" }}
            >
              %{Math.round(progress)}
            </span>
          </div>

          {/* Progress Track */}
          <div
            className="h-1 rounded-full overflow-hidden mb-3"
            style={{ background: "var(--color-black-muted)" }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                background: isAlmostFunded
                  ? "linear-gradient(90deg, var(--color-yellow-dark), var(--color-yellow))"
                  : "linear-gradient(90deg, #444, #666)",
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.7, delay: index * 0.05 + 0.25, ease: "easeOut" }}
            />
          </div>

          {/* Bottom stats */}
          <div
            className="flex items-center justify-between pt-2"
            style={{ borderTop: "1px solid var(--color-black-border)" }}
          >
            <div className="flex items-center gap-1" style={{ color: "var(--color-white-dim)" }}>
              <Users size={11} />
              <span className="text-xs">{project.backers}</span>
            </div>
            <div
              className="flex items-center gap-1"
              style={{ color: isUrgent ? "#f87171" : "var(--color-white-dim)" }}
            >
              <Clock size={11} />
              <span className="text-xs">{project.daysLeft}g kaldı</span>
            </div>
            <div
              className="flex items-center gap-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: "var(--color-yellow)" }}
            >
              İncele <ArrowUpRight size={11} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
