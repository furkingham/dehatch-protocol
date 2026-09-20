"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, AlertTriangle, ArrowDownLeft, CheckCircle2, ExternalLink, Info, Loader2, TrendingUp, Wallet, X, Zap } from "lucide-react";
import AnchorModal from "@/components/anchor/AnchorModal";
import { getUsdcState, type UsdcState } from "@/lib/anchor/stellar";
import { useI18n } from "@/lib/i18n";
import {
  explorerTxUrl,
  formatUsdc,
  getProjectStatus,
  invest,
  type OnChainProject,
} from "@/lib/soroban";
import { useWallet } from "@/lib/wallet";
import type { Project } from "@/types";

const PRESETS = [50, 100, 250, 500];
const card = { background: "var(--color-black-muted)", border: "1px solid var(--color-black-border)" };

export default function InvestModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const { t, locale } = useI18n();
  const { address, connecting, issue, connect, sign, network } = useWallet();
  const fmt = (n: number) => n.toLocaleString(locale, { maximumFractionDigits: 2 });
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<"amount" | "confirm" | "success">("amount");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hash, setHash] = useState<string | null>(null);
  const [usdc, setUsdc] = useState<UsdcState | null>(null);
  const [chain, setChain] = useState<OnChainProject | null>(null);
  const [chainMissing, setChainMissing] = useState(false);
  const [showAnchor, setShowAnchor] = useState(false);

  const refresh = useCallback(() => {
    if (address) getUsdcState(address).then(setUsdc).catch(() => setUsdc(null));
    getProjectStatus(project.slug)
      .then((s) => {
        setChain(s);
        setChainMissing(false);
      })
      .catch(() => setChainMissing(true));
  }, [address, project.slug]);

  useEffect(refresh, [refresh]);

  const wrongNetwork = network === "other";
  const balance = usdc ? parseFloat(usdc.balance) : 0;
  const remaining = chain ? formatUsdc(chain.goal - chain.raised) : Infinity;
  const value = parseFloat(amount);
  const validNumber = Number.isFinite(value) && value > 0;
  const problem = !validNumber
    ? null
    : value > balance
      ? t("invest.err.balance")
      : value > remaining
        ? t("invest.err.remaining", fmt(remaining))
        : null;
  const canContinue = validNumber && !problem && !chainMissing && !!usdc?.hasTrustline && !wrongNetwork;

  const onInvest = async () => {
    if (!address) return;
    setBusy(true);
    setError(null);
    try {
      const res = await invest(project.slug, address, amount, sign);
      setHash(res.hash);
      setStep("success");
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
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
        className="w-full max-w-md rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        style={{ background: "var(--color-black-card)", border: "1px solid var(--color-black-border)" }}
      >
        <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--color-black-border)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={card}>
              {project.emoji ?? "🚀"}
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: "var(--color-yellow)" }}>{t("invest.title")}</p>
              <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--color-white)" }}>
                {project.name}
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg" style={{ ...card, color: "var(--color-white-muted)" }} aria-label={t("common.close")}>
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {address && wrongNetwork && (
            <div className="flex items-start gap-2 p-3 rounded-xl text-sm" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid var(--color-warning)", color: "var(--color-warning)" }}>
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>{t("net.wrongBanner")}</span>
            </div>
          )}

          {!address ? (
            <>
              <div className="p-4 rounded-xl text-center" style={{ background: "var(--color-yellow-glow)", border: "1px solid rgba(245,197,24,0.2)" }}>
                <Wallet size={28} className="mx-auto" style={{ color: "var(--color-yellow)", marginBottom: "8px" }} />
                <p className="text-sm font-semibold" style={{ color: "var(--color-white)", marginBottom: "4px" }}>
                  {t("invest.connectTitle")}
                </p>
                <p className="text-xs" style={{ color: "var(--color-white-dim)" }}>{t("invest.connectSub")}</p>
              </div>
              {issue && (
                <p role="alert" className="text-xs" style={{ color: "#f87171" }}>
                  {t(`wallet.issue.${issue}.body`)}
                </p>
              )}
              <button
                onClick={() => void connect()}
                disabled={connecting}
                className="w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2"
                style={{ background: connecting ? "var(--color-black-muted)" : "var(--color-yellow)", color: connecting ? "var(--color-white-dim)" : "var(--color-black)" }}
              >
                {connecting ? <><Loader2 size={16} className="animate-spin" /> {t("wallet.connecting")}</> : <><Wallet size={16} /> {t("wallet.connect")}</>}
              </button>
            </>
          ) : step === "amount" ? (
            <>
              <div className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
                <span className="text-xs font-mono" style={{ color: "var(--color-success)" }}>
                  {address.slice(0, 4)}…{address.slice(-4)}
                </span>
                <span className="text-xs" style={{ color: "var(--color-success)" }}>
                  {usdc ? t("invest.available", fmt(balance)) : t("invest.loadingBalance")}
                </span>
              </div>

              {chain && (
                <div className="p-3 rounded-xl text-xs space-y-1" style={card}>
                  <div className="flex justify-between">
                    <span style={{ color: "var(--color-white-dim)" }}>{t("invest.onchain")}</span>
                    <span style={{ color: "var(--color-white)" }}>{fmt(formatUsdc(chain.raised))} / {fmt(formatUsdc(chain.goal))} USDC</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "var(--color-white-dim)" }}>{t("invest.milestones")}</span>
                    <span style={{ color: "var(--color-white)" }}>{t("invest.released", chain.milestones_released, chain.milestones_total)}</span>
                  </div>
                </div>
              )}
              {chainMissing && (
                <p className="text-xs" style={{ color: "#f87171" }}>{t("invest.notRegistered")}</p>
              )}

              {usdc && (!usdc.hasTrustline || balance === 0) && (
                <div className="p-4 rounded-xl space-y-3" style={{ background: "var(--color-yellow-glow)", border: "1px solid rgba(245,197,24,0.25)" }}>
                  <p className="text-sm" style={{ color: "var(--color-white)" }}>
                    {!usdc.accountExists ? t("invest.noAccount") : t("invest.needUsdc")}
                  </p>
                  {usdc.accountExists && (
                    <button
                      onClick={() => setShowAnchor(true)}
                      className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                      style={{ background: "var(--color-yellow)", color: "var(--color-black)" }}
                    >
                      <ArrowDownLeft size={15} /> {t("invest.getUsdc")}
                    </button>
                  )}
                </div>
              )}

              <div>
                <p className="text-xs font-medium mb-2" style={{ color: "var(--color-white-dim)" }}>{t("invest.quick")}</p>
                <div className="grid grid-cols-4 gap-2">
                  {PRESETS.map((p) => (
                    <button
                      key={p}
                      onClick={() => setAmount(String(p))}
                      className="py-2 rounded-lg text-sm font-semibold"
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

              <div>
                <p className="text-xs font-medium mb-2" style={{ color: "var(--color-white-dim)" }}>{t("invest.custom")}</p>
                <input
                  type="number" min="0" step="any" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00"
                  className="w-full px-4 py-3 rounded-xl text-base outline-none"
                  style={{ ...card, color: "var(--color-white)", padding: "12px 16px" }}
                />
                {problem && <p role="alert" className="text-xs" style={{ color: "#f87171", marginTop: "6px" }}>{problem}</p>}
              </div>

              <div className="p-3 rounded-xl flex gap-3" style={card}>
                <Info size={14} className="flex-shrink-0" style={{ color: "var(--color-yellow)", marginTop: "2px" }} />
                <p className="text-xs leading-relaxed" style={{ color: "var(--color-white-muted)" }}>
                  {t("invest.lockInfo")}
                </p>
              </div>

              <button
                onClick={() => setStep("confirm")}
                disabled={!canContinue}
                className="w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2"
                style={{
                  background: canContinue ? "var(--color-yellow)" : "var(--color-black-muted)",
                  color: canContinue ? "var(--color-black)" : "var(--color-white-dim)",
                  cursor: canContinue ? "pointer" : "not-allowed",
                }}
              >
                <TrendingUp size={16} /> {t("invest.continue")}
              </button>
            </>
          ) : step === "confirm" ? (
            <>
              <div className="text-center py-2">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "var(--color-yellow-glow)", border: "2px solid var(--color-yellow)" }}>
                  <Zap size={24} style={{ color: "var(--color-yellow)" }} />
                </div>
                <h3 className="text-lg font-bold mb-1" style={{ color: "var(--color-white)" }}>{t("invest.confirmTitle")}</h3>
                <p className="text-sm" style={{ color: "var(--color-white-muted)" }}>
                  {busy ? t("invest.signing") : t("invest.willOpen")}
                </p>
              </div>
              <div className="p-4 rounded-xl space-y-3" style={card}>
                {[
                  [t("invest.row.project"), project.name],
                  [t("invest.row.amount"), `${amount} USDC`],
                  [t("invest.row.network"), t("invest.networkValue")],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span style={{ color: "var(--color-white-dim)" }}>{k}</span>
                    <span className="font-semibold" style={{ color: "var(--color-white)" }}>{v}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={onInvest}
                disabled={busy}
                className="w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2"
                style={{ background: busy ? "var(--color-black-muted)" : "var(--color-yellow)", color: busy ? "var(--color-white-dim)" : "var(--color-black)" }}
              >
                {busy ? <><Loader2 size={16} className="animate-spin" /> {t("invest.processing")}</> : <><Zap size={16} /> {t("invest.signAndInvest")}</>}
              </button>
              {!busy && (
                <button onClick={() => { setStep("amount"); setError(null); }} className="w-full py-2 text-sm" style={{ color: "var(--color-white-muted)" }}>
                  {t("common.back")}
                </button>
              )}
            </>
          ) : (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ background: "rgba(34,197,94,0.1)", border: "2px solid var(--color-success)" }}>
                <CheckCircle2 size={28} style={{ color: "var(--color-success)" }} />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2" style={{ color: "var(--color-white)" }}>{t("invest.doneTitle")}</h3>
                <p className="text-sm" style={{ color: "var(--color-white-muted)" }}>
                  {t("invest.doneBody", amount, project.name)}
                </p>
              </div>
              {hash && (
                <a href={explorerTxUrl(hash)} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl text-xs font-mono flex items-center justify-center gap-1.5" style={{ ...card, color: "var(--color-white-muted)" }}>
                  {hash.slice(0, 10)}…{hash.slice(-8)} <ExternalLink size={11} />
                </a>
              )}
              <button onClick={onClose} className="w-full py-3 rounded-xl font-medium" style={{ ...card, color: "var(--color-white)" }}>{t("common.close")}</button>
            </div>
          )}

          {error && (
            <div role="alert" className="flex items-start gap-2 p-3 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>
              <AlertCircle size={16} className="flex-shrink-0" style={{ marginTop: "2px" }} />
              <span className="break-words min-w-0">{t(error)}</span>
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {showAnchor && address && (
          <div onClick={(e) => e.stopPropagation()}>
            <AnchorModal address={address} onClose={() => { setShowAnchor(false); refresh(); }} />
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
