"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { en, tr, type DictKey } from "./dict";

export type Lang = "en" | "tr";

const STORAGE_KEY = "dehatch_lang";
const dictionaries: Record<Lang, Record<string, string>> = { en, tr };

/**
 * Translate a key. Two conventions keep it usable from non-React code (schemas, errors):
 *   "key|a|b"  -> parameters {0}=a, {1}=b
 *   "@key"     -> a parameter that is itself a key, translated first
 * Unknown keys (for example raw error text) are returned unchanged.
 */
export function translate(lang: Lang, input: string, params: (string | number)[] = []): string {
  const [key, ...inline] = input.split("|");
  const template = dictionaries[lang][key];
  if (template === undefined) return input;
  const all = [...params, ...inline].map((p) =>
    typeof p === "string" && p.startsWith("@") ? translate(lang, p.slice(1)) : String(p),
  );
  return template.replace(/\{(\d+)\}/g, (_, i) => all[Number(i)] ?? "");
}

interface I18nValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: DictKey | (string & {}), ...params: (string | number)[]) => string;
  /** BCP-47 locale for number and date formatting */
  locale: string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Server and first client render both use "en" so hydration always matches;
  // the saved (or browser) language is applied right after mount.
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    let next: Lang = navigator.language?.toLowerCase().startsWith("tr") ? "tr" : "en";
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "tr") next = saved;
    } catch {
      // storage unavailable — use the browser language
    }
    setLangState(next);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      setLang,
      locale: lang === "tr" ? "tr-TR" : "en-US",
      t: (key, ...params) => translate(lang, key, params),
    }),
    [lang, setLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <LanguageProvider>");
  return ctx;
}
