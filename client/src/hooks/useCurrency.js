import { useCallback, useEffect, useState } from "react";

// ======================================================
// CURRENCY
// Single source of truth for money display. Reads the
// currency saved in Settings (localStorage "velora-settings",
// kept fresh via "velora-settings-changed" events) so every
// formatMoney across the app follows the user preference.
// ======================================================

export const SUPPORTED_CURRENCIES = ["EGP", "USD", "EUR"];

const FALLBACK = "EGP";

function readCurrency() {
  try {
    const raw = localStorage.getItem("velora-settings");
    if (raw) {
      const saved = JSON.parse(raw)?.currency;
      if (SUPPORTED_CURRENCIES.includes(saved)) {
        return saved;
      }
    }
  } catch {
    // storage unavailable or corrupt — use fallback
  }
  return FALLBACK;
}

export function useCurrency() {
  const [currency, setCurrency] = useState(readCurrency);

  useEffect(() => {
    const sync = () => setCurrency(readCurrency());
    window.addEventListener("velora-settings-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("velora-settings-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const formatMoney = useCallback(
    (value, options = {}) => {
      const rtl =
        typeof document !== "undefined" &&
        document.documentElement.dir === "rtl";
      return new Intl.NumberFormat(rtl ? "ar-EG" : "en-EG", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
        ...options,
      }).format(Number(value) || 0);
    },
    [currency]
  );

  return { currency, formatMoney };
}

export default useCurrency;
