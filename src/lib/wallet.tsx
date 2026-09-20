"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { NETWORK_PASSPHRASE } from "@/lib/anchor/config";
import { clearToken } from "@/lib/anchor/sep";

export type WalletIssue = "not-installed" | "rejected" | "timeout" | "failed";
export type NetworkState = "testnet" | "other" | "unknown";

interface WalletContextValue {
  address: string | null;
  connecting: boolean;
  /** Why the last connect attempt failed (null = no problem to show). */
  issue: WalletIssue | null;
  issueDetail: string | null;
  /** Is Freighter on Stellar Testnet? "unknown" when it cannot tell (never blocks the user). */
  network: NetworkState;
  networkName: string | null;
  connect: () => Promise<string | null>;
  disconnect: () => void;
  /** Sign a transaction XDR with Freighter. Throws an Error whose message is an i18n key. */
  sign: (xdr: string) => Promise<string>;
  dismissIssue: () => void;
}

const WalletContext = createContext<WalletContextValue | null>(null);

// Freighter is browser-only; import lazily so SSR never touches it.
const freighter = () => import("@stellar/freighter-api");

class TimeoutError extends Error {}

/** Freighter's requestAccess/signTransaction have no timeout of their own and can hang forever. */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new TimeoutError()), ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      },
    );
  });
}

const CONNECT_TIMEOUT_MS = 90_000;
const SIGN_TIMEOUT_MS = 180_000;

async function readNetwork(): Promise<{ network: NetworkState; name: string | null }> {
  try {
    const f = await freighter();
    // getNetworkDetails throws on older/partial extension replies — treat that as "unknown".
    const n = await withTimeout(f.getNetworkDetails(), 5_000);
    if (n.error || !n.networkPassphrase) return { network: "unknown", name: null };
    return n.networkPassphrase === NETWORK_PASSPHRASE
      ? { network: "testnet", name: n.network ?? null }
      : { network: "other", name: n.network || null };
  } catch {
    return { network: "unknown", name: null };
  }
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [issue, setIssue] = useState<WalletIssue | null>(null);
  const [issueDetail, setIssueDetail] = useState<string | null>(null);
  const [network, setNetwork] = useState<NetworkState>("unknown");
  const [networkName, setNetworkName] = useState<string | null>(null);

  const refreshNetwork = useCallback(async () => {
    const n = await readNetwork();
    setNetwork(n.network);
    setNetworkName(n.name);
  }, []);

  // Silent reconnect if the user already authorised this site.
  useEffect(() => {
    (async () => {
      try {
        const f = await freighter();
        // isConnected() has a 2s built-in timeout; isAllowed() does not, so check presence first.
        if (!(await f.isConnected()).isConnected) return;
        if (!(await withTimeout(f.isAllowed(), 5_000)).isAllowed) return;
        const res = await withTimeout(f.getAddress(), 5_000);
        if (res.address) {
          setAddress(res.address);
          void refreshNetwork();
        }
      } catch {
        // extension missing or locked — stay disconnected
      }
    })();
  }, [refreshNetwork]);

  // The user may switch networks inside Freighter and come back to this tab.
  useEffect(() => {
    if (!address) return;
    const onFocus = () => void refreshNetwork();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [address, refreshNetwork]);

  const fail = (kind: WalletIssue, detail?: string | null) => {
    setIssue(kind);
    setIssueDetail(detail ?? null);
    return null;
  };

  const connect = useCallback(async () => {
    setConnecting(true);
    setIssue(null);
    setIssueDetail(null);
    try {
      const f = await freighter();
      if (!(await f.isConnected()).isConnected) return fail("not-installed");

      const access = await withTimeout(f.requestAccess(), CONNECT_TIMEOUT_MS); // opens the Freighter popup
      if (access.error || !access.address) return fail("rejected", access.error?.message);

      setAddress(access.address);
      void refreshNetwork(); // a wrong network is a warning, never a reason to refuse the connection
      return access.address;
    } catch (e) {
      console.error("Freighter connect failed", e);
      return e instanceof TimeoutError ? fail("timeout") : fail("failed", e instanceof Error ? e.message : null);
    } finally {
      setConnecting(false);
    }
  }, [refreshNetwork]);

  const disconnect = useCallback(() => {
    clearToken();
    setAddress(null);
    setNetwork("unknown");
    setNetworkName(null);
  }, []);

  const sign = useCallback(
    async (xdr: string) => {
      if (!address) throw new Error("wallet.err.notConnected");
      if (network === "other") throw new Error("wallet.err.wrongNetwork");
      const { signTransaction } = await freighter();
      try {
        const res = await withTimeout(
          signTransaction(xdr, { networkPassphrase: NETWORK_PASSPHRASE, address }),
          SIGN_TIMEOUT_MS,
        );
        if (res.error) throw new Error(res.error.message || "wallet.err.signRejected");
        return res.signedTxXdr;
      } catch (e) {
        if (e instanceof TimeoutError) throw new Error("wallet.err.timeout");
        throw e;
      }
    },
    [address, network],
  );

  const value = useMemo(
    () => ({
      address,
      connecting,
      issue,
      issueDetail,
      network,
      networkName,
      connect,
      disconnect,
      sign,
      dismissIssue: () => {
        setIssue(null);
        setIssueDetail(null);
      },
    }),
    [address, connecting, issue, issueDetail, network, networkName, connect, disconnect, sign],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside <WalletProvider>");
  return ctx;
}
