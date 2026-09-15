import { useEffect, useState } from "react";
import api from "../../services/api";
import {
  Users,
  CreditCard,
  Package,
  BarChart3,
  Megaphone,
  Settings,
  LogOut,
  Menu,
  X,
  ArrowLeft,
  User,
  Mail,
  ShieldCheck,
  ShieldX,
  DollarSign,
  Receipt,
  Trash2,
  CalendarDays,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";

import "./AdminUserDetails.css";
import { useLanguage } from "../../context/LanguageContext";
import { useCurrency } from "../../hooks/useCurrency";
import LanguageToggle from "../../components/LanguageToggle/LanguageToggle";

const AdminUserDetails = () => {
  const userId = window.location.pathname.split("/").pop();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const token = localStorage.getItem("token");
  const { t, lang } = useLanguage();
  const { currency } = useCurrency();
  const locale = lang === "ar" ? "ar-EG" : "en-EG";

  // ============================================
  // FETCH USER
  // ============================================

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await api.get(
        `/admin/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.success) {
        setData(response.data.data);
      } else {
        throw new Error(
          response.data?.message ||
            t("admin.somethingWrong")
        );
      }
    } catch (err) {
      console.error("User Details Error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          t("admin.somethingWrong")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  // ============================================
  // NAVIGATION
  // ============================================

  const navigateTo = (path) => {
    window.location.href = path;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  // ============================================
  // DELETE USER
  // ============================================

  const handleDelete = async () => {
    if (!data?.user) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${data.user.name}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await api.delete(`/admin/users/${userId}`);

      navigateTo("/admin/users");
    } catch (err) {
      alert(
        err.response?.data?.message ||
          t("admin.somethingWrong")
      );
    }
  };

  // ============================================
  // HELPERS
  // ============================================

  const getInitials = (name = "") => {
    if (!name) return "U";

    return name
      .split(" ")
      .slice(0, 2)
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase();
  };

  const getPlanClass = (plan) => {
    switch (plan?.toLowerCase()) {
      case "premium":
        return "premium";

      case "family":
        return "family";

      default:
        return "free";
    }
  };

  const getPlanName = (plan) => {
    if (!plan) return t("admin.free");

    return (
      plan.charAt(0).toUpperCase() +
      plan.slice(1)
    );
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "paid";

      case "failed":
        return "failed";

      default:
        return t("admin.pending");
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return <CheckCircle2 size={14} />;

      case "failed":
        return <XCircle size={14} />;

      default:
        return <Clock size={14} />;
    }
  };

  const formatMoney = (amount = 0) => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return t("admin.unknownPlan");

    return new Date(date).toLocaleDateString(
      locale,
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return (
      <div className="user-details-page">
        <div className="user-details-loading">
          <div className="user-details-loader"></div>
          <p>{t("admin.loadingUserDetails")}</p>
        </div>
      </div>
    );
  }

  // ============================================
  // ERROR
  // ============================================

  if (error || !data?.user) {
    return (
      <div className="user-details-page">
        <div className="user-details-error">
          <div className="details-error-icon">
            <XCircle size={30} />
          </div>

          <h2>{t("admin.unableToLoadUser")}</h2>

          <p>
            {error || t("admin.userNotFound")}
          </p>

          <button
            className="back-btn"
            onClick={() =>
              navigateTo("/admin/users")
            }
          >
            <ArrowLeft size={17} />
            {t("admin.backToUsers")}
          </button>
        </div>
      </div>
    );
  }

  const user = data.user;
  const currentPlan = data.currentPlan;
  const payments = data.payments || [];
  const statistics = data.statistics || {};

  return (
    <div className="user-details-page">

      {/* MOBILE OVERLAY */}

      {sidebarOpen && (
        <div
          className="users-sidebar-overlay"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      {/* ========================================
          SIDEBAR
      ======================================== */}

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
            onClick={() =>
              setSidebarOpen(false)
            }
          >
            <X size={20} />
          </button>

        </div>

        <div className="sidebar-section">

          <span className="sidebar-label">{t("admin.sidebarMain")}</span>

          <button
            className="sidebar-item"
            onClick={() =>
              navigateTo("/admin")
            }
          >
            <BarChart3 size={19} />
            <span>{t("admin.dashboard")}</span>
          </button>

          <button
            className="sidebar-item active"
            onClick={() =>
              navigateTo("/admin/users")
            }
          >
            <Users size={19} />
            <span>{t("admin.users")}</span>
          </button>

          <button
            className="sidebar-item"
            onClick={() =>
              navigateTo("/admin/payments")
            }
          >
            <CreditCard size={19} />
            <span>{t("admin.payments")}</span>
          </button>

          <button
            className="sidebar-item"
            onClick={() =>
              navigateTo("/admin/plans")
            }
          >
            <Package size={19} />
            <span>{t("admin.plans")}</span>
          </button>

          <button
            className="sidebar-item"
            onClick={() =>
              navigateTo("/admin/analytics")
            }
          >
            <BarChart3 size={19} />
            <span>{t("admin.analytics")}</span>
          </button>

          <button
            className="sidebar-item"
            onClick={() =>
              navigateTo("/admin/broadcast")
            }
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

      {/* ========================================
          MAIN
      ======================================== */}

      <main className="admin-main">

        {/* TOPBAR */}

        <header className="admin-topbar">

          <div className="topbar-left">

            <button
              className="mobile-menu"
              onClick={() =>
                setSidebarOpen(true)
              }
            >
              <Menu size={22} />
            </button>

            <div>
              <span className="breadcrumb">
                {t("admin.breadcrumbUserDetails")}
              </span>

              <h1>{t("admin.userDetails")}</h1>
            </div>

          </div>

          <div className="topbar-right">
            <LanguageToggle variant="dashboard" />

            <button
              className="back-btn"
              onClick={() =>
                navigateTo("/admin/users")
              }
            >
              <ArrowLeft size={16} />
              {t("admin.backToUsers")}
            </button>

          </div>

        </header>

        {/* CONTENT */}

        <div className="user-details-content">

          {/* USER HERO */}

          <section className="user-profile-card">

            <div className="profile-main">

              <div className="profile-avatar">
                {getInitials(user.name)}
              </div>

              <div className="profile-info">

                <div className="profile-name-row">

                  <h2>
                    {user.name || t("admin.unknownUser")}
                  </h2>

                  {user.isVerified ? (
                    <span className="verified-badge">
                      <ShieldCheck size={14} />
                      {t("admin.verified")}
                    </span>
                  ) : (
                    <span className="unverified-badge">
                      <ShieldX size={14} />
                      {t("admin.unverified")}
                    </span>
                  )}

                </div>

                <div className="profile-email">
                  <Mail size={15} />
                  {user.email}
                </div>

                <div className="profile-joined">
                  <CalendarDays size={15} />
                  {t("admin.joined")}{" "}
                  {formatDate(user.createdAt)}
                </div>

              </div>

            </div>

            <button
              className="delete-user-btn"
              onClick={handleDelete}
            >
              <Trash2 size={17} />
              {t("admin.deleteUser")}
            </button>

          </section>

          {/* STATS */}

          <section className="details-stats-grid">

            <div className="details-stat purple">

              <div className="details-stat-icon">
                <Package size={21} />
              </div>

              <span>{t("admin.currentPlan")}</span>

              <strong
                className={`plan-title ${getPlanClass(
                  currentPlan?.plan?.name ||
                    user.plan
                )}`}
              >
                {getPlanName(
                  currentPlan?.plan?.name ||
                    user.plan
                )}
              </strong>

            </div>

            <div className="details-stat blue">

              <div className="details-stat-icon">
                <Receipt size={21} />
              </div>

              <span>{t("admin.totalPayments")}</span>

              <strong>
                {statistics.totalPayments ||
                  payments.length}
              </strong>

            </div>

            <div className="details-stat green">

              <div className="details-stat-icon">
                <DollarSign size={21} />
              </div>

              <span>{t("admin.totalPaid")}</span>

              <strong>
                {formatMoney(
                  statistics.totalPaid
                )}
              </strong>

            </div>

            <div className="details-stat orange">

              <div className="details-stat-icon">
                <User size={21} />
              </div>

              <span>{t("admin.accountStatus")}</span>

              <strong>
                {user.isVerified
                  ? t("admin.active") : t("admin.pending")}
              </strong>

            </div>

          </section>

          {/* PLAN */}

          <section className="details-grid">

            <div className="details-card">

              <div className="details-card-header">
                <div>
                  <span>{t("admin.subscription")}</span>
                  <h3>{t("admin.currentPlan")}</h3>
                </div>

                <Package size={20} />
              </div>

              {currentPlan?.plan ? (

                <div className="current-plan">

                  <div
                    className={`plan-large-icon ${getPlanClass(
                      currentPlan.plan.name
                    )}`}
                  >
                    <Package size={25} />
                  </div>

                  <div className="current-plan-info">

                    <strong>
                      {getPlanName(
                        currentPlan.plan.name
                      )}
                    </strong>

                    <span>
                      {currentPlan.plan.description ||
                        t("admin.activeSubscription")}
                    </span>

                  </div>

                  <span
                    className={`plan-badge ${getPlanClass(
                      currentPlan.plan.name
                    )}`}
                  >
                    Active
                  </span>

                </div>

              ) : (

                <div className="no-plan">
                  <Package size={28} />
                  <strong>{t("admin.noActiveSub")}</strong>
                  <span>
                    {t("admin.usingFree")}
                  </span>
                </div>

              )}

            </div>

            {/* ACCOUNT INFO */}

            <div className="details-card">

              <div className="details-card-header">
                <div>
                  <span>{t("admin.account")}</span>
                  <h3>{t("admin.accountInfo")}</h3>
                </div>

                <User size={20} />
              </div>

              <div className="account-info">

                <div className="info-row">
                  <span>{t("admin.name")}</span>
                  <strong>
                    {user.name || t("admin.unknownPlan")}
                  </strong>
                </div>

                <div className="info-row">
                  <span>{t("admin.email")}</span>
                  <strong>
                    {user.email || t("admin.unknownPlan")}
                  </strong>
                </div>

                <div className="info-row">
                  <span>{t("admin.plan")}</span>
                  <strong>
                    {getPlanName(user.plan)}
                  </strong>
                </div>

                <div className="info-row">
                  <span>{t("admin.joined")}</span>
                  <strong>
                    {formatDate(user.createdAt)}
                  </strong>
                </div>

              </div>

            </div>

          </section>

          {/* PAYMENTS */}

          <section className="details-card payments-card">

            <div className="details-card-header">

              <div>
                <span>{t("admin.transactions")}</span>
                <h3>{t("admin.paymentHistory")}</h3>
              </div>

              <CreditCard size={20} />

            </div>

            <div className="details-table-wrapper">

              <table className="admin-table">

                <thead>
                  <tr>
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

                      <td
                        colSpan="5"
                        className="payment-empty"
                      >
                        <Receipt size={32} />
                        <strong>
                          {t("admin.noPaymentsYet")}
                        </strong>
                      </td>

                    </tr>

                  ) : (

                    payments.map((payment) => {

                      const plan =
                        payment.plan || {};

                      return (
                        <tr key={payment._id}>

                          <td>
                            <span
                              className={`plan-badge ${getPlanClass(
                                plan.name
                              )}`}
                            >
                              {getPlanName(
                                plan.name
                              )}
                            </span>
                          </td>

                          <td>
                            <strong className="amount-text">
                              {formatMoney(
                                payment.amount
                              )}
                            </strong>
                          </td>

                          <td>
                            <span className="billing-cycle">
                              {payment.billingCycle ||
                                t("admin.unknownPlan")}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`payment-status ${getStatusClass(
                                payment.status
                              )}`}
                            >
                              {getStatusIcon(
                                payment.status
                              )}
                              {payment.status ||
                                t("admin.pending")}
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

export default AdminUserDetails;