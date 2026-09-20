"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import AnchorModal from "@/components/anchor/AnchorModal";
import Logo from "@/components/layout/Logo";
import { getUsdcState } from "@/lib/anchor/stellar";
import { useWallet, type WalletIssue } from "@/lib/wallet";
import { useI18n, type Lang } from "@/lib/i18n";
import {
  Wallet,
  X,
  Copy,
  ExternalLink,
  ArrowDownRight,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";

// Demo list — real per-wallet contributions can be read with getContribution() in src/lib/soroban.ts.
const DEMO_INVESTMENTS = [
  { name: "AgroChain AI", amount: 500, date: "2026-09-15" },
  { name: "EduFund DAO", amount: 250, date: "2026-09-12" },
  { name: "PayLink Stellar", amount: 500, date: "2026-09-10" },
];

// ── Language switch ───────────────────────────────────────────────────────────
function LanguageSwitch() {
  const { lang, setLang, t } = useI18n();
  return (
    <div
      role="group"
      aria-label={t("lang.switch")}
      className="flex items-center rounded-full"
      style={{ border: "1px solid var(--color-black-border)", padding: "2px" }}
    >
      {(["en", "tr"] as Lang[]).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className="rounded-full uppercase transition-colors"
          style={{
            padding: "4px 10px",
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.12em",
            background: lang === l ? "var(--color-yellow)" : "transparent",
            color: lang === l ? "var(--color-black)" : "var(--color-white-muted)",
          }}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

// ── Wallet Modal ──────────────────────────────────────────────────────────────
function WalletModal({ address, onClose, onDisconnect }: { address: string; onClose: () => void; onDisconnect: () => void }) {
  const { t, locale } = useI18n();
  const [showRamp, setShowRamp] = useState(false);
  const [copied, setCopied] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  const shortAddr = `${address.slice(0, 6)}...${address.slice(-4)}`;

  useEffect(() => {
    if (showRamp) return; // refetch after the anchor modal closes
    getUsdcState(address).then((u) => setBalance(u.balance)).catch(() => setBalance(null));
  }, [address, showRamp]);

  const copyAddress = () => {
    navigator.clipboard?.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-end p-4 pt-20"
        style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, x: 40, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 40, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 35 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-sm rounded-2xl overflow-hidden"
          style={{ background: "var(--color-black-card)", border: "1px solid var(--color-black-border)", boxShadow: "0 24px 64px rgba(0,0,0,0.6)" }}
        >
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--color-black-border)" }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: "var(--color-yellow)", color: "var(--color-black)" }}>
                {address[0]}
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--color-white)" }}>{t("wallet.mine")}</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono" style={{ color: "var(--color-white-muted)" }}>{shortAddr}</span>
                  <button onClick={copyAddress} className="transition-colors" aria-label="Copy address">
                    {copied ? <CheckCircle2 size={12} style={{ color: "var(--color-success)" }} /> : <Copy size={12} style={{ color: "var(--color-white-dim)" }} />}
                  </button>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: "var(--color-white-dim)" }} aria-label={t("common.close")}><X size={16} /></button>
          </div>

          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--color-black-border)" }}>
            <p className="text-xs font-medium mb-1" style={{ color: "var(--color-white-dim)" }}>{t("wallet.total")}</p>
            <p className="text-3xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--color-white)" }}>
              {balance === null ? "—" : parseFloat(balance).toLocaleString(locale, { maximumFractionDigits: 2 })}{" "}
              <span className="text-lg font-medium" style={{ color: "var(--color-yellow)" }}>USDC</span>
            </p>
            <button
              onClick={() => setShowRamp(true)}
              className="w-full mt-4 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: "var(--color-yellow)", color: "var(--color-black)", boxShadow: "0 4px 16px var(--color-yellow-glow)" }}
            >
              <ArrowDownRight size={16} />
              {t("wallet.ramp")}
            </button>
          </div>

          <div className="px-5 py-4">
            <p className="text-xs font-medium mb-3" style={{ color: "var(--color-white-dim)" }}>{t("wallet.investments")}</p>
            <div className="space-y-2">
              {DEMO_INVESTMENTS.map((inv) => (
                <div key={inv.name} className="flex items-center justify-between py-2.5 px-3 rounded-xl" style={{ background: "var(--color-black-muted)" }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--color-white)" }}>{inv.name}</p>
                    <p className="text-xs" style={{ color: "var(--color-white-dim)" }}>
                      {new Date(inv.date).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold" style={{ color: "var(--color-white)" }}>{inv.amount} USDC</p>
                    <div className="flex items-center gap-1 justify-end">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--color-success)" }} />
                      <span className="text-xs" style={{ color: "var(--color-success)" }}>{t("wallet.active")}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: "1px solid var(--color-black-border)" }}>
            <a href={`https://stellar.expert/explorer/testnet/account/${address}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs" style={{ color: "var(--color-white-dim)" }}>
              <ExternalLink size={12} />
              {t("wallet.explorer")}
            </a>
            <button onClick={onDisconnect} className="text-xs px-3 py-1.5 rounded-lg" style={{ color: "var(--color-danger)", border: "1px solid rgba(239,68,68,0.2)" }}>
              {t("wallet.disconnect")}
            </button>
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>{showRamp && <AnchorModal address={address} onClose={() => setShowRamp(false)} />}</AnimatePresence>
    </>
  );
}

// ── Wallet problem dialog ─────────────────────────────────────────────────────
function WalletIssueModal({
  issue,
  detail,
  onRetry,
  onClose,
}: {
  issue: WalletIssue;
  detail: string | null;
  onRetry: () => void;
  onClose: () => void;
}) {
  const { t } = useI18n();
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
      role="alertdialog"
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl p-6 text-center"
        style={{ background: "var(--color-black-card)", border: "1px solid var(--color-black-border)" }}
      >
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(239,68,68,0.1)", border: "2px solid rgba(239,68,68,0.3)" }}>
          <AlertCircle size={24} style={{ color: "#f87171" }} />
        </div>
        <h3 className="text-lg font-bold mb-2" style={{ fontFamily: "var(--font-display)", color: "var(--color-white)" }}>
          {t(`wallet.issue.${issue}.title`)}
        </h3>
        <p className="text-sm mb-2" style={{ color: "var(--color-white-muted)" }}>
          {t(`wallet.issue.${issue}.body`)}
        </p>
        {detail && (
          <p className="text-xs mb-4 break-words" style={{ color: "var(--color-white-dim)" }}>{detail}</p>
        )}
        <div className="space-y-2" style={{ marginTop: "20px" }}>
          {issue === "not-installed" ? (
            <a
              href="https://www.freighter.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 rounded-xl font-semibold text-sm"
              style={{ background: "var(--color-yellow)", color: "var(--color-black)" }}
            >
              {t("wallet.download")} →
            </a>
          ) : (
            <button onClick={onRetry} className="block w-full py-3 rounded-xl font-semibold text-sm" style={{ background: "var(--color-yellow)", color: "var(--color-black)" }}>
              {t("wallet.retry")}
            </button>
          )}
          <button onClick={onClose} className="w-full py-2.5 rounded-xl text-sm" style={{ color: "var(--color-white-muted)", border: "1px solid var(--color-black-border)" }}>
            {t("common.close")}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
export default function Navbar() {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const { address, connecting, issue, issueDetail, network, networkName, connect, disconnect, dismissIssue } = useWallet();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleDisconnect = () => {
    disconnect();
    setShowWallet(false);
  };

  const wrongNetwork = !!address && network === "other";
  const shortAddr = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : null;

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 right-0 z-40 transition-all"
        style={{
          height: "var(--nav-height)",
          background: scrolled ? "rgba(10,10,10,0.97)" : "rgba(10,10,10,0.75)",
          backdropFilter: "blur(20px)",
          borderBottom: scrolled ? "1px solid var(--color-black-border)" : "1px solid transparent",
        }}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="h-full flex items-center justify-between px-6" style={{ maxWidth: "1280px", margin: "0 auto" }}>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group" aria-label="DeHatch">
            <span className="transition-transform group-hover:scale-105">
              <Logo size={38} />
            </span>
            <span className="text-lg font-bold tracking-tight" style={{ fontFamily: "var(--font-display)", color: "var(--color-white)" }}>
              De<span style={{ color: "var(--color-yellow)" }}>Hatch</span>
            </span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <LanguageSwitch />

            {/* Network Badge */}
            {wrongNetwork ? (
              <div
                role="status"
                title={t("net.wrongHint", networkName ?? "?")}
                className="hidden sm:flex items-center gap-2 rounded-full uppercase"
                style={{ padding: "5px 12px", border: "1px solid var(--color-warning)", color: "var(--color-warning)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.14em" }}
              >
                <AlertTriangle size={11} />
                {t("net.wrong")}
              </div>
            ) : (
              <div
                className="hidden sm:flex items-center gap-2 rounded-full uppercase"
                style={{ padding: "5px 12px", border: "1px solid var(--color-black-border)", color: "var(--color-white-muted)", fontSize: "10px", fontWeight: 500, letterSpacing: "0.14em" }}
              >
                <div className="w-1 h-1 rounded-full" style={{ background: "var(--color-success)" }} />
                {t("net.testnet")}
              </div>
            )}

            {/* Wallet Button */}
            {address ? (
              <button
                onClick={() => setShowWallet(true)}
                className="flex items-center gap-2 rounded-full text-[13px] font-medium transition-all hover:bg-[var(--color-yellow-glow)] active:scale-[0.97]"
                style={{ padding: "6px 16px 6px 8px", border: "1px solid rgba(245,197,24,0.4)", color: "var(--color-white)" }}
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "var(--color-yellow)", color: "var(--color-black)" }}>
                  {address[0]}
                </div>
                {shortAddr}
                <ChevronDown size={14} style={{ color: "var(--color-white-dim)" }} />
              </button>
            ) : (
              <motion.button
                onClick={() => void connect()}
                disabled={connecting}
                className="flex items-center gap-2 rounded-full text-[13px] font-semibold transition-all"
                style={{
                  padding: "10px 24px",
                  background: connecting ? "var(--color-black-muted)" : "linear-gradient(180deg, var(--color-yellow-light), var(--color-yellow))",
                  color: connecting ? "var(--color-white-muted)" : "var(--color-black)",
                  letterSpacing: "0.02em",
                  boxShadow: connecting ? "none" : "0 0 0 1px rgba(245,197,24,0.55), 0 8px 24px -8px rgba(245,197,24,0.45)",
                  cursor: connecting ? "wait" : "pointer",
                }}
                whileHover={connecting ? {} : { scale: 1.02 }}
                whileTap={connecting ? {} : { scale: 0.97 }}
              >
                {connecting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--color-white-muted)", borderTopColor: "transparent" }} />
                    {t("wallet.connecting")}
                  </>
                ) : (
                  <>
                    <Wallet size={14} strokeWidth={1.75} />
                    {t("wallet.connect")}
                  </>
                )}
              </motion.button>
            )}

          </div>
        </div>

      </motion.nav>

      {/* Modals */}
      <AnimatePresence>
        {showWallet && address && (
          <WalletModal address={address} onClose={() => setShowWallet(false)} onDisconnect={handleDisconnect} />
        )}
        {issue && (
          <WalletIssueModal
            issue={issue}
            detail={issueDetail}
            onClose={dismissIssue}
            onRetry={() => {
              dismissIssue();
              void connect();
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
