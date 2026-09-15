
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { motion, AnimatePresence } from "motion/react";

import {
  Plus,
  Search,
  Pencil,
  Trash2,
  CalendarDays,
  CreditCard,
  Repeat2,
  Clock3,
  X,
  ArrowUpRight,
  Sparkles,
  ChevronRight,
  Zap,
  ArrowLeft,
  Download,
  CheckCheck,
} from "lucide-react";
import { downloadCsv, datedFilename } from "../../utils/exportCsv";

import { App, DatePicker, Spin } from "antd";
import dayjs from "dayjs";

import "./Subscriptions.css";
import { useLanguage } from "../../context/LanguageContext";
import { useCurrency } from "../../hooks/useCurrency";
import LanguageToggle from "../../components/LanguageToggle/LanguageToggle";

const API_URL = "/subscription";

const categories = [
  "Entertainment",
  "Education",
  "Sports",
  "Health",
  "Finance",
  "Travel",
  "Food",
  "Music",
  "Other",
];

const cycles = [
  {
    label: "Monthly",
    value: "monthly",
  },
  {
    label: "Yearly",
    value: "yearly",
  },
  {
    label: "Weekly",
    value: "weekly",
  },
];

const categoryIcons = {
  Entertainment: "🎬",
  Education: "📚",
  Sports: "⚽",
  Health: "❤️",
  Finance: "💰",
  Travel: "✈️",
  Food: "🍔",
  Music: "🎵",
  Other: "📦",
};

const categoryColors = {
  Entertainment: "violet",
  Education: "blue",
  Sports: "green",
  Health: "rose",
  Finance: "amber",
  Travel: "cyan",
  Food: "orange",
  Music: "pink",
  Other: "slate",
};

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const initialForm = {
  name: "",
  price: "",
  category: "Other",
  renewalCycle: "monthly",
  renewalDate: null,
};

