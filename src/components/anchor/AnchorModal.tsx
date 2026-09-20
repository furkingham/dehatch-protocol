"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  X,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Loader2,
  AlertCircle,
  AlertTriangle,
  ExternalLink,
  Copy,
} from "lucide-react";
import { ASSET_CODE } from "@/lib/anchor/config";
import { authenticate, clearToken, getTransaction, startDeposit, startWithdraw } from "@/lib/anchor/sep";
import { addUsdcTrustline, getUsdcState, payWithdrawal, type UsdcState } from "@/lib/anchor/stellar";
import type { AnchorTransaction, DepositInstructions, WithdrawInstructions } from "@/lib/anchor/types";
import { useI18n } from "@/lib/i18n";
import { useWallet } from "@/lib/wallet";

type Mode = "deposit" | "withdraw";

const FINAL = ["completed", "refunded", "expired", "error"];

const card = { background: "var(--color-black-muted)", border: "1px solid var(--color-black-border)" };

export default function AnchorModal({ address, onClose }: { address: string; onClose: () => void }) {
  const { t, locale } = useI18n();
  const { sign, network } = useWallet();
  const [mode, setMode] = useState<Mode>("deposit");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState<string | null>(null); // i18n key of the current step
  const [error, setError] = useState<string | null>(null);
  const [usdc, setUsdc] = useState<UsdcState | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [deposit, setDeposit] = useState<DepositInstructions | null>(null);
  const [withdraw, setWithdraw] = useState<WithdrawInstructions | null>(null);
  const [payHash, setPayHash] = useState<string | null>(null);
  const [tx, setTx] = useState<AnchorTransaction | null>(null);
  const [copied, setCopied] = useState(false);

  const wrongNetwork = network === "other";
  const activeId = deposit?.id ?? withdraw?.id ?? null;
  const isFinal = !!tx && FINAL.includes(tx.status);

  const refreshBalance = useCallback(() => {
    getUsdcState(address).then(setUsdc).catch(() => setUsdc(null));
  }, [address]);

  useEffect(refreshBalance, [refreshBalance]);

  // Poll the anchor until the transaction reaches a final state.
  useEffect(() => {
    if (!activeId || !token || isFinal) return;
    let stop = false;
    const tick = async () => {
      try {
        const next = await getTransaction(token, activeId);
        if (stop) return;
        setTx(next);
        if (FINAL.includes(next.status)) refreshBalance();
      } catch {
        // transient network error — keep polling
      }
    };
    tick();
    const iv = setInterval(tick, 3000);
    return () => {
      stop = true;
      clearInterval(iv);
    };
  }, [activeId, token, isFinal, refreshBalance]);

  const reset = (m: Mode) => {
    setMode(m);
    setAmount("");
    setError(null);
    setDeposit(null);
    setWithdraw(null);
    setPayHash(null);
    setTx(null);
  };

  const run = async (fn: () => Promise<void>) => {
    setError(null);
    try {
      await fn();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (/401|token|jwt/i.test(msg)) clearToken();
      setError(msg);
    } finally {
      setBusy(null);
    }
  };

  const parsed = parseFloat(amount);
  const valid = Number.isFinite(parsed) && parsed > 0;
  const canStart = valid && !busy && !wrongNetwork;

  const onDeposit = () =>
    run(async () => {
      setBusy("anchor.step.auth");
      const jwt = await authenticate(address, sign);
      setToken(jwt);

      const state = await getUsdcState(address);
      setUsdc(state);
      if (!state.accountExists) throw new Error("anchor.err.noAccount");
      if (!state.hasTrustline) {
        setBusy("anchor.step.trust");
        await addUsdcTrustline(address, sign);
        refreshBalance();
      }

      setBusy("anchor.step.deposit");
      setDeposit(await startDeposit(jwt, address, parsed.toFixed(2)));
    });

  const onWithdraw = () =>
    run(async () => {
      if (usdc && parsed > parseFloat(usdc.balance)) throw new Error("anchor.err.balance");
      setBusy("anchor.step.auth");
      const jwt = await authenticate(address, sign);
      setToken(jwt);

      setBusy("anchor.step.withdraw");
      const w = await startWithdraw(jwt, address, parsed.toFixed(7));
      setWithdraw(w);

      setBusy("anchor.step.pay");
      setPayHash(await payWithdrawal(address, parsed.toFixed(7), w, sign));
      refreshBalance();
    });

  const copy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const started = !!deposit || !!withdraw;
  const bankLabel = (k: string) =>
    k === "bank_name" ? t("anchor.bank.name") : k === "bank_account_number" ? t("anchor.bank.iban") : t("anchor.bank.ref");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(10px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        style={{ background: "var(--color-black-card)", border: "1px solid var(--color-black-border)" }}
      >
        <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--color-black-border)" }}>
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: "var(--color-yellow)" }}>
              {t("anchor.eyebrow")}
            </p>
            <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--color-white)" }}>
              TRY ⇄ USDC
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg" style={{ background: "var(--color-black-muted)", color: "var(--color-white-muted)" }} aria-label={t("common.close")}>
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {wrongNetwork && (
            <div className="flex items-start gap-2 p-3 rounded-xl text-sm" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid var(--color-warning)", color: "var(--color-warning)" }}>
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>{t("net.wrongBanner")}</span>
            </div>
          )}

          <div className="flex gap-2 p-1 rounded-xl" style={card}>
            {(["deposit", "withdraw"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => !busy && reset(m)}
                className="flex-1 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition-all"
                style={{
                  background: mode === m ? "var(--color-yellow)" : "transparent",
                  color: mode === m ? "var(--color-black)" : "var(--color-white-muted)",
                }}
              >
                {m === "deposit" ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                {t(m === "deposit" ? "anchor.tab.deposit" : "anchor.tab.withdraw")}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: "var(--color-yellow-glow)", border: "1px solid rgba(245,197,24,0.2)" }}>
            <span className="text-sm font-semibold" style={{ color: "var(--color-white)" }}>{t("anchor.balance")}</span>
            <span className="text-lg font-bold" style={{ color: "var(--color-yellow)" }}>
              {usdc ? parseFloat(usdc.balance).toLocaleString(locale, { maximumFractionDigits: 2 }) : "—"} {ASSET_CODE}
            </span>
          </div>

          {!started && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-white-muted)" }}>
                  {t(mode === "deposit" ? "anchor.amount.deposit" : "anchor.amount.withdraw")}
                </label>
                <input
                  type="number" min="0" step="any" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00"
                  disabled={!!busy}
                  className="w-full px-4 py-3 rounded-xl text-base outline-none"
                  style={{ ...card, color: "var(--color-white)" }}
                />
                <p className="text-xs mt-1.5" style={{ color: "var(--color-white-dim)" }}>
                  {t(mode === "deposit" ? "anchor.hint.deposit" : "anchor.hint.withdraw")}
                </p>
              </div>
              <button
                onClick={mode === "deposit" ? onDeposit : onWithdraw}
                disabled={!canStart}
                className="w-full py-3.5 rounded-xl font-semibold text-base flex items-center justify-center gap-2"
                style={{
                  background: canStart ? "var(--color-yellow)" : "var(--color-black-muted)",
                  color: canStart ? "var(--color-black)" : "var(--color-white-dim)",
                  cursor: canStart ? "pointer" : "not-allowed",
                }}
              >
                {busy ? <><Loader2 size={16} className="animate-spin" /> {t(busy)}</> : t(mode === "deposit" ? "anchor.start.deposit" : "anchor.start.withdraw")}
              </button>
            </>
          )}

          {deposit && !isFinal && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl space-y-2 text-sm" style={card}>
                <p className="font-semibold" style={{ color: "var(--color-white)" }}>{t("anchor.bank.title")}</p>
                {Object.entries(deposit.instructions ?? {}).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3">
                    <span style={{ color: "var(--color-white-dim)" }}>{bankLabel(k)}</span>
                    <button onClick={() => copy(v.value)} className="font-mono text-xs text-right flex items-center gap-1" style={{ color: "var(--color-white)" }}>
                      {v.value} {copied ? <CheckCircle2 size={11} /> : <Copy size={11} style={{ opacity: 0.5 }} />}
                    </button>
                  </div>
                ))}
              </div>
              {tx?.more_info_url && tx.status === "pending_user_transfer_start" && (
                <a
                  href={tx.more_info_url} target="_blank" rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
                  style={{ background: "var(--color-yellow)", color: "var(--color-black)" }}
                >
                  <ExternalLink size={14} /> {t("anchor.simulate")}
                </a>
              )}
            </div>
          )}

          {withdraw && payHash && !isFinal && (
            <div className="p-4 rounded-xl text-xs space-y-1" style={card}>
              <p className="font-semibold text-sm" style={{ color: "var(--color-white)" }}>{t("anchor.paid")}</p>
              <a href={`https://stellar.expert/explorer/testnet/tx/${payHash}`} target="_blank" rel="noopener noreferrer" className="font-mono flex items-center gap-1" style={{ color: "var(--color-white-muted)" }}>
                {payHash.slice(0, 12)}…{payHash.slice(-8)} <ExternalLink size={11} />
              </a>
            </div>
          )}

          {started && (
            <div className="flex items-center gap-3 p-4 rounded-xl" style={card}>
              {tx?.status === "completed" ? (
                <CheckCircle2 size={22} style={{ color: "var(--color-success)" }} />
              ) : isFinal ? (
                <AlertCircle size={22} style={{ color: "var(--color-danger)" }} />
              ) : (
                <Loader2 size={22} className="animate-spin" style={{ color: "var(--color-yellow)" }} />
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold" style={{ color: "var(--color-white)" }}>
                  {tx ? t(`status.${tx.status}`) : t("anchor.connecting")}
                </p>
                {tx?.message && <p className="text-xs" style={{ color: "var(--color-white-dim)" }}>{tx.message}</p>}
                {tx?.status === "completed" && tx.amount_out && (
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-white-muted)" }}>
                    {tx.amount_in} → {tx.amount_out}
                  </p>
                )}
              </div>
            </div>
          )}

          {error && (
            <div role="alert" className="flex items-start gap-2 p-3 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span className="break-words min-w-0">{t(error)}</span>
            </div>
          )}

          {(isFinal || (started && error)) && (
            <button onClick={() => reset(mode)} className="w-full py-3 rounded-xl font-medium" style={{ ...card, color: "var(--color-white)" }}>
              {t("anchor.new")}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
