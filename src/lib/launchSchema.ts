import { z } from "zod";

// Every message below is an i18n key (see src/lib/i18n/dict.ts). "key|a|b" carries parameters and
// "@key" marks a parameter that must itself be translated. The UI translates them when displaying.

export const CATEGORIES = ["AI/ML", "DeFi", "EdTech", "HealthTech", "GreenTech", "SaaS"] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────
const NAME_RE = /^\p{L}+(?:\s+\p{L}+)*$/u; // letters and spaces only — no digits or symbols
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
const ROLE_RE = /^[\p{L}\s/&.-]+$/u;
const STELLAR_KEY_RE = /^G[A-Z2-7]{55}$/; // 56 chars, starts with G, base32 alphabet

const isHttpUrl = (v: string) => {
  if (!/^https?:\/\//i.test(v)) return false;
  try {
    const u = new URL(v);
    return (u.protocol === "http:" || u.protocol === "https:") && u.hostname.includes(".");
  } catch {
    return false;
  }
};

const normalizePhone = (v: string) => v.replace(/[\s()-]/g, "");

// USDC has 7 decimals. Money is compared as exact integers (BigInt) — never floats —
// so 0.1 + 0.2 style rounding can never make the milestone sum mismatch or falsely match.
const DECIMALS = 7;
const UNIT = BigInt(10) ** BigInt(DECIMALS);
const ZERO = BigInt(0);

export function toUnits(value: string): bigint | null {
  const m = value.trim().match(/^(\d+)(?:\.(\d{1,7}))?$/);
  if (!m) return null;
  return BigInt(m[1]) * UNIT + BigInt((m[2] ?? "").padEnd(DECIMALS, "0"));
}

function splitUnits(units: bigint) {
  return {
    whole: units / UNIT,
    frac: (units % UNIT).toString().padStart(DECIMALS, "0").replace(/0+$/, ""),
  };
}

/** "15000.5" — no grouping, dot decimal; safe to embed in messages that are translated later. */
export function plainUnits(units: bigint): string {
  const { whole, frac } = splitUnits(units);
  return `${whole}${frac ? `.${frac}` : ""}`;
}

/** Locale-aware display, e.g. "15.000,5" (tr-TR) or "15,000.5" (en-US). */
export function formatUnits(units: bigint, locale = "en-US"): string {
  const { whole, frac } = splitUnits(units);
  const decimal = (0.5).toLocaleString(locale).charAt(1);
  return `${whole.toLocaleString(locale)}${frac ? `${decimal}${frac}` : ""}`;
}

const pad = (n: number) => String(n).padStart(2, "0");
const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Local calendar date of "today", evaluated at call time (not import time). */
export const todayISO = () => toISO(new Date());
export const tomorrowISO = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return toISO(d);
};

const isRealDate = (v: string) => {
  const m = v.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(y, mo - 1, d);
  return date.getFullYear() === y && date.getMonth() === mo - 1 && date.getDate() === d;
};

// ── Reusable field rules (label = i18n key of the field name) ─────────────────
const personName = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `v.required|@${label}`)
    .min(3, `v.min|@${label}|3`)
    .regex(NAME_RE, "v.nameChars");

const email = z
  .string()
  .trim()
  .min(1, "v.required|@f.email")
  .regex(EMAIL_RE, "v.email");

const minText = (label: string, min: number) =>
  z.string().trim().min(1, `v.required|@${label}`).min(min, `v.min|@${label}|${min}`);

const optionalUrl = (label: string) =>
  z
    .string()
    .trim()
    .refine((v) => v === "" || isHttpUrl(v), `v.url|@${label}`);

// ── Step 1: Personal ──────────────────────────────────────────────────────────
export const personalSchema = z.object({
  fullName: personName("f.fullName"),
  email,
  phone: z
    .string()
    .trim()
    .min(1, "v.required|@f.phone")
    .refine((v) => /^\+?\d{10,15}$/.test(normalizePhone(v)), "v.phone"),
  university: minText("f.university", 5),
  department: minText("f.department", 5),
  year: z.string().trim(),
  linkedin: optionalUrl("f.linkedin"),
  walletAddress: z
    .string()
    .trim()
    .refine((v) => v === "" || STELLAR_KEY_RE.test(v), "v.wallet"),
});

