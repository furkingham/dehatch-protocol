export interface StellarToml {
  WEB_AUTH_ENDPOINT: string;
  TRANSFER_SERVER: string;
  KYC_SERVER?: string;
  ANCHOR_QUOTE_SERVER?: string;
  SIGNING_KEY: string;
  NETWORK_PASSPHRASE?: string;
  CURRENCIES?: { code: string; issuer: string }[];
}

export interface AnchorInfo {
  deposit: Record<string, { enabled: boolean; fee_percent?: number }>;
  withdraw: Record<string, { enabled: boolean; fee_percent?: number }>;
}

export type AnchorStatus =
  | "incomplete"
  | "pending_user_transfer_start"
  | "pending_user_transfer_complete"
  | "pending_anchor"
  | "pending_trust"
  | "pending_stellar"
  | "completed"
  | "refunded"
  | "expired"
  | "error";

export interface AnchorTransaction {
  id: string;
  kind: string;
  status: AnchorStatus;
  more_info_url?: string;
  amount_in?: string;
  amount_out?: string;
  amount_fee?: string;
  stellar_transaction_id?: string;
  message?: string;
  [key: string]: unknown;
}

export interface DepositInstructions {
  id: string;
  how?: string;
  instructions?: Record<string, { value: string; description?: string }>;
  fee_fixed?: number;
  fee_percent?: number;
  [key: string]: unknown;
}

export interface WithdrawInstructions {
  id: string;
  account_id: string;
  memo_type?: string;
  memo?: string;
  [key: string]: unknown;
}
