import { useEffect, useState } from "react";
import api from "../../services/api";
import {
  Users,
  CreditCard,
  DollarSign,
  Package,
  TrendingUp,
  UserCheck,
  Clock,
  XCircle,
  RefreshCw,
  ArrowUpRight,
  ShieldCheck,
  LayoutDashboard,
  BarChart3,
  Megaphone,
  Settings,
  LogOut,
  Menu,
  X,
  CalendarDays,
} from "lucide-react";
import "./AdminDashboard.css";
import { useLanguage } from "../../context/LanguageContext";
import { useCurrency } from "../../hooks/useCurrency";
import LanguageToggle from "../../components/LanguageToggle/LanguageToggle";

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const token = localStorage.getItem("token");
  const { t, lang } = useLanguage();
  const { currency } = useCurrency();
  const locale = lang === "ar" ? "ar-EG" : "en-EG";

  const fetchDashboard = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await api.get("/admin/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Admin Dashboard Response:", response.data);

      if (response.data?.success) {
        setDashboard(response.data);
      } else {
        throw new Error(
          response.data?.message || t("admin.somethingWrong")
        );
      }
    } catch (err) {
      console.error("Admin Dashboard Error:", err);

      if (err.response?.status === 401) {
        setError(t("admin.sessionExpired"));
      } else if (err.response?.status === 403) {
        setError(t("admin.noPermission"));
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            t("admin.somethingWrong")
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // =====================================================
  // IMPORTANT:
  // Backend response:
  //
  // {
  //   success: true,
  //   data: {
  //     statistics: {},
  //     usersByPlan: [],
  //     revenueByPlan: [],
  //     recentUsers: [],
  //     recentPayments: []
  //   }
  // }
  // =====================================================

  const dashboardData = dashboard?.data || {};

  const stats = dashboardData.statistics || {};

  const usersByPlan = dashboardData.usersByPlan || [];

  const revenueByPlan = dashboardData.revenueByPlan || [];

  const recentUsers = dashboardData.recentUsers || [];

  const recentPayments = dashboardData.recentPayments || [];

  // =====================================================
  // Helpers
  // =====================================================

  const formatMoney = (amount = 0) => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getInitials = (name = "") => {
    if (!name) return "U";

    return name
      .split(" ")
      .slice(0, 2)
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase();
  };

  const getPlanName = (plan) => {
    if (!plan) return t("admin.free");

    return plan.charAt(0).toUpperCase() + plan.slice(1);
  };

  const getPlanClass = (plan) => {
    switch (plan?.toLowerCase()) {
      case "premium":
        return "premium";
      case "family":
        return "family";
      case "free":
      default:
        return "free";
    }
  };

  const getPaymentStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "paid";

      case "pending":
        return "pending";

      case "failed":
        return "failed";

      default:
        return "pending";
    }
  };

  const getPaymentStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return <UserCheck size={14} />;

      case "pending":
        return <Clock size={14} />;

      case "failed":
        return <XCircle size={14} />;

      default:
        return <Clock size={14} />;
    }
  };

  // =====================================================
  // Loading
  // =====================================================

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <div className="admin-loader"></div>

          <p>{t("admin.loadingDashboard")}</p>
        </div>
      </div>
    );
  }

  // =====================================================
  // Error
  // =====================================================

  if (error && !dashboard) {
    return (
      <div className="admin-page">
        <div className="admin-error">
          <div className="error-icon">
            <XCircle size={30} />
          </div>

          <h2>{t("admin.somethingWrong")}</h2>

          <p>{error}</p>

          <button
            className="retry-btn"
            onClick={() => fetchDashboard()}
          >
            <RefreshCw size={17} />
            {t("admin.tryAgain")}
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // Navigation
  // =====================================================

  const navigateTo = (path) => {
    window.location.href = path;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/login";
  };

  // =====================================================
  // Render
  // =====================================================

  return (
    <div className="admin-page">

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside
        className={`admin-sidebar ${
          sidebarOpen ? "sidebar-open" : ""
        }`}
      >
        <div className="sidebar-logo">
          <img
            src="/logo.png"
            alt="Velora"
            style={{
              height: "42px",
              width: "auto",
              maxWidth: "170px",
              objectFit: "contain",
              filter: "brightness(0) invert(1)",
            }}
          />

          <div>
            <span>{t("sidebar.adminPanel")}</span>
          </div>

          <button
            className="mobile-close"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-section">
          <span className="sidebar-label">{t("admin.sidebarMain")}</span>

          <button className="sidebar-item active">
            <LayoutDashboard size={19} />
            <span>{t("admin.dashboard")}</span>
          </button>

          <button
            className="sidebar-item"
            onClick={() => navigateTo("/admin/users")}
          >
            <Users size={19} />
            <span>{t("admin.users")}</span>
          </button>

          <button
            className="sidebar-item"
            onClick={() => navigateTo("/admin/payments")}
          >
            <CreditCard size={19} />
            <span>{t("admin.payments")}</span>
          </button>

          <button
            className="sidebar-item"
            onClick={() => navigateTo("/admin/plans")}
          >
            <Package size={19} />
            <span>{t("admin.plans")}</span>
          </button>

          <button
            className="sidebar-item"
            onClick={() => navigateTo("/admin/analytics")}
          >
            <BarChart3 size={19} />
            <span>{t("admin.analytics")}</span>
          </button>

          <button
            className="sidebar-item"
            onClick={() => navigateTo("/admin/broadcast")}
          >
            <Megaphone size={19} />
            <span>{t("admin.broadcast")}</span>
          </button>
        </div>

        <div className="sidebar-section">
          <span className="sidebar-label">{t("admin.sidebarSystem")}</span>

          <button className="sidebar-item">
            <Settings size={19} />
            <span>{t("sidebar.settings")}</span>
          </button>
        </div>

        <div className="sidebar-bottom">
          <div className="admin-profile">
            <div className="admin-avatar">
              A
            </div>

            <div className="admin-profile-info">
              <strong>{t("admin.administrator")}</strong>
              <span>{t("admin.superAdmin")}</span>
            </div>
          </div>

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="admin-main">

        {/* TOPBAR */}

        <header className="admin-topbar">
          <div className="topbar-left">

            <button
              className="mobile-menu"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>

            <div>
              <span className="breadcrumb">
                {t("admin.breadcrumbDashboard")}
              </span>

              <h1>{t("admin.dashboard")}</h1>
            </div>
          </div>

          <div className="topbar-right">

            <button
              className="refresh-btn"
              onClick={() => fetchDashboard(true)}
              disabled={refreshing}
            >
              <RefreshCw
                size={17}
                className={refreshing ? "spin" : ""}
              />

              <span>
                {refreshing ? t("admin.refreshing") : t("admin.refresh")}
              </span>
            </button>

            <LanguageToggle variant="dashboard" />

            <div className="admin-status">
              <span className="status-dot"></span>
              {t("admin.systemOnline")}
            </div>
          </div>
        </header>

        {/* CONTENT */}

        <div className="admin-content">

          {/* WELCOME */}

          <section className="admin-welcome">

            <div>
              <span className="welcome-tag">
                <ShieldCheck size={14} />
                {t("admin.adminControlCenter")}
              </span>

              <h2>
                {t("admin.welcomeBack")}{" "}
                <span>{t("admin.administrator")}</span>
              </h2>

              <p>
                {t("admin.monitorDesc")}
              </p>
            </div>

            <div className="welcome-date">
              <CalendarDays size={17} />

              {new Date().toLocaleDateString(locale, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>

          </section>

          {/* =================================================
              MAIN STATISTICS
          ================================================= */}

          <section className="main-stats-grid">

            {/* Users */}

            <div className="stat-card purple">

              <div className="stat-card-top">

                <div className="stat-icon">
                  <Users size={22} />
                </div>

                <div className="stat-trend">
                  <ArrowUpRight size={15} />
                  {t("admin.usersTrend")}
                </div>

              </div>

              <div className="stat-number">
                {stats.totalUsers || 0}
              </div>

              <div className="stat-label">
                {t("admin.totalUsers")}
              </div>

              <div className="stat-footer">
                <UserCheck size={14} />

                {stats.verifiedUsers || 0} {t("admin.verifiedSuffix")}
              </div>

            </div>

            {/* Revenue */}

            <div className="stat-card green">

              <div className="stat-card-top">

                <div className="stat-icon">
                  <DollarSign size={22} />
                </div>

                <div className="stat-trend">
                  <TrendingUp size={15} />
                  {t("admin.revenueTrend")}
                </div>

              </div>

              <div className="stat-number money">
                {formatMoney(stats.totalRevenue)}
              </div>

              <div className="stat-label">
                {t("admin.totalRevenue")}
              </div>

              <div className="stat-footer">
                <TrendingUp size={14} />

                {formatMoney(stats.monthlyRevenue)} {t("admin.thisMonth")}
              </div>

            </div>

            {/* Payments */}

            <div className="stat-card blue">

              <div className="stat-card-top">

                <div className="stat-icon">
                  <CreditCard size={22} />
                </div>

                <div className="stat-trend">
                  <ArrowUpRight size={15} />
                  {t("admin.transactionsTrend")}
                </div>

              </div>

              <div className="stat-number">
                {stats.totalPayments || 0}
              </div>

              <div className="stat-label">
                {t("admin.totalPayments")}
              </div>

              <div className="stat-footer">
                <UserCheck size={14} />

                {stats.paidPayments || 0} {t("admin.successful")}
              </div>

            </div>

            {/* Plans */}

            <div className="stat-card orange">

              <div className="stat-card-top">

                <div className="stat-icon">
                  <Package size={22} />
                </div>

                <div className="stat-trend">
                  <ArrowUpRight size={15} />
                  {t("admin.plansTrend")}
                </div>

              </div>

              <div className="stat-number">
                {stats.totalPlans || 0}
              </div>

              <div className="stat-label">
                {t("admin.totalPlans")}
              </div>

              <div className="stat-footer">
                <Package size={14} />

                {stats.activePlans || 0} {t("admin.activePlans")}
              </div>

            </div>

          </section>

          {/* =================================================
              MINI STATISTICS
          ================================================= */}

          <section className="mini-stats-grid">

            <div className="mini-stat">
              <div className="mini-icon verified">
                <UserCheck size={18} />
              </div>

              <div>
                <strong>
                  {stats.verifiedUsers || 0}
                </strong>

                <span>{t("admin.verifiedUsers")}</span>
              </div>
            </div>

            <div className="mini-stat">
              <div className="mini-icon pending">
                <Clock size={18} />
              </div>

              <div>
                <strong>
                  {stats.pendingPayments || 0}
                </strong>

                <span>{t("admin.pendingPayments")}</span>
              </div>
            </div>

            <div className="mini-stat">
              <div className="mini-icon failed">
                <XCircle size={18} />
              </div>

              <div>
                <strong>
                  {stats.failedPayments || 0}
                </strong>

                <span>{t("admin.failedPayments")}</span>
              </div>
            </div>

            <div className="mini-stat">
              <div className="mini-icon revenue">
                <DollarSign size={18} />
              </div>

              <div>
                <strong>
                  {formatMoney(stats.monthlyRevenue)}
                </strong>

                <span>{t("admin.monthlyRevenue")}</span>
              </div>
            </div>

          </section>

          {/* =================================================
              ANALYTICS ROW
          ================================================= */}

          <section className="analytics-grid">

            {/* USERS BY PLAN */}

            <div className="admin-card">

              <div className="card-header">

                <div>
                  <span className="card-eyebrow">
                    {t("admin.usersEyebrow")}
                  </span>

                  <h3>{t("admin.usersByPlan")}</h3>
                </div>

                <button
                  className="view-all-btn"
                  onClick={() =>
                    navigateTo("/admin/users")
                  }
                >
                  {t("admin.viewAll")}
                  <ArrowUpRight size={15} />
                </button>

              </div>

              <div className="plan-chart">

                {usersByPlan.length === 0 ? (
                  <div className="empty-state">
                    {t("admin.noUsersData")}
                  </div>
                ) : (
                  usersByPlan.map((item, index) => {

                    const totalUsers =
                      stats.totalUsers || 1;

                    const percentage = Math.round(
                      (item.count / totalUsers) * 100
                    );

                    return (
                      <div
                        className="plan-row"
                        key={`${item._id}-${index}`}
                      >

                        <div className="plan-info">

                          <div
                            className={`plan-dot ${getPlanClass(
                              item._id
                            )}`}
                          />

                          <span>
                            {getPlanName(item._id)}
                          </span>

                          <strong>
                            {item.count}
                          </strong>

                        </div>

                        <div className="progress-container">

                          <div
                            className={`progress-bar ${getPlanClass(
                              item._id
                            )}`}
                            style={{
                              width: `${Math.min(
                                percentage,
                                100
                              )}%`,
                            }}
                          />

                        </div>

                        <span className="percentage">
                          {percentage}%
                        </span>

                      </div>
                    );
                  })
                )}

              </div>

            </div>

            {/* REVENUE BY PLAN */}

            <div className="admin-card">

              <div className="card-header">

                <div>
                  <span className="card-eyebrow">
                    {t("admin.revenueEyebrow")}
                  </span>

                  <h3>{t("admin.revenueByPlan")}</h3>
                </div>

                <button
                  className="view-all-btn"
                  onClick={() =>
                    navigateTo("/admin/analytics")
                  }
                >
                  {t("admin.analytics")}
                  <ArrowUpRight size={15} />
                </button>

              </div>

              <div className="revenue-list">

                {revenueByPlan.length === 0 ? (
                  <div className="empty-state">
                    {t("admin.noRevenueData")}
                  </div>
                ) : (
                  revenueByPlan.map((item, index) => {

                    const totalRevenue =
                      stats.totalRevenue || 1;

                    const percentage = Math.round(
                      (item.revenue / totalRevenue) * 100
                    );

                    return (
                      <div
                        className="revenue-row"
                        key={`${item._id}-${index}`}
                      >

                        <div className="revenue-plan">

                          <div
                            className={`revenue-icon ${getPlanClass(
                              item._id
                            )}`}
                          >
                            <Package size={16} />
                          </div>

                          <div>
                            <strong>
                              {getPlanName(item._id)}
                            </strong>

                            <span>
                              {percentage}% {t("admin.ofRevenue")}
                            </span>
                          </div>

                        </div>

                        <strong className="revenue-value">
                          {formatMoney(item.revenue)}
                        </strong>

                      </div>
                    );
                  })
                )}

              </div>

            </div>

          </section>

          {/* =================================================
              RECENT USERS
          ================================================= */}

          <section className="admin-card table-card">

            <div className="card-header">

              <div>
                <span className="card-eyebrow">
                  {t("admin.usersEyebrow")}
                </span>

                <h3>{t("admin.recentUsers")}</h3>
              </div>

              <button
                className="view-all-btn"
                onClick={() =>
                  navigateTo("/admin/users")
                }
              >
                {t("admin.viewAllUsers")}
                <ArrowUpRight size={15} />
              </button>

            </div>

            <div className="table-wrapper">

              <table className="admin-table">

                <thead>
                  <tr>
                    <th>{t("admin.user")}</th>
                    <th>{t("admin.email")}</th>
                    <th>{t("admin.plan")}</th>
                    <th>{t("admin.joined")}</th>
                  </tr>
                </thead>

                <tbody>

                  {recentUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="table-empty"
                      >
                        {t("admin.noUsers")}
                      </td>
                    </tr>
                  ) : (
                    recentUsers.map((user) => (
                      <tr key={user._id}>

                        <td>
                          <div className="table-user">

                            <div className="user-avatar">
                              {getInitials(user.name)}
                            </div>

                            <strong>
                              {user.name || t("admin.unknownUser")}
                            </strong>

                          </div>
                        </td>

                        <td>
                          <span className="email-text">
                            {user.email}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`plan-badge ${getPlanClass(
                              user.plan
                            )}`}
                          >
                            {getPlanName(user.plan)}
                          </span>
                        </td>

                        <td>
                          <span className="date-text">
                            {formatDate(user.createdAt)}
                          </span>
                        </td>

                      </tr>
                    ))
                  )}

                </tbody>

              </table>

            </div>

          </section>

          {/* =================================================
              RECENT PAYMENTS
          ================================================= */}

          <section className="admin-card table-card">

            <div className="card-header">

              <div>
                <span className="card-eyebrow">
                  {t("admin.paymentsEyebrow")}
                </span>

                <h3>{t("admin.recentPayments")}</h3>
              </div>

              <button
                className="view-all-btn"
                onClick={() =>
                  navigateTo("/admin/payments")
                }
              >
                {t("admin.viewAllPayments")}
                <ArrowUpRight size={15} />
              </button>

            </div>

            <div className="table-wrapper">

              <table className="admin-table">

                <thead>
                  <tr>
                    <th>{t("admin.user")}</th>
                    <th>{t("admin.plan")}</th>
                    <th>{t("admin.amount")}</th>
                    <th>{t("admin.status")}</th>
                    <th>{t("admin.date")}</th>
                  </tr>
                </thead>

                <tbody>

                  {recentPayments.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="table-empty"
                      >
                        {t("admin.noPayments")}
                      </td>
                    </tr>
                  ) : (
                    recentPayments.map((payment) => {

                      const user =
                        payment.user || {};

                      const plan =
                        payment.plan || {};

                      return (
                        <tr key={payment._id}>

                          <td>
                            <div className="table-user">

                              <div className="user-avatar">
                                {getInitials(user.name)}
                              </div>

                              <div>
                                <strong>
                                  {user.name ||
                                    "Unknown User"}
                                </strong>

                                <span className="table-email">
                                  {user.email || ""}
                                </span>
                              </div>

                            </div>
                          </td>

                          <td>
                            <span
                              className={`plan-badge ${getPlanClass(
                                plan.name
                              )}`}
                            >
                              {getPlanName(plan.name)}
                            </span>
                          </td>

                          <td>
                            <strong className="amount-text">
                              {formatMoney(payment.amount)}
                            </strong>
                          </td>

                          <td>
                            <span
                              className={`payment-status ${getPaymentStatusClass(
                                payment.status
                              )}`}
                            >
                              {getPaymentStatusIcon(
                                payment.status
                              )}

                              {payment.status || t("admin.pending")}
                            </span>
                          </td>

                          <td>
                            <span className="date-text">
                              {formatDate(
                                payment.createdAt
                              )}
                            </span>
                          </td>

                        </tr>
                      );
                    })
                  )}

                </tbody>

              </table>

            </div>

          </section>

          {/* FOOTER */}

          <footer className="admin-footer">

            <div>
              © {new Date().getFullYear()} Velora.
              {t("admin.allRights")}
            </div>

            <div className="footer-status">
              <span className="status-dot"></span>
              {t("admin.operational")}
            </div>

          </footer>

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;