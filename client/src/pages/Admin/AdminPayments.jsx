import { useEffect, useState } from "react";
import {
  CreditCard,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Users,
  Package,
  BarChart3,
  Megaphone,
  Settings,
  LogOut,
  Menu,
  X,
  CheckCircle2,
  Clock3,
  XCircle,
  CalendarDays,
  Receipt,
} from "lucide-react";

import "./AdminPayments.css";
import { useLanguage } from "../../context/LanguageContext";
import { useCurrency } from "../../hooks/useCurrency";
import LanguageToggle from "../../components/LanguageToggle/LanguageToggle";
import api from "../../services/api";

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 10,
    totalPayments: 0,
    totalPages: 1,
  });

  const [status, setStatus] = useState("");
  const [billingCycle, setBillingCycle] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { t, lang } = useLanguage();
  const { currency } = useCurrency();
  const locale = lang === "ar" ? "ar-EG" : "en-EG";

  const fetchPayments = async (page = 1, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const params = new URLSearchParams();

      if (status) params.append("status", status);
      if (billingCycle) params.append("billingCycle", billingCycle);

      params.append("page", page);
      params.append("limit", "10");

      const response = await api.get(
        `/admin/payments?${params.toString()}`
      );

      const result = response.data;

      setPayments(result?.data?.payments || []);

      setPagination(
        result?.data?.pagination || {
          currentPage: 1,
          perPage: 10,
          totalPayments: 0,
          totalPages: 1,
        }
      );
    } catch (err) {
      console.error("Payments Error:", err);
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
    fetchPayments(1);
  }, [status, billingCycle]);

  const handleRefresh = () => {
    fetchPayments(pagination.currentPage, true);
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchPayments(page);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/login";
  };

  const navigate = (path) => {
    window.location.href = path;
  };

  const getStatusIcon = (paymentStatus) => {
    switch (paymentStatus) {
      case "paid":
        return <CheckCircle2 size={15} />;
      case "pending":
        return <Clock3 size={15} />;
      case "failed":
        return <XCircle size={15} />;
      default:
        return null;
    }
  };

  const getStatusLabel = (paymentStatus) => {
    switch (paymentStatus) {
      case "paid":
        return t("admin.paid");
      case "pending":
        return t("admin.pending");
      case "failed":
        return t("admin.failed");
      default:
        return paymentStatus || "Unknown";
    }
  };

  const formatAmount = (amount) => {
    return `${Number(amount || 0).toLocaleString(locale)} ${currency}`;
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(locale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getUserInitial = (name, email) => {
    if (name) return name.charAt(0).toUpperCase();
    if (email) return email.charAt(0).toUpperCase();

    return "U";
  };

  return (
    <div className="admin-payments-page">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
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

          <button className="sidebar-item active">
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

          <button
            className="sidebar-item"
            onClick={() => navigate("/admin/analytics")}
          >
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

      {/* Main */}
      <main className="admin-main">
        {/* Topbar */}
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
              <strong>{t("admin.payments")}</strong>
            </div>
          </div>

          <div className="topbar-right">
            <button
              className={`refresh-btn ${refreshing ? "spinning" : ""}`}
              onClick={handleRefresh}
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
          {/* Page Header */}
          <section className="payments-header">
            <div>
              <span className="page-eyebrow">
                <Receipt size={14} />
                {t("admin.transactions")}
              </span>

              <h1>{t("admin.payments")}</h1>

              <p>
                {t("admin.managePaymentsDesc")}
              </p>
            </div>

            <div className="payments-total">
              <span>{t("admin.totalPayments")}</span>
              <strong>{pagination.totalPayments || 0}</strong>
            </div>
          </section>

          {/* Filters */}
          <section className="payments-filters">
            <div className="filter-group">
              <label>{t("admin.status")}</label>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">{t("admin.allStatuses")}</option>
                <option value="paid">{t("admin.paid")}</option>
                <option value="pending">{t("admin.pending")}</option>
                <option value="failed">{t("admin.failed")}</option>
              </select>
            </div>

            <div className="filter-group">
              <label>{t("admin.billingCycle")}</label>

              <select
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value)}
              >
                <option value="">{t("admin.allCycles")}</option>
                <option value="monthly">{t("admin.monthly")}</option>
                <option value="yearly">{t("admin.yearly")}</option>
              </select>
            </div>

            <button
              className="clear-filters"
              onClick={() => {
                setStatus("");
                setBillingCycle("");
              }}
            >
              {t("admin.clearFilters")}
            </button>
          </section>

          {/* Content */}
          {loading ? (
            <div className="payments-loading">
              <div className="admin-loader"></div>
              <span>{t("admin.loadingPayments")}</span>
            </div>
          ) : error ? (
            <div className="payments-error">
              <div className="error-icon">
                <XCircle size={25} />
              </div>

              <div>
                <h3>{t("admin.unableToLoadPayments")}</h3>
                <p>{error}</p>
              </div>

              <button onClick={() => fetchPayments(1)}>
                {t("admin.tryAgain")}
              </button>
            </div>
          ) : (
            <>
              {/* Table */}
              <section className="payments-table-card">
                <div className="payments-table-wrapper">
                  <table className="payments-table">
                    <thead>
                      <tr>
                        <th>{t("admin.user")}</th>
                        <th>{t("admin.plan")}</th>
                        <th>{t("admin.amount")}</th>
                        <th>{t("admin.billing")}</th>
                        <th>{t("admin.status")}</th>
                        <th>{t("admin.date")}</th>
                      </tr>
                    </thead>

                    <tbody>
                      {payments.length === 0 ? (
                        <tr>
                          <td colSpan="6">
                            <div className="payments-empty">
                              <div className="empty-icon">
                                <CreditCard size={25} />
                              </div>

                              <h3>{t("admin.noPayments")}</h3>

                              <p>
                                {t("admin.noPaymentsFilter")}
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        payments.map((payment) => (
                          <tr key={payment._id}>
                            {/* User */}
                            <td>
                              <div className="payment-user">
                                <div className="payment-avatar">
                                  {getUserInitial(
                                    payment.user?.name,
                                    payment.user?.email
                                  )}
                                </div>

                                <div className="payment-user-info">
                                  <strong>
                                    {payment.user?.name || t("admin.unknownUser")}
                                  </strong>

                                  <span>
                                    {payment.user?.email || t("admin.noEmail")}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Plan */}
                            <td>
                              <span className="payment-plan">
                                {payment.plan?.name || t("admin.unknownPlan")}
                              </span>
                            </td>

                            {/* Amount */}
                            <td>
                              <strong className="payment-amount">
                                {formatAmount(payment.amount)}
                              </strong>
                            </td>

                            {/* Billing */}
                            <td>
                              <div className="billing-cycle">
                                <CalendarDays size={15} />
                                <span>
                                  {payment.billingCycle
                                    ? payment.billingCycle
                                        .charAt(0)
                                        .toUpperCase() +
                                      payment.billingCycle.slice(1)
                                    : "—"}
                                </span>
                              </div>
                            </td>

                            {/* Status */}
                            <td>
                              <span
                                className={`payment-status ${payment.status}`}
                              >
                                {getStatusIcon(payment.status)}
                                {getStatusLabel(payment.status)}
                              </span>
                            </td>

                            {/* Date */}
                            <td>
                              <div className="payment-date">
                                <strong>
                                  {formatDate(payment.createdAt)}
                                </strong>

                                <span>
                                  {formatTime(payment.createdAt)}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="payments-pagination">
                  <span>
                    {t("admin.page")} {pagination.currentPage} {t("admin.of")}{" "}
                    {pagination.totalPages}
                  </span>

                  <div className="pagination-buttons">
                    <button
                      disabled={pagination.currentPage === 1}
                      onClick={() =>
                        handlePageChange(pagination.currentPage - 1)
                      }
                    >
                      <ChevronLeft size={18} />
                    </button>

                    {Array.from(
                      { length: pagination.totalPages },
                      (_, index) => index + 1
                    )
                      .filter((page) => {
                        if (pagination.totalPages <= 5) return true;

                        if (page === 1) return true;
                        if (page === pagination.totalPages) return true;

                        return (
                          page >= pagination.currentPage - 1 &&
                          page <= pagination.currentPage + 1
                        );
                      })
                      .map((page) => (
                        <button
                          key={page}
                          className={
                            page === pagination.currentPage
                              ? "active"
                              : ""
                          }
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      ))}

                    <button
                      disabled={
                        pagination.currentPage === pagination.totalPages
                      }
                      onClick={() =>
                        handlePageChange(pagination.currentPage + 1)
                      }
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Footer */}
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

export default AdminPayments;