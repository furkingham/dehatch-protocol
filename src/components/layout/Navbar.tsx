"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Egg,
  Wallet,
  X,
  Copy,
  ExternalLink,
  TrendingUp,
  ArrowDownRight,
  ChevronDown,
  Menu,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";

// ── Freighter helpers (SSR-safe) ──────────────────────────────────────────────
async function getFreighter() {
  if (typeof window === "undefined") return null;
  try {
    const mod = await import("@stellar/freighter-api");
    return mod;
  } catch {
    return null;
  }
}

// ── IBAN Modal ────────────────────────────────────────────────────────────────
function IBANModal({ onClose }: { onClose: () => void }) {
  const [iban, setIban] = useState("");
  const [step, setStep] = useState<"form" | "confirm" | "success">("form");
  const [amount, setAmount] = useState("");

  const handleSubmit = () => {
    if (step === "form") setStep("confirm");
    else if (step === "confirm") setStep("success");
  };

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
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: "var(--color-black-card)",
          border: "1px solid var(--color-black-border)",
        }}
      >
        <div
          className="px-6 py-5 flex items-center justify-between"
          style={{ borderBottom: "1px solid var(--color-black-border)" }}
        >
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: "var(--color-yellow)" }}>
              SEP-24 Anchor Simülasyonu
            </p>
            <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--color-white)" }}>
              Fonu Bankaya Çek
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg" style={{ background: "var(--color-black-muted)", color: "var(--color-white-muted)" }}>
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {step === "form" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: "var(--color-yellow-glow)", border: "1px solid rgba(245,197,24,0.2)" }}>
                <div className="p-2 rounded-lg" style={{ background: "var(--color-yellow)", color: "var(--color-black)" }}>
                  <TrendingUp size={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--color-white)" }}>Çekilebilir Bakiye</p>
                  <p className="text-xl font-bold" style={{ color: "var(--color-yellow)" }}>1,250 USDC</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-white-muted)" }}>Çekilecek Miktar (USDC)</label>
                  <input
                    type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00"
                    className="w-full px-4 py-3 rounded-xl text-base outline-none transition-all"
                    style={{ background: "var(--color-black-muted)", border: "1px solid var(--color-black-border)", color: "var(--color-white)" }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--color-yellow)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--color-black-border)")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-white-muted)" }}>IBAN Numaranız</label>
                  <input
                    type="text" value={iban} onChange={(e) => setIban(e.target.value.toUpperCase())} placeholder="TR00 0000 0000 0000 0000 0000 00"
                    className="w-full px-4 py-3 rounded-xl text-base outline-none transition-all font-mono"
                    style={{ background: "var(--color-black-muted)", border: "1px solid var(--color-black-border)", color: "var(--color-white)" }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--color-yellow)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--color-black-border)")}
                  />
                  <p className="text-xs mt-1.5" style={{ color: "var(--color-white-dim)" }}>USDC → TRY dönüşümü anlık kur üzerinden yapılacaktır</p>
                </div>
              </div>
              {amount && iban && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-xl" style={{ background: "var(--color-black-muted)", border: "1px solid var(--color-black-border)" }}>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "var(--color-white-dim)" }}>Tahmini TRY tutarı</span>
                    <span className="font-semibold" style={{ color: "var(--color-white)" }}>≈ {(parseFloat(amount || "0") * 34.2).toLocaleString("tr-TR")} ₺</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span style={{ color: "var(--color-white-dim)" }}>İşlem süresi</span>
                    <span style={{ color: "var(--color-success)" }}>1-2 iş günü</span>
                  </div>
                </motion.div>
              )}
              <button
                onClick={handleSubmit} disabled={!amount || !iban}
                className="w-full py-3.5 rounded-xl font-semibold text-base transition-all flex items-center justify-center gap-2"
                style={{ background: amount && iban ? "var(--color-yellow)" : "var(--color-black-muted)", color: amount && iban ? "var(--color-black)" : "var(--color-white-dim)", cursor: amount && iban ? "pointer" : "not-allowed" }}
              >
                <ArrowDownRight size={18} />
                Çekimi Başlat
              </button>
            </motion.div>
          )}

          {step === "confirm" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <div className="text-center py-2">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "var(--color-yellow-glow)", border: "2px solid var(--color-yellow)" }}>
                  <Clock size={24} style={{ color: "var(--color-yellow)" }} />
                </div>
                <h3 className="text-lg font-bold mb-1" style={{ color: "var(--color-white)" }}>İşlemi Onayla</h3>
                <p className="text-sm" style={{ color: "var(--color-white-muted)" }}>Cüzdanınızda imzalama isteği bekliyor</p>
              </div>
              <div className="p-4 rounded-xl space-y-3" style={{ background: "var(--color-black-muted)", border: "1px solid var(--color-black-border)" }}>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--color-white-dim)" }}>Miktar</span>
                  <span className="font-semibold" style={{ color: "var(--color-white)" }}>{amount} USDC</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--color-white-dim)" }}>IBAN</span>
                  <span className="font-mono text-xs" style={{ color: "var(--color-white)" }}>{iban}</span>
                </div>
              </div>
              <button onClick={handleSubmit} className="w-full py-3.5 rounded-xl font-semibold text-base transition-all" style={{ background: "var(--color-yellow)", color: "var(--color-black)" }}>
                Stellar Cüzdanında İmzala
              </button>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ background: "rgba(34,197,94,0.1)", border: "2px solid var(--color-success)" }}>
                <CheckCircle2 size={28} style={{ color: "var(--color-success)" }} />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2" style={{ color: "var(--color-white)" }}>İşlem Başlatıldı!</h3>
                <p className="text-sm" style={{ color: "var(--color-white-muted)" }}>{amount} USDC çekim işleminiz Stellar ağında onaylandı. 1-2 iş günü içinde IBAN&apos;ınıza TRY olarak yatırılacak.</p>
              </div>
              <div className="p-3 rounded-xl text-xs font-mono" style={{ background: "var(--color-black-muted)", color: "var(--color-white-dim)" }}>TX: 0xf3a9...c812b</div>
              <button onClick={onClose} className="w-full py-3 rounded-xl font-medium transition-all" style={{ background: "var(--color-black-muted)", color: "var(--color-white)", border: "1px solid var(--color-black-border)" }}>Kapat</button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Wallet Modal ──────────────────────────────────────────────────────────────
