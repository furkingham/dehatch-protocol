"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Project } from "@/types";
import { useI18n } from "@/lib/i18n";

interface ProjectCardProps {
  project: Project;
  index: number;
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  const { t, locale } = useI18n();
  const progress = Math.min((project.raised / project.goal) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: "easeOut" }}
      className="group h-full"
    >
      <Link href={`/projects/${project.slug}`} className="card-lux flex flex-col h-full">
        <h3 className="text-[15px] font-medium leading-snug" style={{ color: "var(--color-white)" }}>
          {project.name}
          <span style={{ color: "var(--color-white-dim)" }}> — {project.category}</span>
        </h3>

        <div className="flex items-baseline gap-2.5" style={{ margin: "56px 0 20px" }}>
          <span
            className="font-serif-display"
            style={{ fontSize: "46px", fontWeight: 500, lineHeight: 1, color: "var(--color-white)" }}
          >
            {(project.raised / 1000).toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}K
          </span>
          <span className="text-[13px]" style={{ color: "var(--color-white-muted)" }}>
            {t("card.funded")}
          </span>
        </div>

        <div className="h-[3px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, var(--color-yellow-dark), var(--color-yellow-light))" }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.9, delay: index * 0.06 + 0.25, ease: "easeOut" }}
          />
        </div>

        <span className="link-arrow" style={{ marginTop: "40px" }}>
          {t("card.details")} <ArrowRight size={14} strokeWidth={1.5} />
        </span>
      </Link>
    </motion.div>
  );
}
