"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Eye, EyeOff, Loader2, X } from "lucide-react";
import { useAuth, type AuthMode } from "@/lib/auth";
import { loginSchema, registerSchema, type LoginValues, type RegisterValues } from "@/lib/authSchema";
import { useI18n } from "@/lib/i18n";

function AuthField({
  label,
  reg,
  error,
  type = "text",
  placeholder,
  autoComplete,
  autoFocus,
}: {
  label: string;
  reg: UseFormRegisterReturn;
  error?: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  autoFocus?: boolean;
}) {
  const { t } = useI18n();
  const [shown, setShown] = useState(false);
  const isPassword = type === "password";
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-white-muted)" }}>
        {label}
      </label>
      <div className="relative">
        <input
          {...reg}
          type={isPassword && shown ? "text" : type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          className="field-input"
          aria-invalid={!!error}
          style={isPassword ? { paddingRight: "44px" } : undefined}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShown((v) => !v)}
            aria-label={t(shown ? "auth.hidePassword" : "auth.showPassword")}
            className="absolute top-1/2 -translate-y-1/2 p-1.5 rounded-lg"
            style={{ right: "8px", color: "var(--color-white-dim)" }}
          >
            {shown ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="field-error">
          {t(error)}
        </p>
      )}
    </div>
  );
}

function SubmitButton({ disabled, busy, label }: { disabled: boolean; busy: boolean; label: string }) {
  const { t } = useI18n();
  return (
    <button
      type="submit"
      disabled={disabled}
      className="w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2"
      style={{
        background: disabled ? "var(--color-black-muted)" : "var(--color-yellow)",
        color: disabled ? "var(--color-white-dim)" : "var(--color-black)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.7 : 1,
      }}
    >
      {busy ? (
        <>
          <Loader2 size={16} className="animate-spin" /> {t("auth.working")}
        </>
      ) : (
        label
      )}
    </button>
  );
}

function ServerError({ message }: { message: string | null }) {
  const { t } = useI18n();
  if (!message) return null;
  return (
    <div role="alert" className="flex items-start gap-2 p-3 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>
      <AlertCircle size={16} className="mt-0.5 shrink-0" />
      <span className="break-words min-w-0">{t(message)}</span>
    </div>
  );
}

function LoginForm() {
  const { t } = useI18n();
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onChange",
  });

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={handleSubmit(async (v) => {
        setServerError(null);
        try {
          await login(v);
        } catch (e) {
          setServerError(e instanceof Error ? e.message : String(e));
        }
      })}
    >
      <AuthField label={t("f.email")} reg={register("email")} error={errors.email?.message} type="email" placeholder="ahmet@uni.edu.tr" autoComplete="email" autoFocus />
      <AuthField label={t("f.password")} reg={register("password")} error={errors.password?.message} type="password" autoComplete="current-password" />
      <ServerError message={serverError} />
      <SubmitButton disabled={!isValid || isSubmitting} busy={isSubmitting} label={t("auth.submit.login")} />
    </form>
  );
}

function RegisterForm() {
  const { t } = useI18n();
  const { register: registerAccount } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirm: "" },
    mode: "onChange",
  });

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={handleSubmit(async (v) => {
        setServerError(null);
        try {
          await registerAccount({ name: v.name, email: v.email, password: v.password });
        } catch (e) {
          setServerError(e instanceof Error ? e.message : String(e));
        }
      })}
    >
      <AuthField label={t("f.fullName")} reg={register("name")} error={errors.name?.message} placeholder="Ahmet Yıldız" autoComplete="name" autoFocus />
      <AuthField label={t("f.email")} reg={register("email")} error={errors.email?.message} type="email" placeholder="ahmet@uni.edu.tr" autoComplete="email" />
      <AuthField label={t("f.password")} reg={register("password")} error={errors.password?.message} type="password" autoComplete="new-password" />
      <AuthField label={t("f.passwordConfirm")} reg={register("confirm")} error={errors.confirm?.message} type="password" autoComplete="new-password" />
      <ServerError message={serverError} />
      <SubmitButton disabled={!isValid || isSubmitting} busy={isSubmitting} label={t("auth.submit.register")} />
    </form>
  );
}

/** The sign in / sign up window. Mounted once in the layout; opened through useAuth().openAuth(). */
export default function AuthModalHost() {
  const { t } = useI18n();
  const { modal, closeAuth, setModalMode } = useAuth();
  const { open, mode } = modal;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeAuth();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeAuth]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="auth"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(10px)" }}
          onClick={closeAuth}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={t(`auth.title.${mode}`)}
            initial={{ scale: 0.94, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 16 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl overflow-hidden max-h-[92vh] overflow-y-auto"
            style={{ background: "var(--color-black-card)", border: "1px solid var(--color-black-border)" }}
          >
            <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-serif-display" style={{ fontSize: "30px", fontWeight: 500, lineHeight: 1.1, color: "var(--color-white)" }}>
                  {t(`auth.title.${mode}`)}
                </h2>
                <p className="text-sm" style={{ color: "var(--color-white-muted)", marginTop: "6px" }}>
                  {t(`auth.sub.${mode}`)}
                </p>
              </div>
              <button onClick={closeAuth} className="p-2 rounded-lg shrink-0" style={{ background: "var(--color-black-muted)", color: "var(--color-white-muted)" }} aria-label={t("common.close")}>
                <X size={16} />
              </button>
            </div>

            <div className="px-6 pb-6 space-y-5">
              <div role="tablist" className="flex gap-2 p-1 rounded-xl" style={{ background: "var(--color-black-muted)", border: "1px solid var(--color-black-border)" }}>
                {(["login", "register"] as AuthMode[]).map((m) => (
                  <button
                    key={m}
                    role="tab"
                    aria-selected={mode === m}
                    type="button"
                    onClick={() => setModalMode(m)}
                    className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                    style={{
                      background: mode === m ? "var(--color-yellow)" : "transparent",
                      color: mode === m ? "var(--color-black)" : "var(--color-white-muted)",
                    }}
                  >
                    {t(`auth.tab.${m}`)}
                  </button>
                ))}
              </div>

              {/* key resets the form (and its errors) when switching tabs */}
              {mode === "login" ? <LoginForm key="login" /> : <RegisterForm key="register" />}

              <p className="text-xs text-center" style={{ color: "var(--color-white-dim)" }}>
                {t(mode === "login" ? "auth.switch.toRegister" : "auth.switch.toLogin")}{" "}
                <button
                  type="button"
                  onClick={() => setModalMode(mode === "login" ? "register" : "login")}
                  style={{ color: "var(--color-yellow)", textDecoration: "underline" }}
                >
                  {t(mode === "login" ? "auth.tab.register" : "auth.tab.login")}
                </button>
              </p>
              <p className="text-[11px] text-center" style={{ color: "var(--color-white-dim)" }}>{t("auth.notice")}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