export default function Subscriptions() {
  const navigate = useNavigate();
  const { notification } = App.useApp();
  const { t, lang } = useLanguage();
  const { currency } = useCurrency();
  const locale = lang === "ar" ? "ar-EG" : "en-EG";

  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingSubscription, setDeletingSubscription] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState(initialForm);

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  /* =====================================================
     CLOSE FORM
     ===================================================== */

  const closeModal = () => {
    setShowModal(false);
    setEditingSubscription(null);
    setForm(initialForm);
  };

  /* =====================================================
     FETCH
     ===================================================== */

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);

      const response = await api.get(API_URL, {
        headers,
      });

      setSubscriptions(response.data?.subscriptions || []);
    } catch (error) {
      console.error(
        "FETCH SUBSCRIPTIONS ERROR:",
        error.response || error
      );

      notification.error({
        title: "Failed to load subscriptions",
        description:
          error.response?.data?.message ||
          "Something went wrong.",
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  /* =====================================================
     CREATE MODAL
     ===================================================== */

  const openCreateModal = () => {
    setEditingSubscription(null);
    setForm(initialForm);
    setShowModal(true);
  };

  /* =====================================================
     EDIT MODAL
     ===================================================== */

  const openEditModal = (subscription) => {
    setEditingSubscription(subscription);

    setForm({
      name: subscription.name || "",
      price: subscription.price || "",
      category: subscription.category || "Other",
      renewalCycle: subscription.renewalCycle || "monthly",
      renewalDate: subscription.renewalDate
        ? dayjs(subscription.renewalDate)
        : null,
    });

    setShowModal(true);
  };

  /* =====================================================
     FORM CHANGE
     ===================================================== */

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /* =====================================================
     SUBMIT
     ===================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      notification.warning({
        title: "Service name is required",
        duration: 2.5,
      });
      return;
    }

    if (form.name.trim().length < 5) {
      notification.warning({
        title: "Service name must be at least 5 characters",
        duration: 2.5,
      });
      return;
    }

    if (!form.price || Number(form.price) < 1) {
      notification.warning({
        title: "Enter a valid price",
        duration: 2.5,
      });
      return;
    }

    if (!form.renewalDate) {
      notification.warning({
        title: "Renewal date is required",
        duration: 2.5,
      });
      return;
    }

    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      category: form.category,
      renewalCycle: form.renewalCycle,
      renewalDate: form.renewalDate.toISOString(),
    };

    try {
      if (editingSubscription) {
        const response = await api.put(
          `${API_URL}/${editingSubscription._id}`,
          payload,
          {
            headers,
          }
        );

        const updated =
          response.data?.subscription ||
          response.data;

        setSubscriptions((prev) =>
          prev.map((item) =>
            item._id === editingSubscription._id
              ? {
                  ...item,
                  ...updated,
                }
              : item
          )
        );

        notification.success({
          title: "Subscription updated",
          description:
            "Your subscription has been updated successfully.",
          duration: 2.5,
        });
      } else {
        const response = await api.post(
          API_URL,
          payload,
          {
            headers,
          }
        );

        const created =
          response.data?.subscription;

        if (created) {
          setSubscriptions((prev) => [
            created,
            ...prev,
          ]);
        }

        notification.success({
          title: "Subscription added",
          description:
            "Your new recurring payment is now being tracked.",
          duration: 2.5,
        });
      }

      /*
       * IMPORTANT:
       * Close the form only after the API succeeds.
       */
      closeModal();
    } catch (error) {
      console.error(
        "SUBSCRIPTION OPERATION ERROR:",
        error.response || error
      );

      // Offline: queued for later sync — report success.
      if (error.isQueued) {
        closeModal();

        notification.success({
          title: t("common.savedOffline"),
          description: t("common.willSync"),
          duration: 3,
        });

        return;
      }

      notification.error({
        title: "Operation failed",
        description:
          error.response?.data?.message ||
          "Something went wrong.",
        duration: 3,
      });
    }
  };

  /* =====================================================
     DELETE
     ===================================================== */

  const handleDelete = (subscription) => {
    setDeletingSubscription(subscription);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (deleting) return;

    setShowDeleteModal(false);
    setDeletingSubscription(null);
  };

  const confirmDelete = async () => {
    if (!deletingSubscription) return;

    try {
      setDeleting(true);

      await api.delete(
        `${API_URL}/${deletingSubscription._id}`,
        {
          headers,
        }
      );

      setSubscriptions((prev) =>
        prev.filter(
          (item) =>
            item._id !== deletingSubscription._id
        )
      );

      notification.success({
        title: "Subscription deleted",
        description: `${deletingSubscription.name} was removed successfully.`,
        duration: 2.5,
      });

      setShowDeleteModal(false);
      setDeletingSubscription(null);
    } catch (error) {
      console.error(
        "DELETE SUBSCRIPTION ERROR:",
        error.response || error
      );

      notification.error({
        title: "Delete failed",
        description:
          error.response?.data?.message ||
          "Could not delete this subscription.",
        duration: 3,
      });
    } finally {
      setDeleting(false);
    }
  };

  /* =====================================================
     MARK AS USED (silent fail ok)
     ===================================================== */

  const handleMarkUsed = async (subscription) => {
    if (!subscription?._id) return;
    try {
      const response = await api.patch(
        `/subscriptions/${subscription._id}/used`,
        {},
        { headers }
      );
      const updated = response.data?.subscription;
      if (updated) {
        setSubscriptions((prev) =>
          prev.map((item) =>
            item._id === subscription._id
              ? { ...item, ...updated }
              : item
          )
        );
      }
    } catch {
      // silent fail ok
    }
  };

  /* =====================================================
     TOGGLE AUTO-POST (silent fail ok)
     ===================================================== */

  const handleToggleAutoPost = async (subscription) => {
    if (!subscription?._id) return;
    try {
      const response = await api.patch(
        `/subscriptions/${subscription._id}/autopost`,
        {
          autoPostExpense:
            !subscription.autoPostExpense,
        },
        { headers }
      );
      const updated = response.data?.subscription;
      if (updated) {
        setSubscriptions((prev) =>
          prev.map((item) =>
            item._id === subscription._id
              ? { ...item, ...updated }
              : item
          )
        );
      }
    } catch {
      // silent fail ok
    }
  };

  /* =====================================================
     FILTER
     ===================================================== */

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((subscription) => {
      const matchesSearch =
        subscription.name
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" ||
        subscription.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [
    subscriptions,
    search,
    categoryFilter,
  ]);

  /* =====================================================
     MONTHLY SPENDING
     ===================================================== */

  const monthlySpending = useMemo(() => {
    return subscriptions.reduce(
      (total, subscription) => {
        const price =
          Number(subscription.price) || 0;

        if (
          subscription.renewalCycle === "yearly"
        ) {
          return total + price / 12;
        }

        if (
          subscription.renewalCycle === "weekly"
        ) {
          return total + price * 4.33;
        }

        return total + price;
      },
      0
    );
  }, [subscriptions]);

  /* =====================================================
     UPCOMING
     ===================================================== */

  const upcomingSubscriptions = useMemo(() => {
    return [...subscriptions]
      .filter((item) => item.renewalDate)
      .sort(
        (a, b) =>
          new Date(a.renewalDate) -
          new Date(b.renewalDate)
      )
      .slice(0, 5);
  }, [subscriptions]);

  const nextRenewal =
    upcomingSubscriptions[0];

  /* =====================================================
     HELPERS
     ===================================================== */

  const formatMoney = (value) => {
    return `${Number(value || 0).toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${currency}`;
  };

  const formatDate = (date) => {
    if (!date) return "--";

    return new Date(date).toLocaleDateString(
      locale,
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  const getDaysUntil = (date) => {
    if (!date) return 0;

    const today = new Date();
    const renewal = new Date(date);

    today.setHours(0, 0, 0, 0);
    renewal.setHours(0, 0, 0, 0);

    return Math.ceil(
      (renewal - today) /
        (1000 * 60 * 60 * 24)
    );
  };

  /* =====================================================
     UI
     ===================================================== */

  return (
    <div className="subscriptions-page">
      {/* =================================================
          BACKGROUND
          ================================================= */}

      <div className="subscriptions-bg">
        <div className="ambient-orb orb-one" />
        <div className="ambient-orb orb-two" />
        <div className="ambient-orb orb-three" />
        <div className="ambient-grid" />
        <div className="ambient-noise" />
      </div>

      {/* =================================================
          MAIN
          ================================================= */}

      <main className="subscriptions-content">
        {/* =================================================
            HEADER
            ================================================= */}

        <motion.header
          className="subscriptions-header"
          initial={{
            opacity: 0,
            y: -20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.7,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <div className="subscriptions-heading">

            {/* BACK TO DASHBOARD */}

            <motion.button
              type="button"
              className="back-dashboard-btn"
              onClick={() => navigate("/dashboard")}
              whileHover={{
                x: -4,
                scale: 1.02,
              }}
              whileTap={{
                scale: 0.97,
              }}
            >
              <span className="back-dashboard-icon">
                <ArrowLeft size={15} />
              </span>

              <span>
                {t("subscriptions.back")}
              </span>
            </motion.button>

            <div style={{ marginTop: "10px" }}>
              <LanguageToggle variant="dashboard" />
            </div>

            <div className="page-eyebrow">
              <span className="eyebrow-dot" />
              {t("subscriptions.eyebrow")}
            </div>

            
            <h1>
               {t("subscriptions.titlePrefix")}{" "}
  <span className="expenses-title-accent">{t("subscriptions.title")}</span>
</h1>

            <p>
              {t("subscriptions.subtitle")}
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <motion.button
              type="button"
              className="back-dashboard-btn"
              onClick={() => {
                const rows = filteredSubscriptions.map((s) => ({
                  name: s.name || "",
                  price: s.price ?? "",
                  category: s.category || "",
                  renewalCycle: s.renewalCycle || "",
                  renewalDate: s.renewalDate
                    ? new Date(s.renewalDate).toISOString().split("T")[0]
                    : "",
                }));
                downloadCsv(datedFilename("subscriptions"), rows);
              }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
            >
              <Download size={15} />
              <span>{t("common.exportCsv")}</span>
            </motion.button>

            <motion.button
              className="add-subscription-btn"
              onClick={openCreateModal}
              whileHover={{
                y: -3,
                scale: 1.02,
              }}
              whileTap={{
                scale: 0.97,
              }}
            >
              <Plus size={18} />

              <span>
                {t("subscriptions.addSubscription")}
              </span>

              <ArrowUpRight size={16} />
            </motion.button>
          </div>
        </motion.header>

        {/* =================================================
            STATS
            ================================================= */}

        <motion.section
          className="subscription-stats"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* MONTHLY */}

          <motion.div
            className="subscription-stat stat-primary"
            variants={itemVariants}
          >
            <div className="stat-glow" />

            <div className="stat-icon-wrap">
              <CreditCard size={20} />
            </div>

            <div className="stat-content">
              <span>
                {t("subscriptions.monthlySpending")}
              </span>

              <strong>
                {formatMoney(monthlySpending)}
                <small> EGP</small>
              </strong>

              <p>
                <Zap size={12} />
                {t("subscriptions.estimatedCost")}
              </p>
            </div>

            <div className="stat-arrow">
              <ArrowUpRight size={18} />
            </div>
          </motion.div>

          {/* ACTIVE */}

          <motion.div
            className="subscription-stat"
            variants={itemVariants}
          >
            <div className="stat-icon-wrap green">
              <Repeat2 size={20} />
            </div>

            <div className="stat-content">
              <span>
                {t("subscriptions.activeServices")}
              </span>

              <strong>
                {subscriptions.length}
              </strong>

              <p>
                {t("subscriptions.recurringSubs")}
              </p>
            </div>
          </motion.div>

          {/* NEXT RENEWAL */}

          <motion.div
            className="subscription-stat"
            variants={itemVariants}
          >
            <div className="stat-icon-wrap purple">
              <CalendarDays size={20} />
            </div>

            <div className="stat-content">
              <span>
                {t("subscriptions.nextRenewal")}
              </span>

              <strong className="renewal-name">
                {nextRenewal?.name ||
                  t("subscriptions.allClear")}
              </strong>

              <p>
                {nextRenewal
                  ? formatDate(
                      nextRenewal.renewalDate
                    )
                  : t("subscriptions.noUpcoming")}
              </p>
            </div>
          </motion.div>
        </motion.section>

        {/* =================================================
            MAIN GRID
            ================================================= */}

        <div className="subscriptions-layout">
          {/* =================================================
              LIBRARY
              ================================================= */}

          <motion.section
            className="subscriptions-main-card glass-panel"
            initial={{
              opacity: 0,
              y: 30,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.25,
              duration: 0.7,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <div className="main-card-header">
              <div>
                <span className="section-label">
                  {t("subscriptions.yourServices")}
                </span>

                <h2>
                  {t("subscriptions.library")}
                </h2>
              </div>

              <div className="service-count">
                {filteredSubscriptions.length}
              </div>
            </div>

            {/* TOOLBAR */}

            <div className="list-toolbar">
              <div className="search-box">
                <Search size={17} />

                <input
                  type="text"
                  placeholder={t("subscriptions.searchPlaceholder")}
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                />

                {search && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearch("")
                    }
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="filter-wrapper">
                <select
                  value={categoryFilter}
                  onChange={(e) =>
                    setCategoryFilter(
                      e.target.value
                    )
                  }
                >
                  <option value="all">
                    {t("subscriptions.allCategories")}
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            {/* LIST */}

            <div className="subscription-list">
              {loading ? (
                <div className="subscriptions-loading">
                  <Spin />

                  <span>
                    {t("subscriptions.loading")}
                  </span>
                </div>
              ) : filteredSubscriptions.length ===
                0 ? (
                <motion.div
                  className="subscriptions-empty"
                  initial={{
                    opacity: 0,
                    scale: 0.96,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                >
                  <div className="empty-icon">
                    <Repeat2 size={28} />
                  </div>

                  <h3>
                    {t("subscriptions.noSubs")}
                  </h3>

                  <p>
                    {t("subscriptions.noSubsHint")}
                  </p>

                  <button
                    type="button"
                    onClick={openCreateModal}
                  >
                    <Plus size={17} />
                    {t("subscriptions.addSubscription")}
                  </button>
                </motion.div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredSubscriptions.map(
                    (
                      subscription,
                      index
                    ) => {
                      const color =
                        categoryColors[
                          subscription.category
                        ] || "slate";

                      const daysUntil =
                        getDaysUntil(
                          subscription.renewalDate
                        );

                      return (
                        <motion.article
                          className={`subscription-card ${color}`}
                          key={
                            subscription._id
                          }
                          layout
                          initial={{
                            opacity: 0,
                            y: 20,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          exit={{
                            opacity: 0,
                            scale: 0.96,
                          }}
                          transition={{
                            duration: 0.5,
                            delay:
                              index * 0.04,
                            ease: [
                              0.16,
                              1,
                              0.3,
                              1,
                            ],
                          }}
                          whileHover={{
                            y: -4,
                          }}
                        >
                          <div className="card-light" />

                          {/* SERVICE */}

                          <div className="service-info">
                            <motion.div
                              className="service-icon"
                              whileHover={{
                                rotate: -6,
                                scale: 1.08,
                              }}
                            >
                              {categoryIcons[
                                subscription.category
                              ] || "📦"}
                            </motion.div>

                            <div>
                              <h3>
                                {
                                  subscription.name
                                }
                              </h3>

                              <div className="service-meta">
                                <span>
                                  {
                                    subscription.category
                                  }
                                </span>

                                <i />

                                <span>
                                  {
                                    subscription.renewalCycle
                                  }
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* PRICE */}

                          <div className="subscription-price">
                            <span>
                              {t("subscriptions.amount")}
                            </span>

                            <strong>
                              {formatMoney(
                                subscription.price
                              )}

                              <small>
                                {" "}
                                EGP
                              </small>
                            </strong>

                            <em>
                              {subscription.renewalCycle ===
                              "monthly"
                                ? t("subscriptions.perMonth")
                                : subscription.renewalCycle ===
                                  "yearly"
                                ? t("subscriptions.perYear")
                                : t("subscriptions.perWeek")}
                            </em>
                          </div>

                          {/* RENEWAL */}

                          <div className="renewal-info">
                            <div className="renewal-icon">
                              <CalendarDays
                                size={16}
                              />
                            </div>

                            <div>
                              <span>
                                {t("subscriptions.nextRenewalLabel")}
                              </span>

                              <strong>
                                {formatDate(
                                  subscription.renewalDate
                                )}
                              </strong>
                            </div>

                            <small
                              className={
                                daysUntil <= 7
                                  ? "urgent"
                                  : ""
                              }
                            >
                              {daysUntil < 0
                                ? t("subscriptions.passed")
                                : daysUntil === 0
                                ? t("subscriptions.today")
                                : `${daysUntil} ${t("subscriptions.days")}`}
                            </small>
                          </div>

                          {/* ACTIONS */}

                          <div className="subscription-actions">
                            <button
                              type="button"
                              className="mark-used-action"
                              onClick={() =>
                                handleMarkUsed(
                                  subscription
                                )
                              }
                              title={t("subscriptions.markUsed")}
                            >
                              <CheckCheck
                                size={15}
                              />
                              <span className="mark-used-label">
                                {t("subscriptions.markUsed")}
                              </span>
                            </button>
                            <button
                              type="button"
                              className={`mark-used-action ${
                                subscription.autoPostExpense === false
                                  ? "auto-post-off"
                                  : ""
                              }`}
                              onClick={() =>
                                handleToggleAutoPost(
                                  subscription
                                )
                              }
                              title={t("subscriptions.autoPost")}
                            >
                              <Repeat2
                                size={15}
                              />
                              <span className="mark-used-label">
                                {t("subscriptions.autoPost")}
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                openEditModal(
                                  subscription
                                )
                              }
                              title={t("common.edit")}
                            >
                              <Pencil
                                size={15}
                              />
                            </button>

                            <button
                              type="button"
                              className="delete-action"
                              onClick={() =>
                                handleDelete(
                                  subscription
                                )
                              }
                              title={t("common.delete")}
                            >
                              <Trash2
                                size={15}
                              />
                            </button>
                          </div>
                        </motion.article>
                      );
                    }
                  )}
                </AnimatePresence>
              )}
            </div>
          </motion.section>

          {/* =================================================
              RENEWAL PANEL
              ================================================= */}

          <motion.aside
            className="renewal-panel glass-panel"
            initial={{
              opacity: 0,
              x: 25,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              delay: 0.35,
              duration: 0.7,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <div className="renewal-panel-header">
              <div>
                <span className="section-label">
                  {t("subscriptions.upcoming")}
                </span>

                <h2>
                  {t("subscriptions.renewalFlow")}
                </h2>
              </div>

              <div className="clock-icon">
                <Clock3 size={18} />
              </div>
            </div>

            <div className="renewal-summary">
              <span>
                {t("subscriptions.nextPayment")}
              </span>

              <strong>
                {nextRenewal
                  ? formatMoney(
                      nextRenewal.price
                    )
                  : "0"}

                <small> EGP</small>
              </strong>

              {nextRenewal && (
                <p>
                  <Sparkles size={13} />
                  {nextRenewal.name}
                </p>
              )}
            </div>

            {upcomingSubscriptions.length ===
            0 ? (
              <div className="timeline-empty">
                <div>
                  <CheckIcon />
                </div>

                <h3>
                  {t("subscriptions.clear")}
                </h3>

                <p>
                  {t("subscriptions.noWorry")}
                </p>
              </div>
            ) : (
              <div className="renewal-timeline">
                {upcomingSubscriptions.map(
                  (
                    subscription,
                    index
                  ) => {
                    const days =
                      getDaysUntil(
                        subscription.renewalDate
                      );

                    return (
                      <motion.div
                        className="timeline-item"
                        key={
                          subscription._id
                        }
                        initial={{
                          opacity: 0,
                          x: 15,
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                        }}
                        transition={{
                          delay:
                            0.5 +
                            index * 0.08,
                        }}
                      >
                        <div className="timeline-line">
                          <div className="timeline-dot">
                            <span />
                          </div>

                          {index !==
                            upcomingSubscriptions.length -
                              1 && (
                            <div className="timeline-connector" />
                          )}
                        </div>

                        <div className="timeline-content">
                          <div>
                            <strong>
                              {
                                subscription.name
                              }
                            </strong>

                            <span>
                              {formatDate(
                                subscription.renewalDate
                              )}
                            </span>
                          </div>

                          <div className="timeline-right">
                            <b>
                              {formatMoney(
                                subscription.price
                              )}{" "}
                              EGP
                            </b>

                            <small
                              className={
                                days <= 7
                                  ? "urgent"
                                  : ""
                              }
                            >
                              {days < 0
                                ? t("subscriptions.passed")
                                : days === 0
                                ? t("subscriptions.today")
                                : `${days}${t("subscriptions.daysShort")}`}
                            </small>
                          </div>
                        </div>
                      </motion.div>
                    );
                  }
                )}
              </div>
            )}

            <button
              type="button"
              className="timeline-footer"
              onClick={() => {
                setCategoryFilter("all");
                setSearch("");
              }}
            >
              <span>
                {t("subscriptions.viewAll")}
              </span>

              <ChevronRight size={16} />
            </button>
          </motion.aside>
        </div>
      </main>

      {/* =====================================================
          CREATE / EDIT MODAL
          ===================================================== */}

      <AnimatePresence>
        {showModal && (
          <motion.div
            className="subscription-modal-backdrop"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            onMouseDown={(e) => {
              if (
                e.target ===
                e.currentTarget
              ) {
                closeModal();
              }
            }}
          >
            <motion.div
              className="subscription-modal"
              initial={{
                opacity: 0,
                y: 40,
                scale: 0.96,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 30,
                scale: 0.97,
              }}
              transition={{
                duration: 0.5,
                ease: [
                  0.16,
                  1,
                  0.3,
                  1,
                ],
              }}
              onMouseDown={(e) =>
                e.stopPropagation()
              }
            >
              <div className="modal-glow" />

              {/* MODAL CLOSE */}

              <button
                type="button"
                className="modal-close-btn"
                onClick={closeModal}
                aria-label="Close"
              >
                <X size={18} />
              </button>

              {/* HERO */}

              <div className="form-hero">
                <div className="form-hero-icon">
                  <CreditCard size={22} />
                </div>

                <div className="form-hero-content">
                  <span>
                    {editingSubscription
                      ? t("subscriptions.editingService")
                      : t("subscriptions.newPayment")}
                  </span>

                  <h3>
                    {editingSubscription
                      ? t("subscriptions.refineSub")
                      : t("subscriptions.addNewSub")}
                  </h3>

                  <p>
                    {t("subscriptions.keepVisible")}
                  </p>
                </div>

                <div className="form-hero-orb" />
              </div>

              {/* FORM */}

              <form
                onSubmit={handleSubmit}
                className="subscription-form"
              >
                {/* SERVICE */}

                <div className="form-section">
                  <div className="form-section-heading">
                    <span>01</span>

                    <div>
                      <strong>
                        {t("subscriptions.service")}
                      </strong>

                      <small>
                        {t("subscriptions.serviceHint")}
                      </small>
                    </div>
                  </div>

                  <div className="form-group premium-field">
                    <label>
                      {t("subscriptions.serviceName")}
                    </label>

                    <div className="input-shell">
                      <div className="input-icon">
                        <CreditCard
                          size={17}
                        />
                      </div>

                      <input
                        type="text"
                        placeholder={t("subscriptions.servicePlaceholder")}
                        value={form.name}
                        onChange={(e) =>
                          handleChange(
                            "name",
                            e.target.value
                          )
                        }
                      />

                      {form.name && (
                        <span className="input-status">
                          {t("subscriptions.ready")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* PAYMENT */}

                <div className="form-section">
                  <div className="form-section-heading">
                    <span>02</span>

                    <div>
                      <strong>
                        {t("subscriptions.payment")}
                      </strong>

                      <small>
                        {t("subscriptions.paymentHint")}
                      </small>
                    </div>
                  </div>

                  <div className="form-grid premium-grid">
                    {/* PRICE */}

                    <div className="form-group premium-field">
                      <label>
                        {t("subscriptions.price")}
                      </label>

                      <div className="input-shell price-shell">
                        <span className="currency-label">
                          EGP
                        </span>

                        <input
                          type="number"
                          min="1"
                          placeholder="300"
                          value={form.price}
                          onChange={(e) =>
                            handleChange(
                              "price",
                              e.target.value
                            )
                          }
                        />

                        <span className="price-suffix">
                          {t("subscriptions.amountLabel")}
                        </span>
                      </div>
                    </div>

                    {/* CATEGORY */}

                    <div className="form-group premium-field">
                      <label>
                        {t("subscriptions.category")}
                      </label>

                      <div className="category-select-wrapper">
                        <div className="category-current">
                          <span className="category-current-icon">
                            {
                              categoryIcons[
                                form.category
                              ]
                            }
                          </span>

                          <div>
                            <strong>
                              {form.category}
                            </strong>

                            <small>
                              {t("subscriptions.paymentCategory")}
                            </small>
                          </div>
                        </div>

                        <ChevronRight
                          size={16}
                        />

                        <select
                          value={
                            form.category
                          }
                          onChange={(e) =>
                            handleChange(
                              "category",
                              e.target.value
                            )
                          }
                        >
                          {categories.map(
                            (item) => (
                              <option
                                key={item}
                                value={item}
                              >
                                {item}
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SCHEDULE */}

                <div className="form-section">
                  <div className="form-section-heading">
                    <span>03</span>

                    <div>
                      <strong>
                        {t("subscriptions.schedule")}
                      </strong>

                      <small>
                        {t("subscriptions.scheduleHint")}
                      </small>
                    </div>
                  </div>

                  {/* BILLING CYCLE */}

                  <div className="form-group premium-field">
                    <label>
                      {t("subscriptions.billingCycle")}
                    </label>

                    <div className="cycle-selector">
                      {cycles.map(
                        (cycle) => (
                          <button
                            key={
                              cycle.value
                            }
                            type="button"
                            className={
                              form.renewalCycle ===
                              cycle.value
                                ? "active"
                                : ""
                            }
                            onClick={() =>
                              handleChange(
                                "renewalCycle",
                                cycle.value
                              )
                            }
                          >
                            <Repeat2
                              size={16}
                            />

                            <span>
                              {cycle.value === "monthly"
                                ? t("subscriptions.monthly")
                                : cycle.value === "yearly"
                                ? t("subscriptions.yearly")
                                : t("subscriptions.weekly")}
                            </span>

                            {form.renewalCycle ===
                              cycle.value && (
                              <motion.div
                                className="cycle-active-dot"
                                layoutId="cycle-active"
                              />
                            )}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* DATE */}

                  <div className="form-group premium-field">
                    <label>
                      {t("subscriptions.nextRenewalDate")}
                    </label>

                    <div className="date-shell">
                      <div className="date-icon">
                        <CalendarDays
                          size={17}
                        />
                      </div>

                      <div className="date-content">
                        <span>
                          {t("subscriptions.nextPaymentDate")}
                        </span>

                        <DatePicker
                          value={
                            form.renewalDate
                          }
                          onChange={(date) =>
                            handleChange(
                              "renewalDate",
                              date
                            )
                          }
                          format="DD MMM YYYY"
                          placeholder={t("subscriptions.datePlaceholder")}
                          suffixIcon={
                            <ChevronRight
                              size={15}
                            />
                          }
                          allowClear={false}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* LIVE PREVIEW */}

                <motion.div
                  className="form-summary"
                  layout
                >
                  <div className="summary-top">
                    <span>
                      {t("subscriptions.preview")}
                    </span>

                    <Sparkles size={15} />
                  </div>

                  <div className="summary-main">
                    <div className="summary-service">
                      <div className="summary-icon">
                        {
                          categoryIcons[
                            form.category
                          ]
                        }
                      </div>

                      <div>
                        <strong>
                          {form.name ||
                            t("subscriptions.yourService")}
                        </strong>

                        <span>
                          {form.category} ·{" "}
                          {form.renewalCycle}
                        </span>
                      </div>
                    </div>

                    <div className="summary-price">
                      <strong>
                        {formatMoney(
                          form.price || 0
                        )}
                      </strong>

                      <span>
                        EGP
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* ACTIONS */}

                <div className="modal-actions premium-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={closeModal}
                  >
                    <X size={16} />
                    {t("subscriptions.cancel")}
                  </button>

                  <button
                    type="submit"
                    className="save-btn"
                  >
                    <span>
                      {editingSubscription
                        ? t("subscriptions.saveChanges")
                        : t("subscriptions.createSub")}
                    </span>

                    <ArrowUpRight
                      size={17}
                    />
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================
          DELETE CONFIRMATION
          ===================================================== */}

      <AnimatePresence>
        {showDeleteModal &&
          deletingSubscription && (
            <motion.div
              className="delete-modal-backdrop"
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              onMouseDown={(e) => {
                if (
                  e.target ===
                    e.currentTarget &&
                  !deleting
                ) {
                  closeDeleteModal();
                }
              }}
            >
              <motion.div
                className="delete-modal"
                initial={{
                  opacity: 0,
                  y: 30,
                  scale: 0.94,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  y: 20,
                  scale: 0.97,
                }}
                transition={{
                  duration: 0.35,
                  ease: [
                    0.16,
                    1,
                    0.3,
                    1,
                  ],
                }}
                onMouseDown={(e) =>
                  e.stopPropagation()
                }
              >
                <div className="delete-icon-wrap">
                  <Trash2 size={23} />
                </div>

                <span className="delete-eyebrow">
                  {t("subscriptions.removeService")}
                </span>

                <h2>
                  {t("subscriptions.deleteTitle")}{" "}
                  {deletingSubscription.name}?
                </h2>

                <p>
                  {t("subscriptions.deleteHint")}
                </p>

                <div className="delete-preview">
                  <div className="delete-preview-icon">
                    {
                      categoryIcons[
                        deletingSubscription.category
                      ] || "📦"
                    }
                  </div>

                  <div>
                    <strong>
                      {
                        deletingSubscription.name
                      }
                    </strong>

                    <span>
                      {formatMoney(
                        deletingSubscription.price
                      )}{" "}
                      EGP ·{" "}
                      {
                        deletingSubscription
                          .renewalCycle
                      }
                    </span>
                  </div>
                </div>

                <div className="delete-modal-actions">
                  <button
                    type="button"
                    className="delete-cancel-btn"
                    disabled={deleting}
                    onClick={closeDeleteModal}
                  >
                    {t("subscriptions.keepSub")}
                  </button>

                  <button
                    type="button"
                    className="delete-confirm-btn"
                    disabled={deleting}
                    onClick={confirmDelete}
                  >
                    {deleting ? (
                      <>
                        <Spin size="small" />
                        {t("subscriptions.deleting")}
                      </>
                    ) : (
                      <>
                        <Trash2 size={16} />
                        {t("common.delete")}
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
}

/* =========================================================
   CHECK ICON
   ========================================================= */

function CheckIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
