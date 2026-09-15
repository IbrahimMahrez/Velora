import { useEffect, useMemo, useState } from "react";
import {
  Wallet,
  LayoutDashboard,
  Users,
  CreditCard,
  Package,
  BarChart3,
  Megaphone,
  Settings,
  LogOut,
  Menu,
  X,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  CalendarDays,
  ArrowUpRight,
} from "lucide-react";

import "./AdminAnalytics.css";
import { useLanguage } from "../../context/LanguageContext";
import { useCurrency } from "../../hooks/useCurrency";
import LanguageToggle from "../../components/LanguageToggle/LanguageToggle";
import api from "../../services/api";

const AdminAnalytics = () => {
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { t, lang } = useLanguage();
  const { currency } = useCurrency();
  const locale = lang === "ar" ? "ar-EG" : "en-EG";

  const fetchAnalytics = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/admin/revenue");

      const result = response.data;

      setRevenueData(result?.data?.revenueByMonth || []);
    } catch (err) {
      console.error("Analytics Error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          t("admin.somethingWrong")
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const navigate = (path) => {
    window.location.href = path;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/login";
  };

  const formatMonth = (month, year) => {
    const date = new Date(year, month - 1);

    return date.toLocaleDateString(locale, {
      month: "short",
      year: "numeric",
    });
  };

  const formatShortMonth = (month, year) => {
    const date = new Date(year, month - 1);

    return date.toLocaleDateString(locale, {
      month: "short",
    });
  };

  const formatMoney = (value) => {
    return `${Number(value || 0).toLocaleString(locale)} ${currency}`;
  };

  const analytics = useMemo(() => {
    if (!revenueData.length) {
      return {
        totalRevenue: 0,
        totalPayments: 0,
        averagePayment: 0,
        bestMonth: null,
        growth: 0,
      };
    }

    const totalRevenue = revenueData.reduce(
      (sum, item) => sum + Number(item.revenue || 0),
      0
    );

    const totalPayments = revenueData.reduce(
      (sum, item) => sum + Number(item.payments || 0),
      0
    );

    const averagePayment =
      totalPayments > 0 ? totalRevenue / totalPayments : 0;

    const bestMonth = revenueData.reduce((best, item) => {
      if (!best || Number(item.revenue || 0) > Number(best.revenue || 0)) {
        return item;
      }

      return best;
    }, null);

    let growth = 0;

    if (revenueData.length >= 2) {
      const current =
        Number(revenueData[revenueData.length - 1]?.revenue) || 0;

      const previous =
        Number(revenueData[revenueData.length - 2]?.revenue) || 0;

      if (previous > 0) {
        growth = ((current - previous) / previous) * 100;
      }
    }

    return {
      totalRevenue,
      totalPayments,
      averagePayment,
      bestMonth,
      growth,
    };
  }, [revenueData]);

  const maxRevenue = Math.max(
    ...revenueData.map((item) => Number(item.revenue || 0)),
    1
  );

  return (
    <div className="admin-analytics-page">
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
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

          <button
            className="sidebar-item"
            onClick={() => navigate("/admin")}
          >
            <LayoutDashboard size={19} />
            <span>{t("admin.dashboard")}</span>
          </button>

          <button
            className="sidebar-item"
            onClick={() => navigate("/admin/users")}
          >
            <Users size={19} />
            <span>{t("admin.users")}</span>
          </button>

          <button
            className="sidebar-item"
            onClick={() => navigate("/admin/payments")}
          >
            <CreditCard size={19} />
            <span>{t("admin.payments")}</span>
          </button>

          <button
            className="sidebar-item"
            onClick={() => navigate("/admin/plans")}
          >
            <Package size={19} />
            <span>{t("admin.plans")}</span>
          </button>

          <button className="sidebar-item active">
            <BarChart3 size={19} />
            <span>{t("admin.analytics")}</span>
          </button>

          <button
            className="sidebar-item"
            onClick={() => navigate("/admin/broadcast")}
          >
            <Megaphone size={19} />
            <span>{t("admin.broadcast")}</span>
          </button>
        </div>

        <div className="sidebar-bottom">
          <button
            className="sidebar-item"
            onClick={() => navigate("/admin/settings")}
          >
            <Settings size={19} />
            <span>{t("sidebar.settings")}</span>
          </button>

          <div className="admin-profile">
            <div className="admin-avatar">A</div>

            <div className="admin-profile-info">
              <strong>{t("admin.administrator")}</strong>
              <span>{t("admin.superAdmin")}</span>
            </div>

            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="admin-main">
        <header className="admin-topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>

            <div className="breadcrumb">
              <span>{t("admin.adminCrumb")}</span>
              <span>/</span>
              <strong>{t("admin.analytics")}</strong>
            </div>
          </div>

          <div className="topbar-right">
            <button
              className={`refresh-btn ${
                refreshing ? "spinning" : ""
              }`}
              onClick={() => fetchAnalytics(true)}
              disabled={refreshing}
              title={t("admin.refresh")}
            >
              <RefreshCw size={18} />
            </button>

            <LanguageToggle variant="dashboard" />
            <div className="admin-status">
              <span className="status-dot"></span>
              {t("admin.systemOnline")}
            </div>
          </div>
        </header>

        <div className="admin-content">
          {/* HEADER */}
          <section className="analytics-header">
            <div>
              <span className="page-eyebrow">
                <BarChart3 size={14} />
                {t("admin.businessInsights")}
              </span>

              <h1>{t("admin.analytics")}</h1>

              <p>
                {t("admin.trackDesc")}
              </p>
            </div>
          </section>

          {/* ERROR */}
          {error && (
            <div className="analytics-error">
              <span>{error}</span>

              <button onClick={() => fetchAnalytics(true)}>
                {t("admin.tryAgain")}
              </button>
            </div>
          )}

          {loading ? (
            <div className="analytics-loading">
              <div className="admin-loader"></div>
              <span>{t("admin.loadingAnalytics")}</span>
            </div>
          ) : (
            <>
              {/* STATISTICS */}
              <section className="analytics-stats">
                <div className="analytics-stat purple">
                  <div className="analytics-stat-top">
                    <div className="analytics-stat-icon">
                      <DollarSign size={20} />
                    </div>

                    <span className="stat-period">
                      {t("admin.allTime")}
                    </span>
                  </div>

                  <strong>
                    {formatMoney(analytics.totalRevenue)}
                  </strong>

                  <span>{t("admin.totalRevenue")}</span>
                </div>

                <div className="analytics-stat blue">
                  <div className="analytics-stat-top">
                    <div className="analytics-stat-icon">
                      <Receipt size={20} />
                    </div>

                    <span className="stat-period">
                      {t("admin.totalLabel")}
                    </span>
                  </div>

                  <strong>
                    {analytics.totalPayments.toLocaleString()}
                  </strong>

                  <span>{t("admin.totalPayments")}</span>
                </div>

                <div className="analytics-stat green">
                  <div className="analytics-stat-top">
                    <div className="analytics-stat-icon">
                      <Wallet size={20} />
                    </div>

                    <span className="stat-period">
                      {t("admin.average")}
                    </span>
                  </div>

                  <strong>
                    {formatMoney(analytics.averagePayment)}
                  </strong>

                  <span>{t("admin.averagePayment")}</span>
                </div>

                <div className="analytics-stat orange">
                  <div className="analytics-stat-top">
                    <div className="analytics-stat-icon">
                      {analytics.growth >= 0 ? (
                        <TrendingUp size={20} />
                      ) : (
                        <TrendingDown size={20} />
                      )}
                    </div>

                    <span className="stat-period">
                      {t("admin.vsLastMonth")}
                    </span>
                  </div>

                  <strong>
                    {analytics.growth >= 0 ? "+" : ""}
                    {analytics.growth.toFixed(1)}%
                  </strong>

                  <span>{t("admin.revenueGrowth")}</span>
                </div>
              </section>

              {/* CHART */}
              <section className="analytics-card revenue-chart-card">
                <div className="analytics-card-header">
                  <div>
                    <span className="card-eyebrow">
                      {t("admin.revenuePerformance")}
                    </span>

                    <h2>{t("admin.revenueOverTime")}</h2>

                    <p>
                      {t("admin.monthlyRevenueDesc")}
                    </p>
                  </div>

                  <div className="chart-total">
                    <span>{t("admin.totalLabel2")}</span>
                    <strong>
                      {formatMoney(analytics.totalRevenue)}
                    </strong>
                  </div>
                </div>

                {revenueData.length === 0 ? (
                  <div className="analytics-empty">
                    <BarChart3 size={28} />
                    <h3>{t("admin.noRevenueYet")}</h3>
                    <p>
                      {t("admin.revenueAppearDesc")}
                    </p>
                  </div>
                ) : (
                  <div className="revenue-chart">
                    <div className="chart-y-axis">
                      <span>{formatMoney(maxRevenue)}</span>
                      <span>{formatMoney(maxRevenue * 0.75)}</span>
                      <span>{formatMoney(maxRevenue * 0.5)}</span>
                      <span>{formatMoney(maxRevenue * 0.25)}</span>
                      <span>0 {currency}</span>
                    </div>

                    <div className="chart-area">
                      <div className="chart-grid">
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>

                      <div className="chart-bars">
                        {revenueData.map((item, index) => {
                          const revenue = Number(item.revenue || 0);

                          const height =
                            revenue > 0
                              ? Math.max(
                                  (revenue / maxRevenue) * 100,
                                  4
                                )
                              : 3;

                          return (
                            <div
                              className="chart-column"
                              key={`${item._id?.year}-${item._id?.month}-${index}`}
                            >
                              <div className="bar-value">
                                {formatMoney(revenue)}
                              </div>

                              <div className="bar-wrapper">
                                <div
                                  className="revenue-bar"
                                  style={{
                                    height: `${height}%`,
                                  }}
                                >
                                  <div className="bar-glow"></div>
                                </div>
                              </div>

                              <span className="bar-label">
                                {formatShortMonth(
                                  item._id?.month,
                                  item._id?.year
                                )}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* LOWER GRID */}
              <div className="analytics-lower-grid">
                {/* MONTHLY PERFORMANCE */}
                <section className="analytics-card">
                  <div className="analytics-card-header compact">
                    <div>
                      <span className="card-eyebrow">
                        {t("admin.monthlyBreakdown")}
                      </span>

                      <h2>{t("admin.paymentPerformance")}</h2>
                    </div>
                  </div>

                  <div className="monthly-list">
                    {revenueData.length === 0 ? (
                      <div className="small-empty">
                        {t("admin.noPaymentData")}
                      </div>
                    ) : (
                      [...revenueData]
                        .reverse()
                        .map((item, index) => {
                          const revenue = Number(item.revenue || 0);
                          const payments = Number(item.payments || 0);

                          return (
                            <div
                              className="monthly-row"
                              key={`${item._id?.year}-${item._id?.month}-${index}`}
                            >
                              <div className="month-icon">
                                <CalendarDays size={16} />
                              </div>

                              <div className="month-info">
                                <strong>
                                  {formatMonth(
                                    item._id?.month,
                                    item._id?.year
                                  )}
                                </strong>

                                <span>
                                  {payments}{" "}
                                  {payments === 1
                                    ? t("admin.paymentSingular") : t("admin.paymentsPlural")}
                                </span>
                              </div>

                              <div className="month-revenue">
                                <strong>
                                  {formatMoney(revenue)}
                                </strong>

                                <span>
                                  {analytics.totalRevenue > 0
                                    ? `${(
                                        (revenue /
                                          analytics.totalRevenue) *
                                        100
                                      ).toFixed(1)}%`
                                    : "0%"}
                                </span>
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                </section>

                {/* BEST MONTH */}
                <section className="analytics-card highlight-card">
                  <div className="highlight-icon">
                    <TrendingUp size={23} />
                  </div>

                  <span className="card-eyebrow">
                    {t("admin.topMonth")}
                  </span>

                  {analytics.bestMonth ? (
                    <>
                      <h2>
                        {formatMonth(
                          analytics.bestMonth._id?.month,
                          analytics.bestMonth._id?.year
                        )}
                      </h2>

                      <strong className="best-revenue">
                        {formatMoney(analytics.bestMonth.revenue)}
                      </strong>

                      <p>
                        Highest monthly revenue recorded in the
                        {t("admin.highestRevenueDesc")}
                      </p>

                      <div className="highlight-stat">
                        <Receipt size={17} />

                        <div>
                          <strong>
                            {analytics.bestMonth.payments || 0}
                          </strong>

                          <span>{t("admin.paymentsPlural")}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <h2>{t("admin.noDataYet")}</h2>

                      <p>
                        Your best performing month will appear
                        here after {t("admin.revenueAppearDesc")}
                      </p>
                    </>
                  )}

                  <div className="highlight-footer">
                    <span>{t("admin.revenueInsights")}</span>
                    <ArrowUpRight size={16} />
                  </div>
                </section>
              </div>
            </>
          )}

          <footer className="admin-footer">
            <span>© 2026 Velora Admin</span>

            <div className="footer-status">
              <span className="status-dot"></span>
              {t("admin.operationalShort")}
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default AdminAnalytics;