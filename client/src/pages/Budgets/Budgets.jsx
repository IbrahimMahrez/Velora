import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  PiggyBank,
  Utensils,
  Car,
  ShoppingBag,
  Gamepad2,
  HeartPulse,
  GraduationCap,
  CircleHelp,
  X,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useCurrency } from "../../hooks/useCurrency";
import LanguageToggle from "../../components/LanguageToggle/LanguageToggle";
import "./Budgets.css";

const CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Entertainment",
  "Health",
  "Education",
  "Other",
];

const categoryIcons = {
  Food: Utensils,
  Transport: Car,
  Shopping: ShoppingBag,
  Entertainment: Gamepad2,
  Health: HeartPulse,
  Education: GraduationCap,
  Other: CircleHelp,
};

function barClass(percent) {
  if (percent >= 100) return "over";
  if (percent >= 80) return "warn";
  return "ok";
}

export default function Budgets() {
  const { t, lang } = useLanguage();
  const { currency } = useCurrency();
  const locale = lang === "ar" ? "ar-EG" : "en-EG";

  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [category, setCategory] = useState("Food");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/budgets");
      setBudgets(res.data?.budgets || []);
    } catch (err) {
      setError(
        err.response?.data?.message || t("budget.loadError")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totals = useMemo(() => {
    return budgets.reduce(
      (acc, b) => ({
        limit: acc.limit + Number(b.monthlyLimit || 0),
        spent: acc.spent + Number(b.spent || 0),
      }),
      { limit: 0, spent: 0 }
    );
  }, [budgets]);

  const formatMoney = (value) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);

  const openAdd = () => {
    setEditing(null);
    setCategory("Food");
    setAmount("");
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (budget) => {
    setEditing(budget);
    setCategory(budget.category || "Food");
    setAmount(String(budget.monthlyLimit ?? ""));
    setFormError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
    setEditing(null);
    setAmount("");
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const num = Number(amount);
    if (!amount || Number.isNaN(num)) {
      setFormError(t("budget.limitRequired"));
      return;
    }
    if (num < 1) {
      setFormError(t("budget.amountMin"));
      return;
    }
    try {
      setSaving(true);
      setFormError("");
      if (editing) {
        const res = await api.put(`/budgets/${editing._id}`, {
          monthlyLimit: num,
        });
        const updated = res.data?.budget;
        setBudgets((prev) =>
          prev.map((b) =>
            b._id === editing._id
              ? updated || { ...b, monthlyLimit: num }
              : b
          )
        );
      } else {
        const res = await api.post("/budgets", {
          category,
          monthlyLimit: num,
        });
        const created = res.data?.budget;
        if (created) setBudgets((prev) => [created, ...prev]);
        else fetchBudgets();
      }
      closeModal();
    } catch (err) {
      // Offline: queued for later sync (badge shows pending).
      if (err.isQueued) {
        closeModal();
        return;
      }
      setFormError(
        err.response?.data?.message || t("budget.loadError")
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (budget) => {
    if (!budget?._id) return;
    if (!window.confirm(t("budget.deleteConfirm"))) return;
    try {
      await api.delete(`/budgets/${budget._id}`);
      setBudgets((prev) => prev.filter((b) => b._id !== budget._id));
    } catch (err) {
      if (err.isQueued) return;
      setError(err.response?.data?.message || t("budget.loadError"));
    }
  };

  return (
    <main className="budgets-page">
      <div className="budgets-topbar">
        <Link to="/dashboard" className="back-dashboard-btn">
          <ArrowLeft size={18} />
          <span>{t("budget.back")}</span>
        </Link>
        <LanguageToggle variant="dashboard" />
      </div>

      <header className="budgets-header">
        <div>
          <p className="budgets-eyebrow">{t("budget.eyebrow")}</p>
          <h1>{t("budget.title")}</h1>
          <p className="budgets-subtitle">{t("budget.subtitle")}</p>
        </div>
        <button type="button" className="budgets-add-btn" onClick={openAdd}>
          <Plus size={17} />
          <span>{t("budget.addBudget")}</span>
        </button>
      </header>

      {!loading && !error && budgets.length > 0 && (
        <section className="budgets-totals">
          <div className="budgets-total-card">
            <span>{t("budget.totalBudgeted")}</span>
            <strong>{formatMoney(totals.limit)}</strong>
          </div>
          <div className="budgets-total-card">
            <span>{t("budget.totalSpent")}</span>
            <strong>{formatMoney(totals.spent)}</strong>
          </div>
        </section>
      )}

      {loading ? (
        <div className="budgets-state">
          <div className="budgets-loader" />
          <span>{t("budget.loading")}</span>
        </div>
      ) : error ? (
        <div className="budgets-state">
          <p className="budgets-error-text">{error}</p>
          <button type="button" className="budgets-add-btn" onClick={fetchBudgets}>
            {t("budget.tryAgain")}
          </button>
        </div>
      ) : budgets.length === 0 ? (
        <div className="budgets-state">
          <PiggyBank size={34} />
          <h3>{t("budget.empty")}</h3>
          <p>{t("budget.emptyHint")}</p>
          <button type="button" className="budgets-add-btn" onClick={openAdd}>
            <Plus size={16} />
            {t("budget.addFirst")}
          </button>
        </div>
      ) : (
        <section className="budgets-grid">
          {budgets.map((b) => {
            const Icon = categoryIcons[b.category] || CircleHelp;
            const percent = Number(b.percent) || 0;
            return (
              <article key={b._id} className="budget-card">
                <div className="budget-card-top">
                  <div className="budget-cat">
                    <span className="budget-cat-icon">
                      <Icon size={18} />
                    </span>
                    <strong>{b.category}</strong>
                  </div>
                  <div className="budget-actions">
                    <button
                      type="button"
                      title={t("common.edit")}
                      onClick={() => openEdit(b)}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      title={t("common.delete")}
                      className="danger"
                      onClick={() => handleDelete(b)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <div className="budget-amounts">
                  <span>
                    {t("budget.spent")}: {formatMoney(b.spent)}
                  </span>
                  <strong>
                    {formatMoney(b.spent)} {t("budget.ofLimit")}{" "}
                    {formatMoney(b.monthlyLimit)}
                  </strong>
                </div>
                <div className="budget-bar">
                  <div
                    className={`budget-bar-fill ${barClass(percent)}`}
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>
                <small className="budget-percent">{Math.round(percent)}%</small>
              </article>
            );
          })}
        </section>
      )}

      {showModal && (
        <div
          className="budgets-modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="budgets-modal">
            <button
              type="button"
              className="budgets-modal-close"
              onClick={closeModal}
              aria-label="Close"
            >
              <X size={18} />
            </button>
            <h2>
              {editing ? t("budget.editBudget") : t("budget.addBudgetTitle")}
            </h2>
            <form onSubmit={handleSubmit}>
              {!editing && (
                <label className="budgets-field">
                  <span>{t("budget.categoryLabel")}</span>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <label className="budgets-field">
                <span>{t("budget.amountLabel")}</span>
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="1000"
                />
              </label>
              {formError && <p className="budgets-error-text">{formError}</p>}
              <div className="budgets-modal-actions">
                <button type="button" onClick={closeModal} disabled={saving}>
                  {t("common.cancel")}
                </button>
                <button type="submit" disabled={saving}>
                  {editing ? t("budget.saveChanges") : t("budget.create")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
