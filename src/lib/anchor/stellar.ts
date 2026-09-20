import { Asset, Horizon, Memo, Operation, TransactionBuilder } from "@stellar/stellar-sdk";
import { ASSET_CODE, HORIZON_URL, NETWORK_PASSPHRASE } from "./config";
import { getAssetIssuer, type SignXdr } from "./sep";
import type { WithdrawInstructions } from "./types";

const server = new Horizon.Server(HORIZON_URL);

export interface UsdcState {
  accountExists: boolean;
  hasTrustline: boolean;
  balance: string;
}

export async function getUsdcState(account: string): Promise<UsdcState> {
  const issuer = await getAssetIssuer();
  try {
    const acc = await server.loadAccount(account);
    const line = acc.balances.find(
      (b) => "asset_code" in b && b.asset_code === ASSET_CODE && b.asset_issuer === issuer,
    );
    return { accountExists: true, hasTrustline: !!line, balance: line?.balance ?? "0" };
  } catch (e) {
    if ((e as { response?: { status?: number } })?.response?.status === 404) {
      return { accountExists: false, hasTrustline: false, balance: "0" };
    }
    throw e;
  }
}

async function submit(xdr: string): Promise<string> {
  const tx = TransactionBuilder.fromXDR(xdr, NETWORK_PASSPHRASE);
  const res = await server.submitTransaction(tx);
  return res.hash;
}

/** Opt the account into USDC so the anchor can pay it directly. */
export async function addUsdcTrustline(account: string, sign: SignXdr): Promise<string> {
  const issuer = await getAssetIssuer();
  const acc = await server.loadAccount(account);
  const tx = new TransactionBuilder(acc, {
    fee: (await server.fetchBaseFee()).toString(),
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(Operation.changeTrust({ asset: new Asset(ASSET_CODE, issuer) }))
    .setTimeout(120)
    .build();
  return submit(await sign(tx.toXDR()));
}

/** Pay the anchor the USDC (with the SEP-6 memo) to complete a withdrawal. */
export async function payWithdrawal(
  account: string,
  amount: string,
  w: WithdrawInstructions,
  sign: SignXdr,
): Promise<string> {
  const issuer = await getAssetIssuer();
  const acc = await server.loadAccount(account);
  const builder = new TransactionBuilder(acc, {
    fee: (await server.fetchBaseFee()).toString(),
    networkPassphrase: NETWORK_PASSPHRASE,
  }).addOperation(
    Operation.payment({
      destination: w.account_id,
      asset: new Asset(ASSET_CODE, issuer),
      amount,
    }),
  );

  if (w.memo) {
    switch (w.memo_type) {
      case "id":
        builder.addMemo(Memo.id(w.memo));
        break;
      case "hash":
        builder.addMemo(Memo.hash(Buffer.from(w.memo, "base64").toString("hex")));
        break;
      default:
        builder.addMemo(Memo.text(w.memo));
    }
  }

  const tx = builder.setTimeout(120).build();
  return submit(await sign(tx.toXDR()));
}
