import { WebAuth } from "@stellar/stellar-sdk";
import {
  ANCHOR_HOME_DOMAIN,
  ANCHOR_URL,
  ASSET_CODE,
  NETWORK_PASSPHRASE,
} from "./config";
import type {
  AnchorInfo,
  AnchorTransaction,
  DepositInstructions,
  StellarToml,
  WithdrawInstructions,
} from "./types";

export class AnchorError extends Error {}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    // non-JSON body
  }
  if (!res.ok) {
    const msg =
      (body as { error?: string } | null)?.error ?? `Anchor ${res.status}: ${text.slice(0, 120)}`;
    throw new AnchorError(msg);
  }
  return body as T;
}

// ── SEP-1 ─────────────────────────────────────────────────────────────────────
// Minimal parser: we only need top-level string keys plus the [[CURRENCIES]] table.
export function parseToml(src: string): StellarToml {
  const root: Record<string, string> = {};
  const currencies: { code: string; issuer: string }[] = [];
  let current: Record<string, string> | null = null;
  for (const raw of src.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    if (line === "[[CURRENCIES]]") {
      current = {};
      currencies.push(current as { code: string; issuer: string });
      continue;
    }
    if (line.startsWith("[")) {
      current = null;
      continue;
    }
    const m = line.match(/^([A-Za-z0-9_]+)\s*=\s*"(.*)"\s*$/);
    if (m) (current ?? root)[m[1]] = m[2];
  }
  return { ...(root as unknown as StellarToml), CURRENCIES: currencies };
}

let tomlCache: Promise<StellarToml> | null = null;
export function fetchToml(): Promise<StellarToml> {
  tomlCache ??= fetch(`${ANCHOR_URL}/.well-known/stellar.toml`)
    .then((r) => {
      if (!r.ok) throw new AnchorError(`stellar.toml: HTTP ${r.status}`);
      return r.text();
    })
    .then(parseToml)
    .catch((e) => {
      tomlCache = null;
      throw e;
    });
  return tomlCache;
}

export async function getAssetIssuer(): Promise<string> {
  const toml = await fetchToml();
  const issuer = toml.CURRENCIES?.find((c) => c.code === ASSET_CODE)?.issuer;
  if (!issuer) throw new AnchorError(`${ASSET_CODE} is not listed in the anchor stellar.toml`);
  return issuer;
}

// ── SEP-10 ────────────────────────────────────────────────────────────────────
export type SignXdr = (xdr: string) => Promise<string>;

const TOKEN_KEY = "anchor_jwt";
interface StoredToken {
  account: string;
  token: string;
  exp: number;
}

function jwtExp(token: string): number {
  try {
    const b64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(b64));
    return typeof payload.exp === "number" ? payload.exp * 1000 : 0;
  } catch {
    return 0;
  }
}

function loadToken(account: string): string | null {
  try {
    const s: StoredToken | null = JSON.parse(sessionStorage.getItem(TOKEN_KEY) ?? "null");
    if (s && s.account === account && s.exp > Date.now() + 30_000) return s.token;
  } catch {
    // storage unavailable — fall through to fresh auth
  }
  return null;
}

/** Authenticate with the anchor (SEP-10). Reuses a cached JWT while it is valid. */
export async function authenticate(account: string, sign: SignXdr): Promise<string> {
  const cached = loadToken(account);
  if (cached) return cached;

  const toml = await fetchToml();
  const { transaction, network_passphrase } = await request<{
    transaction: string;
    network_passphrase?: string;
  }>(`${toml.WEB_AUTH_ENDPOINT}?account=${account}&home_domain=${ANCHOR_HOME_DOMAIN}`);

  if ((network_passphrase ?? NETWORK_PASSPHRASE) !== NETWORK_PASSPHRASE) {
    throw new AnchorError("Anchor is on a different Stellar network");
  }

  // Never sign a challenge we haven't verified: server signature, home domain, client account.
  const webAuthDomain = new URL(toml.WEB_AUTH_ENDPOINT).host;
  const { clientAccountID } = WebAuth.readChallengeTx(
    transaction,
    toml.SIGNING_KEY,
    NETWORK_PASSPHRASE,
    ANCHOR_HOME_DOMAIN,
    webAuthDomain,
  );
  if (clientAccountID !== account) throw new AnchorError("Challenge is for a different account");

  const signed = await sign(transaction);
  const { token } = await request<{ token: string }>(toml.WEB_AUTH_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transaction: signed }),
  });

  try {
    sessionStorage.setItem(
      TOKEN_KEY,
      JSON.stringify({ account, token, exp: jwtExp(token) } satisfies StoredToken),
    );
  } catch {
    // ignore
  }
  return token;
}

export function clearToken() {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

// ── SEP-6 ─────────────────────────────────────────────────────────────────────
async function sep6<T>(path: string, token?: string, params?: Record<string, string>): Promise<T> {
  const toml = await fetchToml();
  const qs = params ? `?${new URLSearchParams(params)}` : "";
  return request<T>(`${toml.TRANSFER_SERVER}${path}${qs}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}

export const getInfo = () => sep6<AnchorInfo>("/info");

export const startDeposit = (token: string, account: string, amount: string) =>
  sep6<DepositInstructions>("/deposit", token, {
    asset_code: ASSET_CODE,
    account,
    amount,
    type: "bank_account",
  });

export const startWithdraw = (token: string, account: string, amount: string) =>
  sep6<WithdrawInstructions>("/withdraw", token, {
    asset_code: ASSET_CODE,
    account,
    amount,
    type: "bank_account",
  });

export async function getTransaction(token: string, id: string): Promise<AnchorTransaction> {
  const res = await sep6<{ transaction: AnchorTransaction }>("/transaction", token, { id });
  return res.transaction;
}

export async function listTransactions(token: string): Promise<AnchorTransaction[]> {
  const res = await sep6<{ transactions: AnchorTransaction[] }>("/transactions", token, {
    asset_code: ASSET_CODE,
  });
  return res.transactions;
}
