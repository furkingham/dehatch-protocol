"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  useFieldArray,
  useForm,
  useWatch,
  type UseFormRegisterReturn,
  type UseFormReturn,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  User,
  Users,
  Layers,
  Plus,
  Trash2,
} from "lucide-react";
import { saveApplication } from "@/lib/applicationStore";
import Logo from "@/components/layout/Logo";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import AuthGate from "@/components/auth/AuthGate";
import {
  CATEGORIES,
  STEP_KEYS,
  STEP_SCHEMAS,
  formatUnits,
  launchSchema,
  milestoneTotals,
  tomorrowISO,
  type LaunchFormValues,
} from "@/lib/launchSchema";

type Form = UseFormReturn<LaunchFormValues>;

const STEPS = [
  { id: 1, titleKey: "launch.step1", icon: <User size={16} /> },
  { id: 2, titleKey: "launch.step2", icon: <Users size={16} /> },
  { id: 3, titleKey: "launch.step3", icon: <Layers size={16} /> },
];

const DEFAULT_VALUES: LaunchFormValues = {
  personal: {
    fullName: "",
    email: "",
    phone: "",
    university: "",
    department: "",
    year: "",
    linkedin: "",
    walletAddress: "",
  },
  team: { members: [] },
  project: {
    projectName: "",
    category: "",
    tagline: "",
    description: "",
    howItWorks: "",
    goalAmount: "",
    pitchDeckUrl: "",
    milestones: [{ title: "", amount: "", description: "", date: "" }],
  },
};