// ── Step 2: Team (additional members only — the applicant is the leader) ──────
export const memberSchema = z.object({
  name: personName("f.fullName"),
  role: z
    .string()
    .trim()
    .min(1, "v.required|@f.role")
    .min(2, "v.min|@f.role|2")
    .regex(ROLE_RE, "v.roleChars"),
  email,
  university: z
    .string()
    .trim()
    .refine((v) => v === "" || v.length >= 5, "v.min|@f.university|5"),
});

export const teamSchema = z.object({
  members: z.array(memberSchema).max(5, "v.membersMax"),
});

// ── Step 3: Project ───────────────────────────────────────────────────────────
const amount = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `v.required|@${label}`)
    .refine((v) => toUnits(v) !== null, "v.number")
    .refine((v) => {
      const u = toUnits(v);
      return u === null || u > ZERO;
    }, `v.positive|@${label}`);

export const milestoneSchema = z.object({
  title: minText("f.stageTitle", 3),
  amount: amount("f.amountShort"),
  description: minText("f.stageDesc", 10),
  date: z
    .string()
    .min(1, "v.dateRequired")
    .refine(isRealDate, "v.dateInvalid")
    .refine((v) => !isRealDate(v) || v > todayISO(), "v.dateFuture"),
});

export const projectSchema = z
  .object({
    projectName: minText("f.projectName", 10),
    category: z.string().refine((v) => (CATEGORIES as readonly string[]).includes(v), "v.category"),
    tagline: minText("f.tagline", 10),
    description: minText("f.description", 100),
    howItWorks: minText("f.howItWorks", 100),
    goalAmount: z
      .string()
      .trim()
      .min(1, "v.goalRequired")
      .refine((v) => toUnits(v) !== null, "v.number")
      .refine((v) => {
        const u = toUnits(v);
        return u === null || u > BigInt(100) * UNIT;
      }, "v.goalMin"),
    pitchDeckUrl: optionalUrl("f.pitch"),
    milestones: z
      .array(milestoneSchema)
      .min(1, "v.milestonesMin")
      .max(5, "v.milestonesMax"),
  })
  .superRefine((p, ctx) => {
    // Cross-field check: only meaningful once the goal and every amount are individually valid,
    // otherwise the per-field errors are the ones the user should fix first.
    const goal = toUnits(p.goalAmount);
    if (goal === null || goal <= BigInt(100) * UNIT) return;

    let sum = ZERO;
    for (const m of p.milestones) {
      const u = toUnits(m.amount);
      if (u === null || u <= ZERO) return;
      sum += u;
    }
    if (sum !== goal) {
      const diff = sum > goal ? sum - goal : goal - sum;
      ctx.addIssue({
        code: "custom",
        path: ["milestones"],
        message: `v.sum|${plainUnits(sum)}|${plainUnits(goal)}|${plainUnits(diff)}`,
      });
    }
  });

// ── Whole form ────────────────────────────────────────────────────────────────
export const launchSchema = z.object({
  personal: personalSchema,
  team: teamSchema,
  project: projectSchema,
});

export type LaunchFormValues = z.infer<typeof launchSchema>;

export const STEP_KEYS = ["personal", "team", "project"] as const;
export const STEP_SCHEMAS = [personalSchema, teamSchema, projectSchema] as const;

/** Live milestone total vs. goal, for the on-screen indicator. */
export function milestoneTotals(p: LaunchFormValues["project"]) {
  const goal = toUnits(p.goalAmount ?? "");
  let sum = ZERO;
  for (const m of p.milestones ?? []) sum += toUnits(m.amount ?? "") ?? ZERO;
  return { goal, sum, matches: goal !== null && goal === sum };
}
