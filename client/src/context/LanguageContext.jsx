import { createContext, useContext, useEffect, useState } from "react";
import { translations, getNestedValue } from "../i18n/translations";

const LanguageContext = createContext();

const STORAGE_KEY = "velora-lang";

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || "en";
    } catch {
      return "en";
    }
  });

  const isRTL = lang === "ar";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  }, [lang, isRTL]);

  const toggle = () => {
    setLang((prev) => (prev === "en" ? "ar" : "en"));
  };

  const t = (path) => {
    const value =
      getNestedValue(translations[lang], path) ??
      getNestedValue(translations.en, path) ??
      path;
    return value;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggle, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return ctx;
}