function WalletModal({ address, onClose, onDisconnect }: { address: string; onClose: () => void; onDisconnect: () => void }) {
  const [showIBAN, setShowIBAN] = useState(false);
  const [copied, setCopied] = useState(false);
  const shortAddr = `${address.slice(0, 6)}...${address.slice(-4)}`;

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const investments = [
    { name: "AgroChain AI", amount: 500, date: "15 Eyl 2026", status: "active" },
    { name: "EduFund DAO", amount: 250, date: "12 Eyl 2026", status: "active" },
    { name: "PayLink Stellar", amount: 500, date: "10 Eyl 2026", status: "active" },
  ];

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
                <p className="text-sm font-semibold" style={{ color: "var(--color-white)" }}>Cüzdanım</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono" style={{ color: "var(--color-white-muted)" }}>{shortAddr}</span>
                  <button onClick={copyAddress} className="transition-colors">
                    {copied ? <CheckCircle2 size={12} style={{ color: "var(--color-success)" }} /> : <Copy size={12} style={{ color: "var(--color-white-dim)" }} />}
                  </button>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: "var(--color-white-dim)" }}><X size={16} /></button>
          </div>

          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--color-black-border)" }}>
            <p className="text-xs font-medium mb-1" style={{ color: "var(--color-white-dim)" }}>Toplam Bakiye</p>
            <p className="text-3xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--color-white)" }}>
              2,450 <span className="text-lg font-medium" style={{ color: "var(--color-yellow)" }}>USDC</span>
            </p>
            <p className="text-sm mt-0.5" style={{ color: "var(--color-white-dim)" }}>≈ 83,790 ₺</p>
            <button
              onClick={() => setShowIBAN(true)}
              className="w-full mt-4 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: "var(--color-yellow)", color: "var(--color-black)", boxShadow: "0 4px 16px var(--color-yellow-glow)" }}
            >
              <ArrowDownRight size={16} />
              Fonu Bankaya Çek (TRY)
            </button>
          </div>

          <div className="px-5 py-4">
            <p className="text-xs font-medium mb-3" style={{ color: "var(--color-white-dim)" }}>YATIRIMLARIM</p>
            <div className="space-y-2">
              {investments.map((inv) => (
                <div key={inv.name} className="flex items-center justify-between py-2.5 px-3 rounded-xl" style={{ background: "var(--color-black-muted)" }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--color-white)" }}>{inv.name}</p>
                    <p className="text-xs" style={{ color: "var(--color-white-dim)" }}>{inv.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold" style={{ color: "var(--color-white)" }}>{inv.amount} USDC</p>
                    <div className="flex items-center gap-1 justify-end">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--color-success)" }} />
                      <span className="text-xs" style={{ color: "var(--color-success)" }}>Aktif</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: "1px solid var(--color-black-border)" }}>
            <a href={`https://stellar.expert/explorer/public/account/${address}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs" style={{ color: "var(--color-white-dim)" }}>
              <ExternalLink size={12} />
              Explorer&apos;da Gör
            </a>
            <button onClick={onDisconnect} className="text-xs px-3 py-1.5 rounded-lg" style={{ color: "var(--color-danger)", border: "1px solid rgba(239,68,68,0.2)" }}>
              Bağlantıyı Kes
            </button>
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>{showIBAN && <IBANModal onClose={() => setShowIBAN(false)} />}</AnimatePresence>
    </>
  );
}

// ── Freighter Error Modal ─────────────────────────────────────────────────────
function FreighterErrorModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
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
          Freighter Bulunamadı
        </h3>
        <p className="text-sm mb-5" style={{ color: "var(--color-white-muted)" }}>
          Stellar cüzdanınızı bağlamak için Freighter tarayıcı uzantısını yüklemeniz gerekiyor.
        </p>
        <a
          href="https://www.freighter.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-3 rounded-xl font-semibold text-sm mb-3 transition-all"
          style={{ background: "var(--color-yellow)", color: "var(--color-black)" }}
        >
          Freighter&apos;ı İndir →
        </a>
        <button onClick={onClose} className="w-full py-2.5 rounded-xl text-sm" style={{ color: "var(--color-white-muted)", border: "1px solid var(--color-black-border)" }}>
          Kapat
        </button>
      </motion.div>
    </motion.div>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
const navLinks = [
  { label: "Projeleri Keşfet", href: "/projects" },
  { label: "Proje Başvurusu Yap", href: "/launch" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [showWallet, setShowWallet] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [showFreighterError, setShowFreighterError] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Auto-check if Freighter already connected on mount
  useEffect(() => {
    (async () => {
      const freighter = await getFreighter();
      if (!freighter) return;
      try {
        const connected = await freighter.isConnected();
        if (connected?.isConnected) {
          const res = await freighter.getAddress();
          if (res?.address) setWalletAddress(res.address);
        }
      } catch {
        // not connected, ignore
      }
    })();
  }, []);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const freighter = await getFreighter();

      if (!freighter) {
        setShowFreighterError(true);
        setConnecting(false);
        return;
      }

      // Check if Freighter extension is installed
      const connected = await freighter.isConnected();
      if (!connected?.isConnected) {
        setShowFreighterError(true);
        setConnecting(false);
        return;
      }

      // Request access (opens Freighter popup)
      const accessRes = await freighter.requestAccess();
      if (accessRes?.address) {
        setWalletAddress(accessRes.address);
      } else {
        const addrRes = await freighter.getAddress();
        if (addrRes?.address) {
          setWalletAddress(addrRes.address);
        }
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error("Freighter connection error:", error?.message ?? err);
      // If user rejected — silently ignore
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setWalletAddress(null);
    setShowWallet(false);
  };

  const shortAddr = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : null;

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
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105" style={{ background: "var(--color-yellow)" }}>
              <Egg size={16} style={{ color: "var(--color-black)" }} />
            </div>
            <span className="text-lg font-bold tracking-tight" style={{ fontFamily: "var(--font-display)", color: "var(--color-white)" }}>
              De<span style={{ color: "var(--color-yellow)" }}>Hatch</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href} href={link.href}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-white/5"
                style={{ color: "var(--color-white-muted)" }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Network Badge */}
            <div
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "var(--color-success)" }}
            >
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--color-success)" }} />
              Stellar Testnet
            </div>

            {/* Wallet Button */}
            {walletAddress ? (
              <button
                onClick={() => setShowWallet(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.97]"
                style={{ background: "var(--color-black-card)", border: "1px solid var(--color-black-border)", color: "var(--color-white)" }}
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "var(--color-yellow)", color: "var(--color-black)" }}>
                  {walletAddress[0]}
                </div>
                {shortAddr}
                <ChevronDown size={14} style={{ color: "var(--color-white-dim)" }} />
              </button>
            ) : (
              <motion.button
                onClick={handleConnect}
                disabled={connecting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: connecting ? "var(--color-black-muted)" : "var(--color-yellow)",
                  color: connecting ? "var(--color-white-muted)" : "var(--color-black)",
                  cursor: connecting ? "wait" : "pointer",
                }}
                whileHover={connecting ? {} : { scale: 1.02 }}
                whileTap={connecting ? {} : { scale: 0.97 }}
              >
                {connecting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--color-white-muted)", borderTopColor: "transparent" }} />
                    Bağlanıyor...
                  </>
                ) : (
                  <>
                    <Wallet size={15} />
                    Cüzdan Bağla
                  </>
                )}
              </motion.button>
            )}

            {/* Mobile Menu */}
            <button className="md:hidden p-2 rounded-lg" onClick={() => setMobileOpen(!mobileOpen)} style={{ color: "var(--color-white-muted)" }}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
              style={{ background: "var(--color-black-card)", borderTop: "1px solid var(--color-black-border)" }}
            >
              <div className="px-6 py-4 space-y-1">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-medium" style={{ color: "var(--color-white-muted)" }}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Modals */}
      <AnimatePresence>
        {showWallet && walletAddress && (
          <WalletModal address={walletAddress} onClose={() => setShowWallet(false)} onDisconnect={handleDisconnect} />
        )}
        {showFreighterError && (
          <FreighterErrorModal onClose={() => setShowFreighterError(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
