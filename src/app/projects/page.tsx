"use client";

import { motion } from "framer-motion";
import { mockProjects } from "@/lib/mockData";
import ProjectGrid from "@/components/projects/ProjectGrid";
import { Egg, TrendingUp, Users, Clock } from "lucide-react";
import Link from "next/link";

export default function ProjectsPage() {
  const totalRaised = mockProjects.reduce((a, p) => a + p.raised, 0);
  const totalBackers = mockProjects.reduce((a, p) => a + p.backers, 0);

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
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--color-yellow)" }}>
              <Egg size={14} style={{ color: "var(--color-black)" }} />
            </div>
            <span className="text-base font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--color-white)" }}>
              De<span style={{ color: "var(--color-yellow)" }}>Hatch</span>
            </span>
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--color-yellow)" }}>
            Tüm Kampanyalar
          </p>
          <h1 className="text-4xl font-bold mb-3" style={{ fontFamily: "var(--font-display)", color: "var(--color-white)" }}>
            Projeleri Keşfet
          </h1>
          <p className="text-base mb-8" style={{ color: "var(--color-white-muted)" }}>
            Stellar ağında fonlanan öğrenci girişimlerini destekle, geleceği birlikte inşa et.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 p-5 rounded-2xl" style={{ background: "var(--color-black-card)", border: "1px solid var(--color-black-border)", maxWidth: "480px" }}>
            {[
              { icon: <TrendingUp size={16} />, label: "Toplam Fonlanan", value: `${(totalRaised / 1000).toFixed(1)}K USDC` },
              { icon: <Users size={16} />, label: "Destekçi", value: totalBackers.toLocaleString() },
              { icon: <Clock size={16} />, label: "Aktif Proje", value: mockProjects.length },
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
        <ProjectGrid projects={mockProjects} />
      </div>
    </div>
  );
}
