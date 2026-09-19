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

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  "AI/ML": { bg: "rgba(139,92,246,0.12)", text: "#a78bfa" },
  DeFi: { bg: "rgba(59,130,246,0.12)", text: "#60a5fa" },
  EdTech: { bg: "rgba(34,197,94,0.12)", text: "#4ade80" },
  HealthTech: { bg: "rgba(239,68,68,0.12)", text: "#f87171" },
  GreenTech: { bg: "rgba(16,185,129,0.12)", text: "#34d399" },
  SaaS: { bg: "rgba(245,197,24,0.10)", text: "#f5c518" },
};

// ── Investment Modal ──────────────────────────────────────────────────────────
function InvestModal({
  project,
  onClose,
}: {
  project: (typeof mockProjects)[0];
  onClose: () => void;
}) {
  const [walletConnected, setWalletConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<"amount" | "confirm" | "success">("amount");

  const PRESETS = [50, 100, 250, 500];

  const handleConnect = async () => {
    setConnecting(true);
    await new Promise((r) => setTimeout(r, 1200));
    setWalletConnected(true);
    setConnecting(false);
  };

  const handleInvest = () => {
    if (step === "amount") setStep("confirm");
    else if (step === "confirm") setStep("success");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: "var(--color-black-card)",
          border: "1px solid var(--color-black-border)",
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-5 flex items-center justify-between"
          style={{ borderBottom: "1px solid var(--color-black-border)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ background: CATEGORY_COLORS[project.category]?.bg }}
            >
              {project.emoji ?? "🚀"}
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: "var(--color-yellow)" }}>
                Projeye Yatırım Yap
              </p>
              <h2
                className="text-lg font-bold"
                style={{ fontFamily: "var(--font-display)", color: "var(--color-white)" }}
              >
                {project.name}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg"
            style={{ background: "var(--color-black-muted)", color: "var(--color-white-muted)" }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6">
          {/* Connect wallet first if not connected */}
          {!walletConnected ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <div
                className="p-4 rounded-xl text-center"
                style={{ background: "var(--color-yellow-glow)", border: "1px solid rgba(245,197,24,0.2)" }}
              >
                <Wallet size={28} className="mx-auto mb-2" style={{ color: "var(--color-yellow)" }} />
                <p className="text-sm font-semibold mb-1" style={{ color: "var(--color-white)" }}>
                  Yatırım yapmak için cüzdanınızı bağlayın
                </p>
                <p className="text-xs" style={{ color: "var(--color-white-dim)" }}>
                  Stellar ağı üzerinden USDC ile güvenli yatırım
                </p>
              </div>
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                style={{
                  background: connecting ? "var(--color-black-muted)" : "var(--color-yellow)",
                  color: connecting ? "var(--color-white-dim)" : "var(--color-black)",
                }}
              >
                {connecting ? (
                  <>
                    <div
                      className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                      style={{ borderColor: "var(--color-white-dim)", borderTopColor: "transparent" }}
                    />
                    Bağlanıyor...
                  </>
                ) : (
                  <>
                    <Wallet size={16} />
                    Cüzdan Bağla
                  </>
                )}
              </button>
            </motion.div>
          ) : step === "amount" ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              {/* Wallet connected indicator */}
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}
              >
                <div className="w-2 h-2 rounded-full" style={{ background: "var(--color-success)" }} />
                <span className="text-xs" style={{ color: "var(--color-success)" }}>
                  GCWV...XK42 bağlı — 2,450 USDC mevcut
                </span>
              </div>

              {/* Preset amounts */}
              <div>
                <p className="text-xs font-medium mb-2" style={{ color: "var(--color-white-dim)" }}>
                  Hızlı seçim (USDC)
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {PRESETS.map((p) => (
                    <button
                      key={p}
                      onClick={() => setAmount(String(p))}
                      className="py-2 rounded-lg text-sm font-semibold transition-all"
                      style={{
                        background: amount === String(p) ? "var(--color-yellow)" : "var(--color-black-muted)",
                        color: amount === String(p) ? "var(--color-black)" : "var(--color-white-muted)",
                        border: amount === String(p) ? "1px solid var(--color-yellow)" : "1px solid var(--color-black-border)",
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom amount */}
              <div>
                <p className="text-xs font-medium mb-2" style={{ color: "var(--color-white-dim)" }}>
                  Özel miktar (USDC)
                </p>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3 rounded-xl text-base outline-none pr-16"
                    style={{
                      background: "var(--color-black-muted)",
                      border: "1px solid var(--color-black-border)",
                      color: "var(--color-white)",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--color-yellow)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--color-black-border)")}
                  />
                  <span
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium"
                    style={{ color: "var(--color-white-muted)" }}
                  >
                    USDC
                  </span>
                </div>
              </div>

              {/* Milestone info */}
              <div
                className="p-3 rounded-xl flex gap-3"
                style={{ background: "var(--color-black-muted)", border: "1px solid var(--color-black-border)" }}
              >
                <Info size={14} className="flex-shrink-0 mt-0.5" style={{ color: "var(--color-yellow)" }} />
                <p className="text-xs leading-relaxed" style={{ color: "var(--color-white-muted)" }}>
                  Fonunuz milestone bazlı kontrat tarafından kilitlenir. Her aşama onaylanınca proje ekibine aktarılır.
                </p>
              </div>

              <button
                onClick={handleInvest}
                disabled={!amount || parseFloat(amount) <= 0}
                className="w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                style={{
                  background: amount && parseFloat(amount) > 0 ? "var(--color-yellow)" : "var(--color-black-muted)",
                  color: amount && parseFloat(amount) > 0 ? "var(--color-black)" : "var(--color-white-dim)",
                  cursor: amount && parseFloat(amount) > 0 ? "pointer" : "not-allowed",
                }}
              >
                <TrendingUp size={16} />
                Devam Et
              </button>
            </motion.div>
          ) : step === "confirm" ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <div className="text-center py-2">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{ background: "var(--color-yellow-glow)", border: "2px solid var(--color-yellow)" }}
                >
                  <Zap size={24} style={{ color: "var(--color-yellow)" }} />
                </div>
                <h3 className="text-lg font-bold mb-1" style={{ color: "var(--color-white)" }}>
                  İşlemi Onayla
                </h3>
                <p className="text-sm" style={{ color: "var(--color-white-muted)" }}>
                  Stellar cüzdanınızda imzalama bekleniyor
                </p>
              </div>
              <div
                className="p-4 rounded-xl space-y-3"
                style={{ background: "var(--color-black-muted)", border: "1px solid var(--color-black-border)" }}
              >
                {[
                  ["Proje", project.name],
                  ["Yatırım Miktarı", `${amount} USDC`],
                  ["Ağ", "Stellar Testnet"],
                  ["İşlem Ücreti", "~0.00001 XLM"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span style={{ color: "var(--color-white-dim)" }}>{k}</span>
                    <span className="font-semibold" style={{ color: "var(--color-white)" }}>{v}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={handleInvest}
                className="w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                style={{ background: "var(--color-yellow)", color: "var(--color-black)" }}
              >
                <Zap size={16} />
                Stellar&apos;da İmzala ve Yatır
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4 space-y-4"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                style={{ background: "rgba(34,197,94,0.1)", border: "2px solid var(--color-success)" }}
              >
                <CheckCircle2 size={28} style={{ color: "var(--color-success)" }} />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2" style={{ color: "var(--color-white)" }}>
                  Yatırım Tamamlandı! 🎉
                </h3>
                <p className="text-sm" style={{ color: "var(--color-white-muted)" }}>
                  <strong>{amount} USDC</strong> başarıyla{" "}
                  <strong>{project.name}</strong> projesine yatırıldı.
                  Milestone kontratı fonunuzu güvende tutuyor.
                </p>
              </div>
              <div
                className="p-3 rounded-xl text-xs font-mono"
                style={{ background: "var(--color-black-muted)", color: "var(--color-white-dim)" }}
              >
                TX: 0xf3a9...c812b • Stellar Testnet
              </div>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl font-medium transition-all"
                style={{
                  background: "var(--color-black-muted)",
                  color: "var(--color-white)",
                  border: "1px solid var(--color-black-border)",
                }}
              >
                Kapat
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Project Detail Page ───────────────────────────────────────────────────────
export default function ProjectDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const project = mockProjects.find((p) => p.slug === slug);
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
            Projelere Dön
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
                        ★ Öne Çıkan
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
                    Proje Ekibi
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
                    Yol Haritası (Milestones)
                  </h2>
                  <span className="text-xs" style={{ color: "var(--color-white-dim)" }}>
                    {completedMilestones}/{project.milestones.length} tamamlandı
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
                            Aşama {i + 1}: {m.title}
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
                  Nasıl Çalışır?
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
                  Proje Hakkında
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
                      <span style={{ color: "var(--color-white-dim)" }}>Toplanan</span>
                      <span className="font-bold" style={{ color: "var(--color-white)" }}>
                        {project.raised.toLocaleString()} USDC
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: "var(--color-white-dim)" }}>Hedef</span>
                      <span style={{ color: "var(--color-white-muted)" }}>
                        {project.goal.toLocaleString()} USDC
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
                        %{Math.round(progress)} fonlandı
                      </span>
                      <span style={{ color: "var(--color-white-dim)" }}>
                        {project.backers} destekçi
                      </span>
                    </div>
                  </div>

                  <div
                    className="flex items-center justify-between py-3 mb-4"
                    style={{ borderTop: "1px solid var(--color-black-border)", borderBottom: "1px solid var(--color-black-border)" }}
                  >
                    <div className="flex items-center gap-1.5" style={{ color: "var(--color-white-dim)" }}>
                      <Clock size={14} />
                      <span className="text-sm">Kalan süre</span>
                    </div>
                    <span
                      className="text-sm font-bold"
                      style={{ color: project.daysLeft <= 5 ? "#f87171" : "var(--color-white)" }}
                    >
                      {project.daysLeft} gün
                    </span>
                  </div>

                  {/* Invest button */}
                  <p
                    className="text-xs text-center mb-3 font-medium"
                    style={{ color: "var(--color-white-muted)" }}
                  >
                    Projeye Yatırım Yap
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
                    USDC ile Destekle
                  </motion.button>

                  <p className="text-xs text-center mt-3" style={{ color: "var(--color-white-dim)" }}>
                    Milestone kontratı ile güvende
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
