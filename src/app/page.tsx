"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Egg, Shield, Zap, Globe, Compass } from "lucide-react";
import { mockProjects } from "@/lib/mockData";
import ProjectCard from "@/components/projects/ProjectCard";

const FEATURES = [
  {
    icon: <Shield size={20} />,
    title: "Soroban Akıllı Kontratlar",
    desc: "Tüm fonlar Stellar ağı üzerinde şeffaf ve otomatik akıllı kontratlarla yönetilir.",
  },
  {
    icon: <Zap size={20} />,
    title: "Milestone-Bazlı Fonlama",
    desc: "Fonlar aşama aşama serbest bırakılır — rug-pull riski sıfır, güven maksimum.",
  },
  {
    icon: <Globe size={20} />,
    title: "TRY'ye Köprü (SEP-24)",
    desc: "Fonlarınızı Stellar Anchor protokolü ile direkt banka hesabınıza TRY olarak çekin.",
  },
];

// Show only featured projects on home (max 6)
const featuredProjects = mockProjects.filter((p) => p.featured).slice(0, 6);
// If less than 6 featured, fill with others
const homeProjects =
  featuredProjects.length >= 6
    ? featuredProjects
    : [
        ...featuredProjects,
        ...mockProjects.filter((p) => !p.featured).slice(0, 6 - featuredProjects.length),
      ];

