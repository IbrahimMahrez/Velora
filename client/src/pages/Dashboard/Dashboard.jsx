import { useEffect, useState } from "react";
import api from "../../services/api";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  CreditCard,
  CalendarClock,
  Target,
  Sparkles,
  Settings,
  LogOut,
  Bell,
  BellRing,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight,
  Clock3,
  CheckCircle2,
  Menu,
  X,
  Trash2,
  ChevronRight,
  Home,
  PiggyBank,
  Users,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useCurrency } from "../../hooks/useCurrency";
import LanguageToggle from "../../components/LanguageToggle/LanguageToggle";
import OnboardingWizard from "../../components/Onboarding/OnboardingWizard";
import {
  pushSupport,
  ensurePushSubscribed,
  requestPushPermission,
} from "../../utils/pushClient";
import logo from "../../assets/logo.png";
import "./Dashboard.css";

const API_URL = "/dashboard";

const NOTIFICATIONS_API_URL = "/notifications";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260601_110537_3a579fa0-7bbc-4d94-9d25-0e816c7840f5.mp4";

function Dashboard() {
  const { user, logout } = useAuth();
  const { t, lang } = useLanguage();
  const { currency } = useCurrency();
  const navigate = useNavigate();
  const locale = lang === "ar" ? "ar-EG" : "en-EG";

  // ==========================================
  // Dashboard State
  // ==========================================

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [mobileMenu, setMobileMenu] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [pushState, setPushState] = useState(null);

  // Browser push: silently sync when already granted,
  // otherwise offer a one-tap enable button.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const support = pushSupport();

        if (support === "granted") {
          await ensurePushSubscribed();
          if (!cancelled) setPushState("subscribed");
        } else if (support === "default") {
          if (!cancelled) setPushState("prompt");
        } else if (!cancelled) {
          setPushState(support);
        }
      } catch {
        if (!cancelled) setPushState("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleEnablePush = async () => {
    setPushState("waiting");
    const result = await requestPushPermission();
    setPushState(result);
  };

  // ==========================================
  // Notifications State
  // ==========================================

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [showNotifications, setShowNotifications] =
    useState(false);

  const [notificationsLoading, setNotificationsLoading] =
    useState(false);

  const [notificationsError, setNotificationsError] =
    useState("");

  // ==========================================
  // Spending Trend (last 6 months)
  // ==========================================

  const [trend, setTrend] = useState([]);
  const [trendFailed, setTrendFailed] = useState(false);

  useEffect(() => {
    const fetchTrend = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await api.get("/dashboard/monthly", {
          params: { months: 6 },
        });
        const rows = Array.isArray(res.data?.data) ? res.data.data : [];
        setTrend(rows);
      } catch {
        // Graceful: hide card on failure, don't break dashboard.
        setTrendFailed(true);
      }
    };
    fetchTrend();
  }, []);

  const trendData = (Array.isArray(trend) ? trend : []).map((row) => {
    let label = row.key || "";
    if (typeof label === "string" && /^\d{4}-\d{2}$/.test(label)) {
      const d = new Date(`${label}-01T00:00:00`);
      if (!Number.isNaN(d.getTime())) {
        label = d.toLocaleDateString(locale, { month: "short" });
      }
    }
    return { ...row, label, total: Number(row.total) || 0 };
  });

  // ==========================================
  // Fetch Dashboard
  // ==========================================

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("You are not logged in.");
        }

        const response = await api.get(API_URL, {
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
          params: {
            _t: Date.now(),
          },
        });

        console.log(
          "DASHBOARD RESPONSE:",
          response.data
        );

        setDashboard(response.data);

        // First-run onboarding: brand-new accounts with no
        // expenses yet get the guided setup (once ever).
        try {
          const done =
            localStorage.getItem("velora-onboarded") ===
            "done";
          const total =
            Number(response.data?.expenses?.totalExpenses) ||
            0;
          const recent = Array.isArray(
            response.data?.recentExpenses
          )
            ? response.data.recentExpenses
            : [];

          if (!done && total === 0 && recent.length === 0) {
            setShowOnboarding(true);
          }
        } catch {
          // never block the dashboard
        }
      } catch (err) {
        console.log(
          "DASHBOARD STATUS:",
          err.response?.status
        );

        console.log(
          "DASHBOARD DATA:",
          err.response?.data
        );

        setError(
          err.response?.data?.message ||
            err.response?.data?.error?.message ||
            err.message ||
            "Unable to load your dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // ==========================================
  // Onboarding Trigger (never breaks dashboard)
  // ==========================================

  useEffect(() => {
    try {
      if (loading || error || !dashboard) return;
      if (localStorage.getItem("velora-onboarded") === "done") return;
      const total = Number(dashboard.expenses?.totalExpenses) || 0;
      const recent = Array.isArray(dashboard.recentExpenses)
        ? dashboard.recentExpenses
        : [];
      if (total === 0 && recent.length === 0) {
        setShowOnboarding(true);
      }
    } catch {
      // never break dashboard on trigger failure
    }
  }, [dashboard, loading, error]);

  // ==========================================
  // Fetch Notifications
  // ==========================================

  const fetchNotifications = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    try {
      setNotificationsLoading(true);
      setNotificationsError("");

      const response = await api.get(
        NOTIFICATIONS_API_URL
      );

      console.log(
        "NOTIFICATIONS RESPONSE:",
        response.data
      );

      setNotifications(
        Array.isArray(
          response.data?.notifications
        )
          ? response.data.notifications
          : []
      );

      setUnreadCount(
        Number(
          response.data?.unreadCount
        ) || 0
      );
    } catch (err) {
      // 401 = expired session: the global api interceptor already
      // redirects to /login, so stay silent instead of flashing
      // an error dropdown.
      if (err.response?.status === 401) {
        return;
      }

      console.error(
        "NOTIFICATIONS ERROR:",
        err.response?.data ||
          err.message
      );

      setNotificationsError(
        err.response?.data?.message ||
          "Unable to load notifications."
      );
    } finally {
      setNotificationsLoading(false);
    }
  };

  // ==========================================
  // Initial Notifications Fetch
  // ==========================================

  useEffect(() => {
    fetchNotifications();
  }, []);

  // ==========================================
  // Notifications Polling
  // ==========================================

  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // ==========================================
  // Logout
  // ==========================================

  const handleLogout = () => {
    setMobileMenu(false);
    setShowNotifications(false);

    logout();

    navigate("/login");
  };

  // ==========================================
  // Mark Notification As Read
  // ==========================================

  const handleMarkAsRead = async (
    notificationId
  ) => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    try {
      await api.patch(
        `${NOTIFICATIONS_API_URL}/${notificationId}/read`,
        {}
      );

      setNotifications((current) =>
        current.map((notification) =>
          notification._id ===
          notificationId
            ? {
                ...notification,
                isRead: true,
              }
            : notification
        )
      );

      setUnreadCount((current) =>
        Math.max(current - 1, 0)
      );
    } catch (err) {
      console.error(
        "MARK AS READ ERROR:",
        err.response?.data ||
          err.message
      );
    }
  };

  // ==========================================
  // Mark All Notifications As Read
  // ==========================================

  const handleMarkAllAsRead = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    try {
      await api.patch(
        `${NOTIFICATIONS_API_URL}/read-all`,
        {}
      );

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );

      setUnreadCount(0);
    } catch (err) {
      console.error(
        "MARK ALL AS READ ERROR:",
        err.response?.data ||
          err.message
      );
    }
  };

  // ==========================================
  // Delete Notification
  // ==========================================

  const handleDeleteNotification = async (
    notificationId,
    wasUnread
  ) => {
    const token = localStorage.getItem("token");

    if (!token || !notificationId) {
      return;
    }

    // Optimistic removal
    setNotifications((current) =>
      current.filter(
        (notification) =>
          notification._id !== notificationId
      )
    );

    if (wasUnread) {
      setUnreadCount((current) =>
        Math.max(current - 1, 0)
      );
    }

    try {
      await api.delete(
        `${NOTIFICATIONS_API_URL}/${notificationId}`
      );
    } catch (err) {
      console.error(
        "DELETE NOTIFICATION ERROR:",
        err.response?.data ||
          err.message
      );

      // Roll back on failure
      fetchNotifications();
    }
  };

  // ==========================================
  // Delete All Notifications
  // ==========================================

  const handleDeleteAllNotifications = async () => {
    const token = localStorage.getItem("token");

    if (!token || notifications.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      t("dashboard.deleteConfirm")
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(NOTIFICATIONS_API_URL);

      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error(
        "DELETE ALL NOTIFICATIONS ERROR:",
        err.response?.data ||
          err.message
      );
    }
  };

  // ==========================================
  // Notification Time
  // ==========================================

  const formatNotificationTime = (
    createdAt
  ) => {
    if (!createdAt) {
      return "";
    }

    const date = new Date(createdAt);

    if (
      Number.isNaN(date.getTime())
    ) {
      return "";
    }

    return date.toLocaleString(
      locale,
      {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // ==========================================
  // Notification Icon
  // ==========================================

  const getNotificationIcon = (type) => {
    switch (type) {
      case "bill":
        return <Receipt size={15} />;

      case "subscription":
        return <CreditCard size={15} />;

      case "installment":
        return (
          <CalendarClock size={15} />
        );

      case "goal":
        return <Target size={15} />;

      case "expense":
        return <Wallet size={15} />;

      default:
        return <Bell size={15} />;
    }
  };

  // ==========================================
  // Format Money
  // ==========================================

  const formatMoney = (value) => {
    return new Intl.NumberFormat(
      locale,
      {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }
    ).format(Number(value) || 0);
  };

  // ==========================================
  // Format Date
  // ==========================================

  const formatDate = (date) => {
    if (!date) {
      return "No date";
    }

    const parsedDate = new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "No date";
    }

    return parsedDate.toLocaleDateString(
      locale,
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ==========================================
  // User Name
  // ==========================================

  const getUserName = () => {
    if (user?.name) {
      return user.name;
    }

    if (user?.email) {
      return user.email.split("@")[0];
    }

    return "there";
  };

  // ==========================================
  // User Avatar
  // ==========================================

  const getUserAvatar = () => {
    return user?.avatar || null;
  };

  // ==========================================
  // User Plan
  // ==========================================

  const getUserPlan = () => {
    return (
      dashboard?.userPlan?.name ||
      user?.plan?.name ||
      user?.plan ||
      "Free"
    );
  };

  // ==========================================
  // Plan Class
  // ==========================================

  const getPlanClass = () => {
    const plan =
      getUserPlan().toLowerCase();

    if (plan.includes("premium")) {
      return "premium";
    }

    if (plan.includes("family")) {
      return "family";
    }

    return "free";
  };

  // ==========================================
  // Recent Expenses
  // ==========================================

  const recentExpenses =
    Array.isArray(
      dashboard?.recentExpenses
    )
      ? dashboard.recentExpenses
      : [];

  // ==========================================
  // Stats
  // ==========================================

  const stats = dashboard
    ? [
        {
          title: t("dashboard.totalExpenses"),
          value: formatMoney(
            dashboard.expenses
              ?.totalExpenses
          ),
          icon: Wallet,
          type: "expense",
        },
        {
          title: t("dashboard.bills"),
          value: formatMoney(
            dashboard.bills
              ?.totalBillsAmount
          ),
          icon: Receipt,
          type: "bill",
        },
        {
          title: t("dashboard.subscriptions"),
          value: formatMoney(
            dashboard.subscriptions
              ?.monthlySubscriptionsCost
          ),
          icon: CreditCard,
          type: "subscription",
        },
        {
          title: t("dashboard.savingsGoals"),
          value: `${
            dashboard.goals
              ?.completedGoals || 0
          }/${
            dashboard.goals
              ?.totalGoals || 0
          }`,
          icon: Target,
          type: "goal",
        },
      ]
    : [];

  // ==========================================
  // Render
  // ==========================================

  return (
    <main className="dashboard-page">

      {/* =========================
          Background Video
      ========================= */}

      <div className="dashboard-video">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source
            src={VIDEO_URL}
            type="video/mp4"
          />
        </video>
      </div>

      <div className="dashboard-overlay" />

      {/* =========================
          Mobile Menu Button
      ========================= */}

      <button
        type="button"
        className="dashboard-mobile-toggle"
        onClick={() =>
          setMobileMenu(!mobileMenu)
        }
      >
        {mobileMenu ? (
          <X size={20} />
        ) : (
          <Menu size={20} />
        )}
      </button>

      {/* =========================
          Sidebar
      ========================= */}

      <aside
        className={`dashboard-sidebar ${
          mobileMenu
            ? "dashboard-sidebar-open"
            : ""
        }`}
      >
        <div className="dashboard-brand">
          <Link
            to="/"
            className="dashboard-brand-link"
            onClick={() =>
              setMobileMenu(false)
            }
          >
            <img
              src={logo}
              alt="Velora"
              className="dashboard-brand-logo"
            />
          </Link>
        </div>

        <nav className="dashboard-nav">

          <Link
            to="/"
            className="dashboard-nav-item"
            onClick={() =>
              setMobileMenu(false)
            }
          >
            <Home size={17} />
            <span>{t("sidebar.home")}</span>
          </Link>

          <Link
            to="/dashboard"
            className="dashboard-nav-item active"
            onClick={() =>
              setMobileMenu(false)
            }
          >
            <LayoutDashboard size={17} />
            <span>{t("sidebar.overview")}</span>
          </Link>

          <Link
            to="/expenses"
            className="dashboard-nav-item"
            onClick={() =>
              setMobileMenu(false)
            }
          >
            <Wallet size={18} />
            <span>{t("sidebar.expenses")}</span>
          </Link>

          <Link
            to="/bills"
            className="dashboard-nav-item"
            onClick={() =>
              setMobileMenu(false)
            }
          >
            <Receipt size={17} />
            <span>{t("sidebar.bills")}</span>
          </Link>

          <Link
            to="/subscriptions"
            className="dashboard-nav-item"
            onClick={() =>
              setMobileMenu(false)
            }
          >
            <CreditCard size={17} />
            <span>{t("sidebar.subscriptions")}</span>
          </Link>

          <Link
            to="/installments"
            className="dashboard-nav-item"
            onClick={() =>
              setMobileMenu(false)
            }
          >
            <Receipt size={17} />
            <span>{t("sidebar.installments")}</span>
          </Link>

          <Link
            to="/saving-goals"
            className="dashboard-nav-item"
            onClick={() =>
              setMobileMenu(false)
            }
          >
            <Target size={17} />
            <span>{t("sidebar.savings")}</span>
          </Link>

          <Link
            to="/budgets"
            className="dashboard-nav-item"
            onClick={() =>
              setMobileMenu(false)
            }
          >
            <PiggyBank size={17} />
            <span>{t("sidebar.budgets")}</span>
          </Link>

          <Link
            to="/family"
            className="dashboard-nav-item"
            onClick={() =>
              setMobileMenu(false)
            }
          >
            <Users size={17} />
            <span>{t("sidebar.family")}</span>
          </Link>

          <Link
            to="/calendar"
            className="dashboard-nav-item"
            onClick={() =>
              setMobileMenu(false)
            }
          >
            <CalendarDays size={17} />
            <span>{t("sidebar.calendar")}</span>
          </Link>

          <Link
            to="/ai"
            className="dashboard-nav-item"
            onClick={() =>
              setMobileMenu(false)
            }
          >
            <Sparkles size={17} />
            <span>{t("sidebar.aiInsights")}</span>
          </Link>
          <Link
            to="/settings"
            className="dashboard-nav-item"
            onClick={() =>
              setMobileMenu(false)
            }
          >
            <Settings size={18} />
            <span>{t("sidebar.settings")}</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="dashboard-nav-item logout-button"
          >
            <LogOut size={18} />
            <span>{t("sidebar.logout")}</span>
          </button>

        </nav>

        
      </aside>

      {/* =========================
          Main Content
      ========================= */}

      <section className="dashboard-content">

        {showOnboarding && (
          <OnboardingWizard
            onDone={() => {
              try {
                localStorage.setItem("velora-onboarded", "done");
              } catch {
                // ignore
              }
              setShowOnboarding(false);
            }}
          />
        )}

        {/* =========================
            Topbar
        ========================= */}

        <header className="dashboard-topbar">

          <div>
            <p className="dashboard-eyebrow">
              {t("dashboard.workspace")}
            </p>

            <h1>{t("dashboard.overview")}</h1>
          </div>

          <div className="dashboard-topbar-actions">

            <LanguageToggle variant="dashboard" />

            {pushState === "prompt" && (
              <button
                type="button"
                className="dashboard-icon-button"
                style={{
                  width: "auto",
                  minWidth: "40px",
                  padding: "0 12px",
                  borderRadius: "999px",
                  gap: "6px",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
                onClick={handleEnablePush}
                title={t("dashboard.pushEnable")}
              >
                <BellRing size={15} />
                <span>{t("dashboard.pushEnable")}</span>
              </button>
            )}

            {/* =========================
                Notifications
            ========================= */}

            <div className="notification-wrapper">

              <button
                type="button"
                className="dashboard-icon-button notification-button"
                onClick={() => {
                  setShowNotifications(
                    (current) =>
                      !current
                  );

                  if (
                    !showNotifications
                  ) {
                    fetchNotifications();
                  }
                }}
                aria-label={t("dashboard.notifications")}
              >
                <Bell size={18} />

                {unreadCount > 0 && (
                  <span className="notification-badge">
                    {unreadCount > 99
                      ? "99+"
                      : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="notification-dropdown">

                  <div className="notification-header">

                    <div>
                      <h3>
                        {t("dashboard.notifications")}
                      </h3>

                      <span>
                        {unreadCount} {t("dashboard.unread")}
                      </span>
                    </div>

                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={
                          handleMarkAllAsRead
                        }
                      >
                        {t("dashboard.markAllRead")}
                      </button>
                    )}

                    {notifications.length > 0 && (
                      <button
                        type="button"
                        className="notification-delete-all"
                        onClick={
                          handleDeleteAllNotifications
                        }
                      >
                        <Trash2 size={13} />
                        {t("dashboard.deleteAll")}
                      </button>
                    )}

                  </div>

                  <div className="notification-list">

                    {notificationsLoading ? (

                      <div className="notification-empty">
                        <div className="loading-spinner" />

                        <p>
                          {t("dashboard.loadingNotifications")}
                        </p>
                      </div>

                    ) : notificationsError ? (

                      <div className="notification-empty">

                        <Bell size={26} />

                        <p>
                          {
                            notificationsError
                          }
                        </p>

                        <button
                          type="button"
                          onClick={
                            fetchNotifications
                          }
                        >
                          {t("dashboard.tryAgain")}
                        </button>

                      </div>

                    ) : notifications.length ===
                      0 ? (

                      <div className="notification-empty">

                        <Bell size={28} />

                        <p>
                          {t("dashboard.noNotifications")}
                        </p>

                        <span>
                          {t("dashboard.caughtUp")}
                        </span>

                      </div>

                    ) : (

                      notifications.map(
                        (notification) => (

                          <div
                            key={
                              notification._id
                            }
                            className={`notification-item ${
                              !notification.isRead
                                ? "unread"
                                : ""
                            }`}
                            onClick={() => {
                              if (
                                !notification.isRead
                              ) {
                                handleMarkAsRead(
                                  notification._id
                                );
                              }
                            }}
                          >

                            <div
                              className={`notification-type-icon ${
                                notification.type ||
                                "system"
                              }`}
                            >
                              {getNotificationIcon(
                                notification.type
                              )}
                            </div>

                            <div className="notification-content">

                              <div className="notification-title-row">

                                <h4>
                                  {
                                    notification.title
                                  }
                                </h4>

                                {!notification.isRead && (
                                  <span className="notification-unread-dot" />
                                )}

                                <button
                                  type="button"
                                  className="notification-delete"
                                  title={t("dashboard.deleteOne")}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteNotification(
                                      notification._id,
                                      !notification.isRead
                                    );
                                  }}
                                >
                                  <X size={13} />
                                </button>

                              </div>

                              <p>
                                {
                                  notification.message
                                }
                              </p>

                              <span className="notification-time">
                                {formatNotificationTime(
                                  notification.createdAt
                                )}
                              </span>

                            </div>

                          </div>

                        )
                      )

                    )}

                  </div>
                </div>
              )}

            </div>

            {/* =========================
                Profile
            ========================= */}

            <Link
              to="/profile"
              className="dashboard-user dashboard-profile-link"
              onClick={() =>
                setMobileMenu(false)
              }
            >

              {/* Avatar */}

              <div className="dashboard-avatar">

                {getUserAvatar() ? (

                  <img
                    src={getUserAvatar()}
                    alt={getUserName()}
                    className="dashboard-avatar-image"
                    onError={(e) => {
                      e.currentTarget.style.display =
                        "none";
                    }}
                  />

                ) : (

                  getUserName()
                    .charAt(0)
                    .toUpperCase()

                )}

              </div>

              {/* User Information */}

              <div className="dashboard-user-info">

                <span>
                  {getUserName()}
                </span>

                <small
                  className={`dashboard-plan-text ${getPlanClass()}`}
                >
                  {getUserPlan()}
                </small>

              </div>

              <ChevronRight
                size={16}
                className="dashboard-profile-arrow"
              />

            </Link>

          </div>
        </header>

        {/* =========================
            Loading
        ========================= */}

        {loading && (
          <div className="dashboard-loading">

            <div className="loading-spinner" />

            <p>
              {t("dashboard.loading")}
            </p>

          </div>
        )}

        {/* =========================
            Error
        ========================= */}

        {!loading && error && (
          <div className="dashboard-error">

            <p>{error}</p>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
            >
              {t("dashboard.tryAgain")}
            </button>

          </div>
        )}

        {/* =========================
            Dashboard
        ========================= */}

        {!loading &&
          !error &&
          dashboard && (
            <>

              {/* =========================
                  Welcome
              ========================= */}

              <motion.section
                className="dashboard-welcome"
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.6,
                }}
              >

                <div>

                  <span>
                    {t("dashboard.goodToSee")}
                  </span>

                  <h2>
                    {t("dashboard.welcomeBack")}{" "}
                    <strong>
                      {getUserName()}
                    </strong>
                  </h2>

                  <p>
                    {t("dashboard.welcomeDesc")}
                  </p>

                </div>

                <div className="plan-badge">

                  <Sparkles size={14} />

                  <div>

                    <small>
                      {t("dashboard.currentPlan")}
                    </small>

                    <strong>
                      {getUserPlan()}
                    </strong>

                  </div>

                </div>

              </motion.section>

              {/* =========================
                  Stats
              ========================= */}

              <section className="dashboard-stats">

                {stats.map(
                  (stat, index) => {

                    const Icon =
                      stat.icon;

                    return (
                      <motion.div
                        key={stat.title}
                        className="dashboard-stat-card"
                        initial={{
                          opacity: 0,
                          y: 20,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          duration: 0.5,
                          delay:
                            index * 0.08,
                        }}
                      >

                        <div
                          className={`stat-icon ${stat.type}`}
                        >
                          <Icon size={18} />
                        </div>

                        <div className="stat-card-top">

                          <span>
                            {stat.title}
                          </span>

                          <ArrowUpRight
                            size={15}
                          />

                        </div>

                        <strong>
                          {stat.value}
                        </strong>

                      </motion.div>
                    );
                  }
                )}

              </section>

              {/* =========================
                  Spending Trend (6 months)
                  Hidden on fetch failure or empty data.
              ========================= */}

              {!trendFailed && trendData.length > 0 && (
                <motion.div
                  className="dashboard-card trend-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                >
                  <div className="card-heading">
                    <div>
                      <span>{t("dashboard.workspace")}</span>
                      <h3>{t("dashboard.trendTitle")}</h3>
                      <p className="trend-hint">{t("dashboard.trendHint")}</p>
                    </div>
                    <TrendingUp size={19} />
                  </div>
                  <div style={{ width: "100%", height: 260 }} dir="ltr">
                    <ResponsiveContainer width="100%" height={260}>
                      <AreaChart
                        data={trendData}
                        margin={{ top: 5, right: 5, bottom: 0, left: 0 }}
                      >
                        <CartesianGrid
                          stroke="rgba(255,255,255,0.06)"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="label"
                          tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                          width={60}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "#0b0b0b",
                            border: "1px solid rgba(255,255,255,0.12)",
                            borderRadius: 12,
                            color: "#fff",
                          }}
                          labelStyle={{ color: "#fff" }}
                        />
                        <Area
                          type="monotone"
                          dataKey="total"
                          stroke="#8b5cf6"
                          strokeWidth={2}
                          fill="rgba(139,92,246,0.25)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              )}

              {/* =========================
                  Main Grid
              ========================= */}

              <section className="dashboard-grid">

                {/* Financial Overview */}

                <motion.div
                  className="dashboard-card financial-card"
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.6,
                    delay: 0.2,
                  }}
                >

                  <div className="card-heading">

                    <div>

                      <span>
                        {t("dashboard.financialOverview")}
                      </span>

                      <h3>
                        {t("dashboard.whereMoney")}
                      </h3>

                    </div>

                    <Wallet size={19} />

                  </div>

                  <div className="financial-items">

                    <div className="financial-row">

                      <div className="financial-row-label">

                        <div className="mini-icon expense">
                          <ArrowDownRight
                            size={15}
                          />
                        </div>

                        <span>
                          {t("dashboard.totalExpensesRow")}
                        </span>

                      </div>

                      <strong>
                        {formatMoney(
                          dashboard
                            .expenses
                            ?.totalExpenses
                        )}
                      </strong>

                    </div>

                    <div className="financial-row">

                      <div className="financial-row-label">

                        <div className="mini-icon bill">
                          <Receipt size={15} />
                        </div>

                        <span>
                          {t("dashboard.pendingBills")}
                        </span>

                      </div>

                      <strong>
                        {dashboard.bills
                          ?.pendingBills ||
                          0}
                      </strong>

                    </div>

                    <div className="financial-row">

                      <div className="financial-row-label">

                        <div className="mini-icon subscription">
                          <CreditCard
                            size={15}
                          />
                        </div>

                        <span>
                          {t("dashboard.monthlySubs")}
                        </span>

                      </div>

                      <strong>
                        {formatMoney(
                          dashboard
                            .subscriptions
                            ?.monthlySubscriptionsCost
                        )}
                      </strong>

                    </div>

                    <div className="financial-row">

                      <div className="financial-row-label">

                        <div className="mini-icon installment">
                          <CalendarClock
                            size={15}
                          />
                        </div>

                        <span>
                          {t("dashboard.installmentsRemaining")}
                        </span>

                      </div>

                      <strong>
                        {formatMoney(
                          dashboard
                            .installments
                            ?.remainingAmount
                        )}
                      </strong>

                    </div>

                  </div>

                </motion.div>

                {/* Goals */}

                <motion.div
                  className="dashboard-card goals-card"
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.6,
                    delay: 0.3,
                  }}
                >

                  <div className="card-heading">

                    <div>

                      <span>
                        {t("dashboard.savings")}
                      </span>

                      <h3>
                        {t("dashboard.yourGoals")}
                      </h3>

                    </div>

                    <Target size={19} />

                  </div>

                  <div className="goal-progress">

                    <div className="goal-circle">

                      <div>

                        <strong>
                          {dashboard.goals
                            ?.totalGoals
                            ? Math.round(
                                (dashboard
                                  .goals
                                  .completedGoals /
                                  dashboard
                                    .goals
                                    .totalGoals) *
                                  100
                              )
                            : 0}
                          %
                        </strong>

                        <span>
                          {t("dashboard.completed")}
                        </span>

                      </div>

                    </div>

                    <div className="goal-details">

                      <div>

                        <strong>
                          {dashboard.goals
                            ?.completedGoals ||
                            0}
                        </strong>

                        <span>
                          {t("dashboard.completedLabel")}
                        </span>

                      </div>

                      <div>

                        <strong>
                          {dashboard.goals
                            ?.totalGoals ||
                            0}
                        </strong>

                        <span>
                          {t("dashboard.totalGoals")}
                        </span>

                      </div>

                    </div>

                  </div>

                </motion.div>

              </section>

              {/* =========================
                  Bottom Grid
              ========================= */}

              <section className="dashboard-bottom-grid">

                {/* Recent Expenses */}

                <motion.div
                  className="dashboard-card"
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.6,
                    delay: 0.4,
                  }}
                >

                  <div className="card-heading">

                    <div>

                      <span>
                        {t("dashboard.activity")}
                      </span>

                      <h3>
                        {t("dashboard.recentExpenses")}
                      </h3>

                    </div>

                    <Link
                      to="/expenses"
                      className="dashboard-card-link"
                    >
                      <ArrowUpRight
                        size={18}
                      />
                    </Link>

                  </div>

                  <div className="list-container">

                    {recentExpenses.length >
                    0 ? (

                      recentExpenses.map(
                        (expense) => (

                          <div
                            className="dashboard-list-item"
                            key={
                              expense._id
                            }
                          >

                            <div className="list-item-left">

                              <div className="list-icon">

                                <ArrowDownRight
                                  size={15}
                                />

                              </div>

                              <div>

                                <strong>
                                  {expense.title ||
                                    "Expense"}
                                </strong>

                                <span>
                                  {formatDate(
                                    expense.date
                                  )}
                                </span>

                              </div>

                            </div>

                            <strong className="negative-amount">

                              -
                              {formatMoney(
                                expense.amount
                              )}

                            </strong>

                          </div>

                        )
                      )

                    ) : (

                      <div className="empty-state">

                        <Wallet size={22} />

                        <span>
                          {t("dashboard.noExpenses")}
                        </span>

                        <Link to="/expenses">
                          {t("dashboard.addFirst")}
                        </Link>

                      </div>

                    )}

                  </div>

                </motion.div>

                {/* Upcoming Bills */}

                <motion.div
                  className="dashboard-card"
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.6,
                    delay: 0.5,
                  }}
                >

                  <div className="card-heading">

                    <div>

                      <span>
                        {t("dashboard.upcoming")}
                      </span>

                      <h3>
                        {t("dashboard.nextBills")}
                      </h3>

                    </div>

                    <Clock3 size={18} />

                  </div>

                  <div className="list-container">

                    {dashboard.upcomingBills
                      ?.length > 0 ? (

                      dashboard.upcomingBills.map(
                        (bill) => (

                          <div
                            className="dashboard-list-item"
                            key={
                              bill._id
                            }
                          >

                            <div className="list-item-left">

                              <div className="list-icon">

                                <Receipt
                                  size={15}
                                />

                              </div>

                              <div>

                                <strong>
                                  {bill.title ||
                                    bill.name ||
                                    "Bill"}
                                </strong>

                                <span>
                                  {t("dashboard.due")}{" "}
                                  {formatDate(
                                    bill.dueDate
                                  )}
                                </span>

                              </div>

                            </div>

                            <strong>
                              {formatMoney(
                                bill.amount
                              )}
                            </strong>

                          </div>

                        )
                      )

                    ) : (

                      <div className="empty-state">

                        <CheckCircle2
                          size={22}
                        />

                        <span>
                          {t("dashboard.noBills")}
                        </span>

                      </div>

                    )}

                  </div>

                </motion.div>

              </section>

              {/* =========================
                  AI Banner
              ========================= */}

              <motion.section
                className="dashboard-ai-banner"
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.6,
                  delay: 0.6,
                }}
              >

                <div className="ai-icon">

                  <Sparkles size={20} />

                </div>

                <div>

                  <span>
                    {t("dashboard.veloraAi")}
                  </span>

                  <h3>
                    {t("dashboard.aiReady")}
                  </h3>

                  <p>
                    {t("dashboard.aiDesc")}
                  </p>

                </div>

                <Link
                  to="/ai"
                  onClick={() =>
                    setMobileMenu(false)
                  }
                >

                  <ArrowUpRight size={15} />

                  <span>
                    {t("dashboard.exploreInsights")}
                  </span>

                </Link>

              </motion.section>

            </>
          )}

      </section>
    </main>
  );
}

export default Dashboard;