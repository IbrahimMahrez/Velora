import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import {
  ArrowLeft,
  Users,
  Copy,
  Check,
  Crown,
  UserMinus,
  LogOut,
  Trash2,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useCurrency } from "../../hooks/useCurrency";
import { useAuth } from "../../context/AuthContext";
import LanguageToggle from "../../components/LanguageToggle/LanguageToggle";
import "./Family.css";

export default function Family() {
  const { t, lang } = useLanguage();
  const { currency } = useCurrency();
  const { user } = useAuth();
  const locale = lang === "ar" ? "ar-EG" : "en-EG";

  const [family, setFamily] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [createName, setCreateName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [budgetInput, setBudgetInput] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [copied, setCopied] = useState(false);

  const fetchFamily = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/family");
      setFamily(res.data?.family || null);
    } catch (err) {
      setError(err.response?.data?.message || t("family.loadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamily();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatMoney = (value) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);

  const myId = user?._id || user?.id || null;
  const ownerId = family?.owner?._id || family?.owner || null;
  const isOwner = myId && ownerId ? String(myId) === String(ownerId) : false;

  const statsByUser = {};
  (family?.stats || []).forEach((s) => {
    if (s?.userId) statsByUser[String(s.userId)] = s;
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!createName.trim()) return;
    try {
      setActionLoading(true);
      setActionError("");
      const res = await api.post("/family", { name: createName.trim() });
      setFamily(res.data?.family || null);
      setCreateName("");
      if (!res.data?.family) fetchFamily();
    } catch (err) {
      setActionError(err.response?.data?.message || t("family.loadError"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    try {
      setActionLoading(true);
      setActionError("");
      const res = await api.post("/family/join", { code: joinCode.trim() });
      setFamily(res.data?.family || null);
      setJoinCode("");
      if (!res.data?.family) fetchFamily();
    } catch (err) {
      setActionError(err.response?.data?.message || t("family.loadError"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!window.confirm(t("family.leave"))) return;
    try {
      setActionLoading(true);
      await api.post("/family/leave");
      setFamily(null);
    } catch (err) {
      setActionError(err.response?.data?.message || t("family.loadError"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetBudget = async (e) => {
    e.preventDefault();
    const amount = Number(budgetInput);
    if (!Number.isFinite(amount) || amount < 0) return;
    try {
      setActionLoading(true);
      setActionError("");
      await api.put("/family/budget", { monthlyLimit: amount });
      setBudgetInput("");
      await fetchFamily();
    } catch (err) {
      setActionError(err.response?.data?.message || t("family.loadError"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemove = async (userId) => {
    if (!userId) return;
    try {
      setActionLoading(true);
      const res = await api.post("/family/remove", { userId });
      if (res.data?.family) setFamily(res.data.family);
      else fetchFamily();
    } catch (err) {
      setActionError(err.response?.data?.message || t("family.loadError"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopy = async () => {
    const code = family?.inviteCode || "";
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const familyBudget = family?.budget || null;
  const budgetPercent = familyBudget?.amount
    ? Math.min(
        100,
        Math.round(
          (Number(familyBudget.spent || 0) / familyBudget.amount) * 100
        )
      )
    : 0;

  return (
    <main className="family-page">
      <div className="family-topbar">
        <Link to="/dashboard" className="back-dashboard-btn">
          <ArrowLeft size={18} />
          <span>{t("family.back")}</span>
        </Link>
        <LanguageToggle variant="dashboard" />
      </div>

      <header className="family-header">
        <div>
          <p className="family-eyebrow">{t("family.eyebrow")}</p>
          <h1>{t("family.title")}</h1>
          <p className="family-subtitle">{t("family.subtitle")}</p>
        </div>
      </header>

      {loading ? (
        <div className="family-state">
          <div className="family-loader" />
          <span>{t("family.loading")}</span>
        </div>
      ) : error ? (
        <div className="family-state">
          <p className="family-error-text">{error}</p>
          <button type="button" className="family-primary-btn" onClick={fetchFamily}>
            {t("family.tryAgain")}
          </button>
        </div>
      ) : !family ? (
        <section className="family-split">
          <form className="family-card" onSubmit={handleCreate}>
            <h2>{t("family.createTitle")}</h2>
            <label>
              <span>{t("family.createNameLabel")}</span>
              <input
                type="text"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder={t("family.createNamePlaceholder")}
              />
            </label>
            <button type="submit" className="family-primary-btn" disabled={actionLoading}>
              {t("family.createButton")}
            </button>
          </form>
          <form className="family-card" onSubmit={handleJoin}>
            <h2>{t("family.joinTitle")}</h2>
            <label>
              <span>{t("family.joinCodeLabel")}</span>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder={t("family.joinCodePlaceholder")}
              />
            </label>
            <button type="submit" className="family-primary-btn" disabled={actionLoading}>
              {t("family.joinButton")}
            </button>
          </form>
          {actionError && <p className="family-error-text">{actionError}</p>}
        </section>
      ) : (
        <section className="family-dashboard">
          <div className="family-card family-identity">
            <div>
              <h2>{family.name}</h2>
              <p className="family-code-label">{t("family.inviteCode")}</p>
            </div>
            <div className="family-code-box">
              <code>{family.inviteCode}</code>
              <button type="button" onClick={handleCopy} title={t("family.copy")}>
                {copied ? <Check size={15} /> : <Copy size={15} />}
                <span>{copied ? t("family.copied") : t("family.copy")}</span>
              </button>
            </div>
          </div>

          <div className="family-card family-budget-card">
            <h3>{t("family.budgetTitle")}</h3>

            {familyBudget?.amount > 0 ? (
              <>
                <div className="family-budget-numbers">
                  <strong>
                    {formatMoney(familyBudget.spent || 0)}
                  </strong>
                  <span>
                    / {formatMoney(familyBudget.amount)} (
                    {familyBudget.percent ?? budgetPercent}%)
                  </span>
                </div>

                <div className="family-budget-bar">
                  <div
                    className="family-budget-fill"
                    style={{
                      width: `${Math.min(
                        100,
                        familyBudget.percent ?? budgetPercent
                      )}%`,
                    }}
                  />
                </div>
              </>
            ) : (
              <p className="family-budget-empty">
                {t("family.noBudget")}
              </p>
            )}

            {isOwner && (
              <form
                className="family-budget-form"
                onSubmit={handleSetBudget}
              >
                <input
                  type="number"
                  min={0}
                  value={budgetInput}
                  onChange={(e) =>
                    setBudgetInput(e.target.value)
                  }
                  placeholder={t("family.budgetPlaceholder")}
                />
                <button
                  type="submit"
                  className="family-primary-btn"
                  disabled={actionLoading}
                >
                  {t("family.setBudget")}
                </button>
              </form>
            )}
          </div>

          <div className="family-card">
            <h3>
              <Users size={16} /> {t("family.members")} ({family.members?.length || 0})
            </h3>
            <div className="family-members">
              {(family.members || []).map((m) => {
                const id = String(m._id || m.id || "");
                const stat = statsByUser[id];
                const isMemberOwner = ownerId && String(ownerId) === id;
                return (
                  <div key={id || m.email} className="family-member">
                    <div className="family-member-info">
                      <span className="family-avatar">
                        {(m.name || m.email || "?").charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <strong>
                          {m.name || m.email}
                          {isMemberOwner && (
                            <span className="family-owner-badge">
                              <Crown size={12} /> {t("family.owner")}
                            </span>
                          )}
                        </strong>
                        <small>
                          {t("family.monthTotal")}:{" "}
                          {formatMoney(stat?.monthTotal || 0)}
                        </small>
                      </div>
                    </div>
                    {isOwner && !isMemberOwner && (
                      <button
                        type="button"
                        className="family-remove-btn"
                        onClick={() => handleRemove(id)}
                        disabled={actionLoading}
                      >
                        <UserMinus size={14} />
                        {t("family.remove")}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {actionError && <p className="family-error-text">{actionError}</p>}

          <div className="family-danger-row">
            {!isOwner ? (
              <button
                type="button"
                className="family-danger-btn"
                onClick={handleLeave}
                disabled={actionLoading}
              >
                <LogOut size={15} />
                {t("family.leave")}
              </button>
            ) : (
              <button
                type="button"
                className="family-danger-btn"
                onClick={handleLeave}
                disabled={actionLoading}
              >
                <Trash2 size={15} />
                {t("family.disband")}
              </button>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
