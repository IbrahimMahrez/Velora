
import { useEffect, useState } from "react";
import api from "../../services/api";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Plus,
  Target,
  TrendingUp,
  X,
} from "lucide-react";
import "./SavingGoalCard.css";
import { useLanguage } from "../../context/LanguageContext";
import { useCurrency } from "../../hooks/useCurrency";
import LanguageToggle from "../../components/LanguageToggle/LanguageToggle";

const API_URL = "/goal";

const SavingGoals = () => {
  const { t, lang } = useLanguage();
  const { currency } = useCurrency();
  const locale = lang === "ar" ? "ar-EG" : "en-EG";
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [contribValues, setContribValues] = useState({});
  const [contributingId, setContributingId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    targetAmount: "",
    currentAmount: "",
    deadline: "",
  });

  // =========================
  // Quick contribution: +amount with history record
  // =========================

  const handleContribute = async (goal) => {
    const raw = contribValues[goal._id];
    const amount = Number(raw);

    if (!goal?._id || !Number.isFinite(amount) || amount < 1) {
      return;
    }

    try {
      setContributingId(goal._id);

      const response = await api.patch(
        `${API_URL}/${goal._id}/contribute`,
        { amount }
      );

      const updated = response.data?.goal;

      if (updated) {
        setGoals((prev) =>
          prev.map((g) =>
            g._id === goal._id ? { ...g, ...updated } : g
          )
        );
      } else {
        await fetchGoals();
      }

      setContribValues((prev) => ({
        ...prev,
        [goal._id]: "",
      }));
    } catch (err) {
      console.error(
        "Contribute failed:",
        err.response?.data || err.message
      );
    } finally {
      setContributingId(null);
    }
  };

  // =========================
  // Fetch Goals
  // =========================

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("You are not logged in.");
      }

      const response = await api.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setGoals(
        Array.isArray(response.data?.savingGoals)
          ? response.data.savingGoals
          : []
      );
    } catch (err) {
      console.log("STATUS:", err.response?.status);
      console.log("DATA:", err.response?.data);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load saving goals."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  // =========================
  // Form
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      targetAmount: "",
      currentAmount: "",
      deadline: "",
    });

    setEditingGoal(null);
  };

  // =========================
  // Create / Update
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("You are not logged in.");
      }

      const data = {
        title: formData.title,
        targetAmount: Number(formData.targetAmount),
        currentAmount: Number(formData.currentAmount || 0),
        deadline: formData.deadline,
      };

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // UPDATE
      if (editingGoal) {
        const response = await api.put(
          `${API_URL}/${editingGoal._id}`,
          data,
          config
        );

        setGoals((prev) =>
          prev.map((goal) =>
            goal._id === editingGoal._id
              ? response.data.savingGoal
              : goal
          )
        );
      }

      // CREATE
      else {
        const response = await api.post(
          API_URL,
          data,
          config
        );

        setGoals((prev) => [
          response.data.savingGoal,
          ...prev,
        ]);
      }

      setShowModal(false);
      resetForm();
    } catch (err) {
      console.log(
        "SAVE GOAL ERROR:",
        err.response?.data
      );

      // Offline: queued for later sync.
      if (err.isQueued) {
        setShowModal(false);
        resetForm();
        alert(
          `${t("common.savedOffline")} — ${t("common.willSync")}`
        );
        return;
      }

      alert(
        err.response?.data?.message ||
          err.message ||
          "Something went wrong."
      );
    }
  };

  // =========================
  // Edit
  // =========================

  const handleEdit = (goal) => {
    setEditingGoal(goal);

    setFormData({
      title: goal.title || "",
      targetAmount: goal.targetAmount || "",
      currentAmount: goal.currentAmount || "",
      deadline: goal.deadline
        ? new Date(goal.deadline)
            .toISOString()
            .split("T")[0]
        : "",
    });

    setShowModal(true);
  };

  // =========================
  // Delete
  // =========================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this goal?"
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("You are not logged in.");
      }

      console.log("DELETE GOAL:", id);

      await api.delete(`${API_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setGoals((prev) =>
        prev.filter((goal) => goal._id !== id)
      );

      console.log("GOAL DELETED SUCCESSFULLY");
    } catch (err) {
      console.log(
        "DELETE GOAL ERROR:",
        err.response?.data
      );

      alert(
        err.response?.data?.message ||
          err.message ||
          "Unable to delete this goal."
      );
    }
  };

  // =========================
  // Helpers
  // =========================

  const getProgress = (current, target) => {
    if (!target) return 0;

    return Math.min(
      Math.round((current / target) * 100),
      100
    );
  };

  const formatMoney = (value) => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);
  };

  const formatDate = (date) => {
    if (!date) return t("goals.noDate");

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return t("goals.noDate");
    }

    return parsedDate.toLocaleDateString(locale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const totalSaved = goals.reduce(
    (total, goal) =>
      total + Number(goal.currentAmount || 0),
    0
  );

  const activeGoals = goals.filter(
    (goal) => goal.status === "active"
  ).length;

  const completedGoals = goals.filter(
    (goal) => goal.status === "completed"
  ).length;

  // =========================
  // Render
  // =========================

  return (
    <div className="saving-goals-page">

      {/* Background */}

      <div className="saving-bg saving-bg-one" />
      <div className="saving-bg saving-bg-two" />

      <div className="saving-goals-container">

        {/* Back To Dashboard */}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link
          to="/dashboard"
          className="back-dashboard"
        >
          <ArrowLeft size={16} />
          <span>{t("goals.back")}</span>
        </Link>
          <LanguageToggle variant="dashboard" />
        </div>

        {/* Header */}

        <header className="saving-header">

          <div className="saving-heading">

            <div className="saving-eyebrow">
              <Target size={15} />
              <span>{t("goals.eyebrow")}</span>
            </div>

            <h1>
              {t("goals.titleA")}
              <br />
              <span>{t("goals.titleB")}</span>
            </h1>

            <p>
              {t("goals.subtitle")}
            </p>

          </div>

          <button
            type="button"
            className="create-goal-btn"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            <Plus size={18} />
            <span>{t("goals.createGoal")}</span>
          </button>

        </header>

        {/* Statistics */}

        <section className="saving-stats">

          <div className="stat-card">
            <span className="stat-label">
              {t("goals.totalSaved")}
            </span>

            <strong>
              {formatMoney(totalSaved)}
            </strong>

            <span className="stat-description">
              {t("goals.acrossGoals")}
            </span>
          </div>

          <div className="stat-card">
            <span className="stat-label">
              {t("goals.activeGoals")}
            </span>

            <strong>
              {activeGoals}
            </strong>

            <span className="stat-description">
              {t("goals.inProgress")}
            </span>
          </div>

          <div className="stat-card">
            <span className="stat-label">
              {t("goals.completed")}
            </span>

            <strong>
              {completedGoals}
            </strong>

            <span className="stat-description">
              {t("goals.goalsReached")}
            </span>
          </div>

        </section>

        {/* Goals Header */}

        <div className="goals-section-header">

          <div>
            <h2>{t("goals.yourGoals")}</h2>

            <p>
              {t("goals.keepMoving")}
            </p>
          </div>

          <span className="goals-count">
            {goals.length} {t("goals.goalsCount")}
          </span>

        </div>

        {/* Loading */}

        {loading && (
          <div className="goals-loading">
            {t("goals.loading")}
          </div>
        )}

        {/* Error */}

        {!loading && error && (
          <div className="goals-error">
            {error}
          </div>
        )}

        {/* Empty */}

        {!loading &&
          !error &&
          goals.length === 0 && (
            <div className="goals-empty">

              <Target size={30} />

              <h3>
                {t("goals.noGoals")}
              </h3>

              <p>
                {t("goals.noGoalsHint")}
              </p>

              <button
                type="button"
                className="create-goal-btn"
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
              >
                <Plus size={18} />
                {t("goals.createGoal")}
              </button>

            </div>
          )}

        {/* Goals Grid */}

        {!loading &&
          !error &&
          goals.length > 0 && (
            <section className="goals-grid">

              {goals.map((goal) => {

                const progress = getProgress(
                  Number(goal.currentAmount),
                  Number(goal.targetAmount)
                );

                const remaining = Math.max(
                  Number(goal.targetAmount) -
                    Number(goal.currentAmount),
                  0
                );

                return (
                  <article
                    className="goal-card"
                    key={goal._id}
                  >

                    <div className="goal-glow" />

                    {/* Top */}

                    <div className="goal-top">

                      <div className="goal-icon">
                        <Target size={21} />
                      </div>

                      <div className="goal-actions">

                        <button
                          type="button"
                          className="goal-action edit"
                          onClick={() =>
                            handleEdit(goal)
                          }
                        >
                          {t("goals.edit")}
                        </button>

                        <button
                          type="button"
                          className="goal-action delete"
                          onClick={() =>
                            handleDelete(goal._id)
                          }
                        >
                          {t("goals.delete")}
                        </button>

                      </div>

                    </div>

                    {/* Title */}

                    <div className="goal-title-wrapper">

                      <span className="goal-type">
                        {t("goals.savingGoal")}
                      </span>

                      <h3>
                        {goal.title}
                      </h3>

                    </div>

                    {/* Amount */}

                    <div className="goal-amount">

                      <div>

                        <span className="amount-label">
                          {t("goals.saved")}
                        </span>

                        <div className="amount-value">

                          {formatMoney(
                            goal.currentAmount
                          )}

                          <small>
                            {" / "}
                            {formatMoney(
                              goal.targetAmount
                            )}
                          </small>

                        </div>

                      </div>

                      <div className="progress-number">
                        {progress}%
                      </div>

                    </div>

                    {/* Progress */}

                    <div className="progress-wrapper">

                      <div className="progress-track">

                        <motion.div
                          className="progress-bar"
                          initial={{ width: 0 }}
                          animate={{
                            width: `${progress}%`,
                          }}
                          transition={{
                            duration: 0.8,
                          }}
                        />

                      </div>

                    </div>

                    {/* Details */}

                    <div className="goal-details">

                      <div className="detail-box">

                        <div className="detail-icon">
                          <TrendingUp size={15} />
                        </div>

                        <div>
                          <span>
                            {t("goals.remaining")}
                          </span>

                          <strong>
                            {formatMoney(remaining)}
                          </strong>
                        </div>

                      </div>

                      <div className="detail-box">

                        <div className="detail-icon">
                          <CalendarDays size={15} />
                        </div>

                        <div>
                          <span>
                            {t("goals.deadline")}
                          </span>

                          <strong>
                            {formatDate(
                              goal.deadline
                            )}
                          </strong>
                        </div>

                      </div>

                    </div>

                    {/* Quick contribute */}

                    {goal.status === "active" && (
                      <div className="goal-contribute">
                        <input
                          type="number"
                          min={1}
                          placeholder={t("goals.contributePh")}
                          value={contribValues[goal._id] || ""}
                          onChange={(e) =>
                            setContribValues((prev) => ({
                              ...prev,
                              [goal._id]: e.target.value,
                            }))
                          }
                        />
                        <button
                          type="button"
                          disabled={contributingId === goal._id}
                          onClick={() => handleContribute(goal)}
                        >
                          <Plus size={15} />
                          {t("goals.contribute")}
                        </button>
                      </div>
                    )}

                    {/* Bottom */}

                    <div className="goal-bottom">

                      <div
                        className={`goal-status ${goal.status}`}
                      >

                        <span className="status-dot" />

                        {goal.status === "completed"
                          ? t("goals.completedLabel")
                          : t("goals.active")}

                      </div>

                      <button
                        type="button"
                        className="view-goal"
                      >
                        {t("goals.viewGoal")}
                        <ArrowUpRight size={16} />
                      </button>

                    </div>

                  </article>
                );
              })}

            </section>
          )}

      </div>

      {/* =========================
          CREATE / EDIT MODAL
      ========================= */}

      {showModal && (
        <div
          className="goal-modal-overlay"
          onClick={() => {
            setShowModal(false);
            resetForm();
          }}
        >

          <div
            className="goal-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="goal-modal-header">

              <div>

                <span>
                  {editingGoal
                    ? t("goals.updateGoal")
                    : t("goals.newGoal")}
                </span>

                <h2>
                  {editingGoal
                    ? t("goals.editGoal")
                    : t("goals.createGoalTitle")}
                </h2>

              </div>

              <button
                type="button"
                className="goal-modal-close"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
              >
                <X size={20} />
              </button>

            </div>

            <form
              className="goal-form"
              onSubmit={handleSubmit}
            >

              <div className="goal-input-group">

                <label>
                  {t("goals.goalTitle")}
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder={t("goals.goalPlaceholder")}
                  required
                  minLength={3}
                />

              </div>

              <div className="goal-input-row">

                <div className="goal-input-group">

                  <label>
                    {t("goals.targetAmount")}
                  </label>

                  <input
                    type="number"
                    name="targetAmount"
                    value={formData.targetAmount}
                    onChange={handleChange}
                    placeholder="30000"
                    min="0"
                    required
                  />

                </div>

                <div className="goal-input-group">

                  <label>
                    {t("goals.currentAmount")}
                  </label>

                  <input
                    type="number"
                    name="currentAmount"
                    value={formData.currentAmount}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                  />

                </div>

              </div>

              <div className="goal-input-group">

                <label>
                  {t("goals.deadlineLabel")}
                </label>

                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  required
                />

              </div>

              <button
                type="submit"
                className="goal-submit-btn"
              >
                {editingGoal
                  ? t("goals.updateGoalBtn")
                  : t("goals.createGoal")}

                <ArrowUpRight size={16} />
              </button>

            </form>

          </div>

        </div>
      )}

    </div>
  );
};

export default SavingGoals;