// ── Field primitives ──────────────────────────────────────────────────────────
function Field({
  label,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { t } = useI18n();
  return (
    <div className={className}>
      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-white-muted)" }}>
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="field-error">
          {t(error)}
        </p>
      ) : hint ? (
        <p className="text-xs" style={{ color: "var(--color-white-dim)", marginTop: "6px" }}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function TextField({
  label,
  reg,
  error,
  hint,
  className,
  ...rest
}: {
  label: string;
  reg: UseFormRegisterReturn;
  error?: string;
  hint?: string;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "name" | "onChange" | "onBlur" | "ref">) {
  return (
    <Field label={label} error={error} hint={hint} className={className}>
      <input {...reg} {...rest} className="field-input" aria-invalid={!!error} />
    </Field>
  );
}

function TextareaField({
  label,
  reg,
  error,
  rows = 4,
  placeholder,
  count,
  min,
}: {
  label: string;
  reg: UseFormRegisterReturn;
  error?: string;
  rows?: number;
  placeholder?: string;
  count: number;
  min: number;
}) {
  const { t } = useI18n();
  return (
    <Field label={label} error={error} hint={t("launch.charCount", count, min)}>
      <textarea {...reg} rows={rows} placeholder={placeholder} className="field-input" aria-invalid={!!error} />
    </Field>
  );
}

// ── Step 1: Personal Info ─────────────────────────────────────────────────────
function Step1({ form }: { form: Form }) {
  const { t } = useI18n();
  const {
    register,
    formState: { errors },
  } = form;
  const e = errors.personal;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label={`${t("f.fullName")} *`} reg={register("personal.fullName")} error={e?.fullName?.message} placeholder="Ahmet Yıldız" autoComplete="name" />
        <TextField label={`${t("f.email")} *`} reg={register("personal.email")} error={e?.email?.message} placeholder="ahmet@uni.edu.tr" type="email" autoComplete="email" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label={`${t("f.phone")} *`} reg={register("personal.phone")} error={e?.phone?.message} placeholder="+90 5XX XXX XX XX" type="tel" autoComplete="tel" />
        <TextField label={`${t("f.university")} *`} reg={register("personal.university")} error={e?.university?.message} placeholder={t("ph.university")} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label={`${t("f.department")} *`} reg={register("personal.department")} error={e?.department?.message} placeholder={t("ph.department")} />
        <TextField label={t("f.year")} reg={register("personal.year")} error={e?.year?.message} placeholder={t("ph.year")} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label={t("f.linkedin")} reg={register("personal.linkedin")} error={e?.linkedin?.message} placeholder="https://linkedin.com/in/..." inputMode="url" />
        <TextField label={t("f.wallet")} reg={register("personal.walletAddress")} error={e?.walletAddress?.message} placeholder={t("ph.wallet")} spellCheck={false} />
      </div>
    </div>
  );
}

// ── Step 2: Team ──────────────────────────────────────────────────────────────
function Step2({ form }: { form: Form }) {
  const { t } = useI18n();
  const {
    register,
    control,
    formState: { errors },
  } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "team.members" });
  const leader = useWatch({ control, name: "personal" });

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl" style={{ background: "var(--color-yellow-glow)", border: "1px solid rgba(245,197,24,0.2)" }}>
        <p className="text-xs" style={{ color: "var(--color-yellow)" }}>
          {t("team.info")}
        </p>
      </div>

      <div className="p-4 rounded-2xl" style={{ background: "var(--color-black-muted)", border: "1px solid var(--color-black-border)" }}>
        <p className="text-sm font-semibold" style={{ color: "var(--color-white)" }}>
          {leader?.fullName?.trim() || t("team.leader")}
          <span className="text-xs font-normal" style={{ color: "var(--color-white-dim)" }}> · {t("team.leader")}</span>
        </p>
        <p className="text-xs" style={{ color: "var(--color-white-dim)", marginTop: "2px" }}>{leader?.email}</p>
      </div>

      {fields.map((field, i) => {
        const e = errors.team?.members?.[i];
        return (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl"
            style={{ background: "var(--color-black-muted)", border: "1px solid var(--color-black-border)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold" style={{ color: "var(--color-white)" }}>{t("team.member", i + 1)}</p>
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label={t("team.remove", i + 1)}
                className="p-1.5 rounded-lg"
                style={{ color: "#f87171", background: "rgba(239,68,68,0.1)" }}
              >
                <Trash2 size={14} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <TextField label={`${t("f.fullName")} *`} reg={register(`team.members.${i}.name`)} error={e?.name?.message} placeholder={t("f.fullName")} />
              <TextField label={`${t("f.role")} *`} reg={register(`team.members.${i}.role`)} error={e?.role?.message} placeholder={t("ph.role")} />
              <TextField label={`${t("f.email")} *`} reg={register(`team.members.${i}.email`)} error={e?.email?.message} placeholder="email@uni.edu.tr" type="email" />
              <TextField label={t("f.university")} reg={register(`team.members.${i}.university`)} error={e?.university?.message} placeholder={t("ph.universityShort")} />
            </div>
          </motion.div>
        );
      })}

      {errors.team?.members?.message && <p role="alert" className="field-error">{t(errors.team.members.message)}</p>}

      {fields.length < 5 && (
        <button
          type="button"
          onClick={() => append({ name: "", role: "", email: "", university: "" }, { shouldFocus: true })}
          className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
          style={{ background: "var(--color-black-card)", border: "1px dashed var(--color-black-muted)", color: "var(--color-white-muted)" }}
        >
          <Plus size={16} />
          {t("team.add")}
        </button>
      )}
    </div>
  );
}

// ── Step 3: Project Info ──────────────────────────────────────────────────────
function Step3({ form, groupError }: { form: Form; groupError?: string }) {
  const { t, locale } = useI18n();
  const {
    register,
    control,
    formState: { errors },
  } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "project.milestones" });
  const project = useWatch({ control, name: "project" });
  const e = errors.project;
  const totals = milestoneTotals(project);
  const min = tomorrowISO();

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label={`${t("f.projectName")} *`} reg={register("project.projectName")} error={e?.projectName?.message} placeholder="AgroChain AI Platform" />
        <Field label={`${t("f.category")} *`} error={e?.category?.message}>
          <select {...register("project.category")} className="field-input" style={{ appearance: "none", cursor: "pointer" }} aria-invalid={!!e?.category}>
            <option value="">{t("f.select")}</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>
      </div>

      <TextField label={`${t("f.taglineLabel")} *`} reg={register("project.tagline")} error={e?.tagline?.message} placeholder={t("ph.tagline")} />

      <TextareaField
        label={`${t("f.description")} *`}
        reg={register("project.description")}
        error={e?.description?.message}
        placeholder={t("ph.description")}
        count={project?.description?.trim().length ?? 0}
        min={100}
      />
      <TextareaField
        label={`${t("f.howItWorks")} *`}
        reg={register("project.howItWorks")}
        error={e?.howItWorks?.message}
        placeholder={t("ph.how")}
        rows={3}
        count={project?.howItWorks?.trim().length ?? 0}
        min={100}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label={`${t("f.goal")} *`} reg={register("project.goalAmount")} error={e?.goalAmount?.message} placeholder="50000" type="number" min="0" step="any" inputMode="decimal" />
        <TextField label={t("f.pitchLabel")} reg={register("project.pitchDeckUrl")} error={e?.pitchDeckUrl?.message} placeholder="https://pitch.com/..." inputMode="url" />
      </div>

      {/* Milestones */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium" style={{ color: "var(--color-white-muted)" }}>{t("f.milestones")} *</span>
          <span className="text-xs" style={{ color: "var(--color-white-dim)" }}>{fields.length}/5</span>
        </div>

        <div className="space-y-3">
          {fields.map((field, i) => {
            const me = e?.milestones?.[i];
            return (
              <motion.div
                key={field.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl"
                style={{ background: "var(--color-black-muted)", border: "1px solid var(--color-black-border)" }}
              >
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm font-semibold" style={{ color: "var(--color-yellow)" }}>{t("f.stage", i + 1)}</p>
                  {fields.length > 1 && (
                    <button type="button" onClick={() => remove(i)} aria-label={t("launch.removeStage", i + 1)} style={{ color: "#f87171" }}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <TextField label={`${t("f.stageTitle")} *`} reg={register(`project.milestones.${i}.title`)} error={me?.title?.message} placeholder={t("ph.stageTitle")} />
                  <TextField label={`${t("f.amountLabel")} *`} reg={register(`project.milestones.${i}.amount`)} error={me?.amount?.message} placeholder="15000" type="number" min="0" step="any" inputMode="decimal" />
                  <TextField className="sm:col-span-2" label={`${t("f.stageDesc")} *`} reg={register(`project.milestones.${i}.description`)} error={me?.description?.message} placeholder={t("ph.stageDesc")} />
                  <TextField label={`${t("f.date")} *`} reg={register(`project.milestones.${i}.date`)} error={me?.date?.message} type="date" min={min} />
                </div>
              </motion.div>
            );
          })}
        </div>

        {fields.length < 5 && (
          <button
            type="button"
            onClick={() => append({ title: "", amount: "", description: "", date: "" })}
            className="w-full mt-3 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
            style={{ background: "var(--color-black-card)", border: "1px dashed var(--color-black-muted)", color: "var(--color-white-muted)" }}
          >
            <Plus size={15} />
            {t("launch.addStage")}
          </button>
        )}

        {/* Live budget check */}
        <div
          className="mt-3 p-3 rounded-xl flex items-center justify-between text-xs"
          style={{
            background: "var(--color-black-muted)",
            border: `1px solid ${totals.matches ? "var(--color-success)" : "var(--color-black-border)"}`,
          }}
        >
          <span style={{ color: "var(--color-white-muted)" }}>{t("launch.totals")}</span>
          <span className="font-semibold" style={{ color: totals.matches ? "var(--color-success)" : "var(--color-white)" }}>
            {formatUnits(totals.sum, locale)} / {totals.goal !== null ? formatUnits(totals.goal, locale) : "—"} USDC
            {totals.matches && " ✓"}
          </span>
        </div>
        {groupError && <p role="alert" className="field-error">{t(groupError)}</p>}
      </div>
    </div>
  );
}

// ── Main Form Component ───────────────────────────────────────────────────────
export default function LaunchPage() {
  const { t } = useI18n();
  const { user, ready, openAuth } = useAuth();
  const [step, setStep] = useState(1);
  const [submittedName, setSubmittedName] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const form = useForm<LaunchFormValues>({
    resolver: zodResolver(launchSchema),
    defaultValues: DEFAULT_VALUES,
    mode: "onTouched",
  });
  const { control, trigger, handleSubmit } = form;

  // Live validity of the *current step*, straight from its Zod schema.
  const values = useWatch({ control }) as LaunchFormValues;
  const stepKey = STEP_KEYS[step - 1];
  const stepResult = useMemo(
    () => STEP_SCHEMAS[step - 1].safeParse(values?.[stepKey]),
    [values, step, stepKey],
  );
  const stepValid = stepResult.success;
  const invalidCount = stepResult.success
    ? 0
    : new Set(stepResult.error.issues.map((i) => i.path.join("."))).size;

  // Array-level issue (milestone sum mismatch / min-max) lives at path ["milestones"] in step 3.
  const groupError =
    step === 3 && !stepResult.success
      ? stepResult.error.issues.find((i) => i.path.length === 1 && i.path[0] === "milestones")?.message
      : undefined;

  const goNext = async () => {
    if (!stepValid) {
      await trigger(stepKey); // surface every error for this step
      return;
    }
    setStep((s) => Math.min(3, s + 1));
  };

  const onValid = (data: LaunchFormValues) => {
    // Defence in depth: the resolver already validated, but never trust a single gate.
    const all = launchSchema.safeParse(data);
    if (!all.success) return;
    if (!user) {
      openAuth("login"); // signed out in the meantime (for example in another tab)
      return;
    }
    setSavedId(saveApplication(all.data, user.id)?.id ?? null);
    setSubmittedName(all.data.project.projectName);
  };

  const onInvalid = () => {
    // Jump to the first step that still has problems.
    const firstBad = STEP_SCHEMAS.findIndex((schema, i) => !schema.safeParse(form.getValues()[STEP_KEYS[i]]).success);
    if (firstBad >= 0) setStep(firstBad + 1);
  };

  if (submittedName !== null) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--color-black)" }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "var(--color-yellow-glow)", border: "2px solid var(--color-yellow)" }}>
            <CheckCircle2 size={36} style={{ color: "var(--color-yellow)" }} />
          </div>
          <h1 className="text-3xl font-bold mb-3" style={{ fontFamily: "var(--font-display)", color: "var(--color-white)" }}>
            {t("launch.ok.title")}
          </h1>
          <p className="text-base mb-2" style={{ color: "var(--color-white-muted)" }}>
            {t("launch.ok.body", submittedName)}
          </p>
          <p className="text-xs font-mono mb-3" style={{ color: savedId ? "var(--color-yellow)" : "#f87171" }}>
            {savedId ? t("launch.ok.no", savedId) : t("launch.ok.notSaved")}
          </p>
          <p className="text-sm mb-8" style={{ color: "var(--color-white-dim)" }}>
            {t("launch.ok.eta")}
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold" style={{ background: "var(--color-yellow)", color: "var(--color-black)" }}>
              <ArrowLeft size={15} />
              {t("launch.ok.home")}
            </Link>
            <Link href="/applications" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold" style={{ color: "var(--color-yellow)", border: "1px solid rgba(245,197,24,0.4)" }}>
              {t("nav.history")}
              <ArrowRight size={15} />
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Not signed in: show the gate instead of the form. The form's state is kept, so nothing is lost.
  if (!ready) return <div style={{ background: "var(--color-black)", minHeight: "100vh" }} />;
  if (!user) {
    return (
      <div style={{ background: "var(--color-black)", minHeight: "100vh" }}>
        <AuthGate kind="apply" />
      </div>
    );
  }

  const primaryStyle = {
    background: stepValid ? "var(--color-yellow)" : "var(--color-black-muted)",
    color: stepValid ? "var(--color-black)" : "var(--color-white-dim)",
    cursor: stepValid ? "pointer" : "not-allowed",
    opacity: stepValid ? 1 : 0.6,
    boxShadow: stepValid && step === 3 ? "0 4px 20px var(--color-yellow-glow)" : "none",
  };

  return (
    <div style={{ background: "var(--color-black)", minHeight: "100vh" }}>
      <div className="px-6 py-10" style={{ maxWidth: "760px", margin: "0 auto" }}>
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm mb-5" style={{ color: "var(--color-white-muted)" }}>
            <ArrowLeft size={14} />
            {t("launch.back")}
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Logo size={44} />
            <div>
              <p className="text-xs font-medium" style={{ color: "var(--color-yellow)" }}>DeHatch</p>
              <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--color-white)" }}>
                {t("launch.title")}
              </h1>
            </div>
          </div>
          <p className="text-sm" style={{ color: "var(--color-white-muted)" }}>
            {t("launch.sub")}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-0 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                  style={{
                    background: step > s.id ? "var(--color-success)" : step === s.id ? "var(--color-yellow)" : "var(--color-black-muted)",
                    color: step >= s.id ? "var(--color-black)" : "var(--color-white-dim)",
                  }}
                >
                  {step > s.id ? <CheckCircle2 size={16} /> : s.icon}
                </div>
                <p
                  className="text-xs mt-1 text-center hidden sm:block"
                  style={{ color: step === s.id ? "var(--color-yellow)" : "var(--color-white-dim)", fontWeight: step === s.id ? 600 : 400 }}
                >
                  {t(s.titleKey)}
                </p>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 rounded-full transition-all" style={{ background: step > s.id ? "var(--color-yellow)" : "var(--color-black-muted)" }} />
              )}
            </div>
          ))}
        </div>

        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault(); // Enter key must obey the same gate as the buttons
            if (step < 3) void goNext();
            else if (stepValid) void handleSubmit(onValid, onInvalid)();
            else void trigger(stepKey);
          }}
        >
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            className="p-6 rounded-2xl mb-6"
            style={{ background: "var(--color-black-card)", border: "1px solid var(--color-black-border)" }}
          >
            <h2 className="text-lg font-bold mb-5" style={{ fontFamily: "var(--font-display)", color: "var(--color-white)" }}>
              {t(`launch.h${step}`)}
            </h2>

            <AnimatePresence mode="wait">
              <motion.div key={`s${step}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {step === 1 && <Step1 form={form} />}
                {step === 2 && <Step2 form={form} />}
                {step === 3 && <Step3 form={form} groupError={groupError} />}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {!stepValid && (
            <p className="text-xs text-center mb-4" style={{ color: "var(--color-white-dim)" }}>
              {t("launch.hint", invalidCount)}
            </p>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: step === 1 ? "var(--color-black-muted)" : "var(--color-black-card)",
                color: step === 1 ? "var(--color-white-dim)" : "var(--color-white)",
                border: "1px solid var(--color-black-border)",
                cursor: step === 1 ? "not-allowed" : "pointer",
                opacity: step === 1 ? 0.5 : 1,
              }}
            >
              <ArrowLeft size={15} />
              {t("launch.prev")}
            </button>

            <div className="flex items-center gap-2">
              {STEPS.map((s) => (
                <div
                  key={s.id}
                  className="w-2 h-2 rounded-full transition-all"
                  style={{ background: step === s.id ? "var(--color-yellow)" : "var(--color-black-muted)", transform: step === s.id ? "scale(1.3)" : "scale(1)" }}
                />
              ))}
            </div>

            {step < 3 ? (
              <button
                type="button"
                onClick={goNext}
                disabled={!stepValid}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all"
                style={primaryStyle}
              >
                {t("launch.next")}
                <ArrowRight size={15} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!stepValid}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all"
                style={primaryStyle}
              >
                <CheckCircle2 size={15} />
                {t("launch.submit")}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
