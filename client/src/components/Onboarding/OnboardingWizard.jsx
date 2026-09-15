import { useState } from "react";
import { X } from "lucide-react";
import api from "../../services/api";
import { useLanguage } from "../../context/LanguageContext";
import "./OnboardingWizard.css";

const CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Entertainment",
  "Health",
  "Education",
  "Other",
];

const CURRENCIES = ["EGP", "USD", "EUR"];

function OnboardingWizard({ onDone }) {
  const { t } = useLanguage();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Step 2 state
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState(CATEGORIES[0]);

  // Step 3 state
  const [budgetCategory, setBudgetCategory] = useState(CATEGORIES[0]);
  const [budgetLimit, setBudgetLimit] = useState("");

  const finish = () => {
    try {
      localStorage.setItem("velora-onboarded", "done");
    } catch {
      // storage unavailable — still close
    }
    if (typeof onDone === "function") onDone();
  };

  const handleCurrencySelect = (code) => {
    try {
      let settings = {};
      try {
        const raw = localStorage.getItem("velora-settings");
        settings = raw ? JSON.parse(raw) : {};
        if (!settings || typeof settings !== "object") settings = {};
      } catch {
        settings = {};
      }
      settings.currency = code;
      localStorage.setItem("velora-settings", JSON.stringify(settings));
      window.dispatchEvent(new Event("velora-settings-changed"));
    } catch {
      // settings write failed — still advance so wizard never blocks
    }
    setError("");
    setStep(2);
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!expenseTitle.trim() || !expenseAmount) {
      setError(t("onboarding.errorGeneric"));
      return;
    }
    setSaving(true);
    try {
      await api.post("/expenses", {
        title: expenseTitle.trim(),
        amount: Number(expenseAmount),
        category: expenseCategory,
        date: new Date().toISOString(),
      });
      setStep(3);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error?.message ||
          t("onboarding.errorGeneric")
      );
    } finally {
      setSaving(false);
    }
  };

  const handleBudgetSave = async () => {
    setError("");
    if (!budgetLimit) {
      setError(t("onboarding.errorGeneric"));
      return;
    }
    setSaving(true);
    try {
      await api.post("/budgets", {
        category: budgetCategory,
        monthlyLimit: Number(budgetLimit),
      });
      finish();
    } catch (err) {
      const status = err.response?.status;
      setError(
        err.response?.data?.message ||
          err.response?.data?.error?.message ||
          t("onboarding.errorGeneric")
      );
      // Duplicate-category 400 → show message, allow skip (stay on step).
      if (status !== 400) return;
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="onboarding-overlay"
      role="dialog"
      aria-modal="false"
      onMouseDown={(e) => {
        // Clicking the backdrop (not the card) also finishes — never blocks dashboard.
        if (e.target === e.currentTarget) finish();
      }}
    >
      <div className="onboarding-card">
        <div className="onboarding-top">
          <span className="onboarding-eyebrow">
            {t("onboarding.eyebrow")}
          </span>
          <button
            type="button"
            className="onboarding-close"
            onClick={finish}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="onboarding-dots" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={`onboarding-dot${i === step ? " active" : ""}${
                i < step ? " done" : ""
              }`}
            />
          ))}
        </div>

        {step === 0 && (
          <div className="onboarding-step">
            <h2>{t("onboarding.welcomeTitle")}</h2>
            <p>{t("onboarding.welcomeDesc")}</p>
            <button
              type="button"
              className="onboarding-primary"
              onClick={() => setStep(1)}
            >
              {t("onboarding.start")}
            </button>
            <button
              type="button"
              className="onboarding-link"
              onClick={finish}
            >
              {t("onboarding.skip")}
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="onboarding-step">
            <h2>{t("onboarding.currencyTitle")}</h2>
            <p>{t("onboarding.currencyDesc")}</p>
            <div className="onboarding-currencies">
              {CURRENCIES.map((code) => (
                <button
                  key={code}
                  type="button"
                  className="onboarding-currency-btn"
                  onClick={() => handleCurrencySelect(code)}
                >
                  {code}
                </button>
              ))}
            </div>
            <div className="onboarding-row">
              <button
                type="button"
                className="onboarding-link"
                onClick={() => setStep(0)}
              >
                {t("onboarding.back")}
              </button>
              <button
                type="button"
                className="onboarding-link"
                onClick={finish}
              >
                {t("onboarding.skip")}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <form className="onboarding-step" onSubmit={handleExpenseSubmit}>
            <h2>{t("onboarding.expenseTitle")}</h2>
            <p>{t("onboarding.expenseDesc")}</p>
            <input
              type="text"
              className="onboarding-input"
              placeholder={t("onboarding.expenseTitlePh")}
              value={expenseTitle}
              onChange={(e) => setExpenseTitle(e.target.value)}
            />
            <input
              type="number"
              min="1"
              className="onboarding-input"
              placeholder={t("onboarding.expenseAmountPh")}
              value={expenseAmount}
              onChange={(e) => setExpenseAmount(e.target.value)}
            />
            <label className="onboarding-label">
              {t("onboarding.expenseCategory")}
              <select
                className="onboarding-input"
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            {error && <p className="onboarding-error">{error}</p>}
            <button
              type="submit"
              className="onboarding-primary"
              disabled={saving}
            >
              {saving ? t("onboarding.saving") : t("onboarding.continue")}
            </button>
            <div className="onboarding-row">
              <button
                type="button"
                className="onboarding-link"
                onClick={() => {
                  setError("");
                  setStep(1);
                }}
              >
                {t("onboarding.back")}
              </button>
              <button
                type="button"
                className="onboarding-link"
                onClick={finish}
              >
                {t("onboarding.skip")}
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="onboarding-step">
            <h2>{t("onboarding.budgetTitle")}</h2>
            <p>{t("onboarding.budgetDesc")}</p>
            <label className="onboarding-label">
              {t("onboarding.expenseCategory")}
              <select
                className="onboarding-input"
                value={budgetCategory}
                onChange={(e) => setBudgetCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <input
              type="number"
              min="1"
              className="onboarding-input"
              placeholder={t("onboarding.budgetLimitPh")}
              value={budgetLimit}
              onChange={(e) => setBudgetLimit(e.target.value)}
            />
            {error && <p className="onboarding-error">{error}</p>}
            <div className="onboarding-actions">
              <button
                type="button"
                className="onboarding-primary"
                onClick={handleBudgetSave}
                disabled={saving}
              >
                {saving ? t("onboarding.saving") : t("onboarding.saveBudget")}
              </button>
              <button
                type="button"
                className="onboarding-secondary"
                onClick={finish}
              >
                {t("onboarding.skip")}
              </button>
            </div>
            <div className="onboarding-row">
              <button
                type="button"
                className="onboarding-link"
                onClick={() => {
                  setError("");
                  setStep(2);
                }}
              >
                {t("onboarding.back")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OnboardingWizard;
