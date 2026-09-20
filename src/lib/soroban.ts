import {
  Account,
  Address,
  BASE_FEE,
  Contract,
  Keypair,
  TransactionBuilder,
  nativeToScVal,
  rpc,
  scValToNative,
} from "@stellar/stellar-sdk";
import { NETWORK_PASSPHRASE } from "@/lib/anchor/config";
import type { SignXdr } from "@/lib/anchor/sep";

// NEXT_PUBLIC_* must be referenced literally so Next can inline them at build time.
// Defaults to the public testnet deployment so a fresh clone works without any setup.
// Override in .env.local after redeploying (see .env.example).
export const CROWDFUND_CONTRACT_ID =
  process.env.NEXT_PUBLIC_CROWDFUND_CONTRACT_ID ?? "CANWMWKEIXKIJI4UZSYA7KE247V6CHHG4ZLIIA35KCTTTOWZKXDGVRDS";
export const RPC_URL = process.env.NEXT_PUBLIC_SOROBAN_RPC_URL ?? "https://soroban-testnet.stellar.org";
export const USDC_DECIMALS = 7;

/** Message is an i18n key (optionally `key|param`); use `t(error.message)` to display it. */
export class SorobanError extends Error {}

// Mirrors `Error` in contracts/crowdfund/src/lib.rs (codes 1-11). Messages live in i18n/dict.ts as `sb.err.<code>`.
const CONTRACT_ERROR_CODES = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);

function explain(raw: string): string {
  // The event log lists newest-first; the last error event is the contract that originally failed.
  const failures = [...raw.matchAll(/contract:(C[A-Z0-9]{55}), topics:\[error, Error\(Contract, #(\d+)\)/g)];
  const origin = failures[failures.length - 1];
  if (origin && origin[1] === CROWDFUND_CONTRACT_ID && CONTRACT_ERROR_CODES.has(Number(origin[2]))) {
    return `sb.err.${origin[2]}`;
  }
  // Otherwise the USDC token contract rejected the transfer.
  if (/trustline entry is missing/i.test(raw)) return "sb.err.trustline";
  if (/balance is not sufficient|insufficient/i.test(raw) || origin) return "sb.err.balance";
  return raw.length > 200 ? `${raw.slice(0, 200)}…` : raw;
}

const server = new rpc.Server(RPC_URL);

function contract(): Contract {
  if (!CROWDFUND_CONTRACT_ID) {
    throw new SorobanError("sb.err.noContractId");
  }
  return new Contract(CROWDFUND_CONTRACT_ID);
}

/** "12.5" → 125000000n (7-decimals, exact — no float math). */
export function parseUsdc(value: string): bigint {
  const [whole, frac = ""] = value.trim().split(".");
  if (!/^\d+$/.test(whole || "0") || !/^\d*$/.test(frac)) throw new SorobanError("sb.err.5");
  return BigInt(whole || "0") * BigInt(10) ** BigInt(USDC_DECIMALS) + BigInt(frac.padEnd(USDC_DECIMALS, "0").slice(0, USDC_DECIMALS));
}

export function formatUsdc(stroops: bigint): number {
  return Number(stroops) / 10 ** USDC_DECIMALS;
}

export interface OnChainProject {
  owner: string;
  goal: bigint;
  raised: bigint;
  released: bigint;
  investors: number;
  milestones_total: number;
  milestones_released: number;
}

export interface OnChainMilestone {
  amount: bigint;
  released: boolean;
}

async function read<T>(method: string, ...args: Parameters<Contract["call"]>[1][]): Promise<T> {
  // Read-only simulation: source account is never charged, any valid key works.
  const source = new Account(Keypair.random().publicKey(), "0");
  const tx = new TransactionBuilder(source, { fee: BASE_FEE, networkPassphrase: NETWORK_PASSPHRASE })
    .addOperation(contract().call(method, ...args))
    .setTimeout(30)
    .build();
  const sim = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(sim)) throw new SorobanError(explain(sim.error));
  if (!sim.result) throw new SorobanError("sb.err.empty");
  return scValToNative(sim.result.retval) as T;
}

const str = (v: string) => nativeToScVal(v, { type: "string" });

/** Live funding/milestone status for a project slug. */
export const getProjectStatus = (slug: string) => read<OnChainProject>("get_status", str(slug));

export const getMilestones = (slug: string) => read<OnChainMilestone[]>("get_milestones", str(slug));

export const getContribution = (slug: string, investor: string) =>
  read<bigint>("get_contribution", str(slug), new Address(investor).toScVal());

/**
 * Invest USDC into a project. The investor signs one Soroban transaction via
 * `sign` (Freighter); the contract pulls the USDC from the investor's wallet.
 */
export async function invest(
  slug: string,
  investor: string,
  amountUsdc: string,
  sign: SignXdr,
): Promise<{ hash: string }> {
  const amount = parseUsdc(amountUsdc);
  if (amount <= BigInt(0)) throw new SorobanError("sb.err.5");

  const account = await server.getAccount(investor);
  const built = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: NETWORK_PASSPHRASE })
    .addOperation(
      contract().call("invest", str(slug), new Address(investor).toScVal(), nativeToScVal(amount, { type: "i128" })),
    )
    .setTimeout(60)
    .build();

  let prepared;
  try {
    prepared = await server.prepareTransaction(built); // simulates + attaches footprint/auth/fees
  } catch (e) {
    throw new SorobanError(explain(e instanceof Error ? e.message : String(e)));
  }

  const signedXdr = await sign(prepared.toXDR());
  const sent = await server.sendTransaction(TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE));
  if (sent.status === "ERROR") throw new SorobanError("sb.err.rejected");

  for (let i = 0; i < 30; i++) {
    const res = await server.getTransaction(sent.hash);
    if (res.status === rpc.Api.GetTransactionStatus.SUCCESS) return { hash: sent.hash };
    if (res.status === rpc.Api.GetTransactionStatus.FAILED) {
      throw new SorobanError("sb.err.failed");
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  throw new SorobanError(`sb.err.timeout|${sent.hash}`);
}

export const explorerTxUrl = (hash: string) => `https://stellar.expert/explorer/testnet/tx/${hash}`;