export default function HomePage() {
  return (
    <div style={{ background: "var(--color-black)", minHeight: "100vh" }}>
      {/* ── Hero Section ─────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ maxWidth: "1280px", margin: "0 auto", padding: "72px 24px 64px" }}
      >
        {/* Centered yellow glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            width: "800px",
            height: "500px",
            borderRadius: "50%",
            background: "var(--color-yellow)",
            opacity: 0.07,
            filter: "blur(140px)",
            transform: "translateX(-50%)",
          }}
        />

        {/* ── Centered hero text ──────────────────────────────────────── */}
        <div
          className="relative z-10 flex flex-col items-center text-center"
          style={{ maxWidth: "800px", margin: "0 auto" }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8"
            style={{
              background: "var(--color-yellow-glow)",
              border: "1px solid rgba(245,197,24,0.25)",
              color: "var(--color-yellow)",
            }}
          >
            <Egg size={12} />
            Stellar Testnet • Soroban Powered
          </motion.div>

          {/* H1 */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-white)",
              fontSize: "clamp(52px, 8vw, 88px)",
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              marginBottom: "24px",
            }}
          >
            Incubate.{" "}
            <span
              style={{
                background:
                  "linear-gradient(90deg, var(--color-yellow-dark), var(--color-yellow-light))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Fund.
            </span>{" "}
            Hatch.
          </motion.h1>

          {/* H2 */}
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.18 }}
            style={{
              fontSize: "clamp(16px, 2.2vw, 21px)",
              lineHeight: 1.6,
              color: "var(--color-white-muted)",
              fontWeight: 400,
              marginBottom: "40px",
              maxWidth: "600px",
            }}
          >
            The zero-pressure, milestone-based launchpad{" "}
            <span style={{ color: "var(--color-white-soft)" }}>
              empowering the next generation of builders.
            </span>
          </motion.h2>

          {/* ── Two yellow CTA buttons ──────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28 }}
            className="flex items-center justify-center gap-4 flex-wrap"
          >
            {/* Left: Projeleri Keşfet — opens /projects in new tab */}
            <motion.a
              href="/projects"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl font-semibold transition-all whitespace-nowrap"
              style={{
                background: "var(--color-yellow)",
                color: "var(--color-black)",
                boxShadow: "0 4px 24px var(--color-yellow-glow)",
                padding: "14px 28px",
                fontSize: "15px",
              }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <Compass size={17} />
              Projeleri Keşfet
            </motion.a>

            {/* Right: Proje Başvurusu Yap */}
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Link
                href="/launch"
                className="inline-flex items-center gap-2 rounded-xl font-semibold transition-all whitespace-nowrap"
                style={{
                  background: "var(--color-yellow)",
                  color: "var(--color-black)",
                  boxShadow: "0 4px 24px var(--color-yellow-glow)",
                  padding: "14px 28px",
                  fontSize: "15px",
                }}
              >
                Proje Başvurusu Yap
                <ArrowRight size={17} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Divider ──────────────────────────────────────────────────── */}
      <div className="h-px mx-6" style={{ background: "var(--color-black-border)" }} />

      {/* ── Featured Projects ─────────────────────────────────────────── */}
      <section className="px-6 py-14" style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex items-end justify-between mb-8 flex-wrap gap-4"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--color-yellow)" }}>
              Öne Çıkan Kampanyalar
            </p>
            <h2
              className="text-3xl font-bold mb-1"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-white)" }}
            >
              Seçilmiş Projeler
            </h2>
            <p className="text-sm" style={{ color: "var(--color-white-muted)" }}>
              DeHatch editörlerinin öne çıkardığı aktif kampanyalar.
            </p>
          </div>
          <motion.a
            href="/projects"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap"
            style={{
              background: "transparent",
              color: "var(--color-yellow)",
              border: "1px solid rgba(245,197,24,0.3)",
              padding: "10px 20px",
            }}
            whileHover={{ scale: 1.03, background: "var(--color-yellow-glow)" }}
            whileTap={{ scale: 0.97 }}
          >
            Tüm Projeleri Gör
            <ArrowRight size={14} />
          </motion.a>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {homeProjects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </section>

      {/* ── Divider ──────────────────────────────────────────────────── */}
      <div className="h-px mx-6" style={{ background: "var(--color-black-border)" }} />

      {/* ── Features Grid (moved to bottom) ──────────────────────────── */}
      <section className="px-6 py-14" style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-8 text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--color-yellow)" }}>
            Neden DeHatch?
          </p>
          <h2
            className="text-2xl font-bold"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-white)" }}
          >
            Stellar Ağının Gücüyle
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col gap-3 p-5 rounded-2xl"
              style={{
                background: "var(--color-black-card)",
                border: "1px solid var(--color-black-border)",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "var(--color-yellow-glow)", color: "var(--color-yellow)" }}
              >
                {feature.icon}
              </div>
              <h3 className="text-sm font-semibold" style={{ color: "var(--color-white)" }}>
                {feature.title}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--color-white-muted)" }}>
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Footer CTA ───────────────────────────────────────────────── */}
      <section className="px-6 py-16" style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl p-12 text-center"
          style={{
            background: "linear-gradient(135deg, var(--color-black-card) 0%, var(--color-black-soft) 100%)",
            border: "1px solid var(--color-black-border)",
          }}
        >
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
            style={{ width: "320px", height: "160px", background: "var(--color-yellow)", opacity: 0.15, filter: "blur(60px)", transform: "translateX(-50%)" }}
          />
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: "var(--color-yellow)", color: "var(--color-black)" }}>
              <Egg size={24} />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-display)", color: "var(--color-white)" }}>
              Projenizi Hayata Geçirin
            </h2>
            <p className="text-base mb-8 max-w-lg mx-auto" style={{ color: "var(--color-white-muted)" }}>
              DeHatch&apos;ta proje başlatın, global yatırımcılara ulaşın ve Stellar ağının gücüyle fonunuzu güvenle yönetin.
            </p>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/launch"
                className="inline-flex items-center gap-2 rounded-xl font-semibold"
                style={{ background: "var(--color-yellow)", color: "var(--color-black)", padding: "16px 32px", fontSize: "16px", boxShadow: "0 8px 32px var(--color-yellow-glow)" }}
              >
                Proje Başvurusu Yap
                <ArrowRight size={16} />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="px-6 py-8" style={{ borderTop: "1px solid var(--color-black-border)" }}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4" style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "var(--color-yellow)" }}>
              <Egg size={12} style={{ color: "var(--color-black)" }} />
            </div>
            <span className="text-sm font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--color-white)" }}>
              De<span style={{ color: "var(--color-yellow)" }}>Hatch</span>
            </span>
          </div>
          <p className="text-xs" style={{ color: "var(--color-white-dim)" }}>© 2026 DeHatch. Stellar ağı üzerinde çalışmaktadır.</p>
          <div className="flex items-center gap-4">
            {["Gizlilik", "Kullanım Şartları", "Docs"].map((item) => (
              <a key={item} href="#" className="text-xs transition-colors hover:text-white" style={{ color: "var(--color-white-dim)" }}>{item}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
