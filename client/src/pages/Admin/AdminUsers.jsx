import { useEffect, useState } from "react";
import api from "../../services/api";
import {
      XCircle,
  Users,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Trash2,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  LayoutDashboard,
  CreditCard,
  Package,
  BarChart3,
  Megaphone,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import "./AdminUsers.css";
import { useLanguage } from "../../context/LanguageContext";
import LanguageToggle from "../../components/LanguageToggle/LanguageToggle";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 10,
    totalUsers: 0,
    totalPages: 1,
  });

  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const token = localStorage.getItem("token");
  const { t, lang } = useLanguage();
  const locale = lang === "ar" ? "ar-EG" : "en-EG";

  // ============================================
  // FETCH USERS
  // ============================================

  const fetchUsers = async (page = 1, isRefresh = false) => {
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

      const response = await api.get("/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          search: search || undefined,
          plan: plan || undefined,
          page,
          limit: 10,
        },
      });

      if (response.data?.success) {
        setUsers(response.data.data.users || []);
        setPagination(
          response.data.data.pagination || {
            currentPage: 1,
            perPage: 10,
            totalUsers: 0,
            totalPages: 1,
          }
        );
      } else {
        throw new Error(
          response.data?.message || t("admin.somethingWrong")
        );
      }
    } catch (err) {
      console.error("Admin Users Error:", err);

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
    fetchUsers(1);
  }, [plan]);

  // ============================================
  // SEARCH
  // ============================================

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(1);
  };

  // ============================================
  // DELETE USER
  // ============================================

  const handleDeleteUser = async (userId, userName) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${userName}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await api.delete(`/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Reload current page
      fetchUsers(
        users.length === 1 && pagination.currentPage > 1
          ? pagination.currentPage - 1
          : pagination.currentPage
      );
    } catch (err) {
      console.error("Delete User Error:", err);

      alert(
        err.response?.data?.message ||
          t("admin.somethingWrong")
      );
    }
  };

  // ============================================
  // HELPERS
  // ============================================

  const navigateTo = (path) => {
    window.location.href = path;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
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

    return (
      plan.charAt(0).toUpperCase() +
      plan.slice(1)
    );
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

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return (
      <div className="admin-users-page">
        <div className="admin-users-loading">
          <div className="admin-users-loader"></div>
          <p>{t("admin.loadingUsers")}</p>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="admin-users-page">

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="users-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
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
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>

        </div>

        <div className="sidebar-section">

          <span className="sidebar-label">
            {t("admin.sidebarMain")}
          </span>

          <button
            className="sidebar-item"
            onClick={() =>
              navigateTo("/admin")
            }
          >
            <LayoutDashboard size={19} />
            <span>{t("admin.dashboard")}</span>
          </button>

          <button className="sidebar-item active">
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
                {t("admin.breadcrumbUsers")}
              </span>

              <h1>{t("admin.users")}</h1>
            </div>

          </div>

          <div className="topbar-right">

            <button
              className="refresh-btn"
              onClick={() =>
                fetchUsers(
                  pagination.currentPage,
                  true
                )
              }
              disabled={refreshing}
            >
              <RefreshCw
                size={17}
                className={
                  refreshing ? "spin" : ""
                }
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

        <div className="admin-users-content">

          {/* HEADER */}

          <section className="users-header">

            <div>

              <span className="users-eyebrow">
                <ShieldCheck size={14} />
                {t("admin.userManagement")}
              </span>

              <h2>
                Manage <span>{t("admin.users")}</span>
              </h2>

              <p>
                {t("admin.manageUsersDesc")}
              </p>

            </div>

            <div className="users-total">
              <Users size={18} />
              <strong>
                {pagination.totalUsers}
              </strong>
              <span>{t("admin.totalUsers")}</span>
            </div>

          </section>

          {/* FILTERS */}

          <section className="users-toolbar">

            <form
              className="users-search"
              onSubmit={handleSearch}
            >

              <Search size={19} />

              <input
                type="text"
                placeholder={t("admin.searchPlaceholder")}
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

              {search && (
                <button
                  type="button"
                  className="clear-search"
                  onClick={() => {
                    setSearch("");
                    fetchUsers(1);
                  }}
                >
                  <X size={16} />
                </button>
              )}

              <button
                type="submit"
                className="search-btn"
              >
                Search
              </button>

            </form>

            <div className="users-filter">

              <Filter size={17} />

              <select
                value={plan}
                onChange={(e) =>
                  setPlan(e.target.value)
                }
              >
                <option value="">
                  {t("admin.allPlans")}
                </option>

                <option value="free">
                  Free
                </option>

                <option value="premium">
                  Premium
                </option>

                <option value="family">
                  Family
                </option>
              </select>

            </div>

          </section>

          {/* ERROR */}

          {error && (
            <div className="users-error">
              <XCircle size={18} />
              {error}
            </div>
          )}

          {/* TABLE */}

          <section className="users-table-card">

            <div className="table-wrapper">

              <table className="admin-table">

                <thead>

                  <tr>
                    <th>{t("admin.user")}</th>
                    <th>{t("admin.email")}</th>
                    <th>{t("admin.plan")}</th>
                    <th>{t("admin.status")}</th>
                    <th>{t("admin.joined")}</th>
                    <th>{t("admin.actions")}</th>
                  </tr>

                </thead>

                <tbody>

                  {users.length === 0 ? (

                    <tr>

                      <td
                        colSpan="6"
                        className="table-empty"
                      >

                        <Users size={35} />

                        <strong>
                          {t("admin.noUsers")}
                        </strong>

                        <span>
                          {t("admin.tryChangeFilter")}
                        </span>

                      </td>

                    </tr>

                  ) : (

                    users.map((user) => (

                      <tr key={user._id}>

                        {/* USER */}

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

                        {/* EMAIL */}

                        <td>

                          <span className="email-text">
                            {user.email}
                          </span>

                        </td>

                        {/* PLAN */}

                        <td>

                          <span
                            className={`plan-badge ${getPlanClass(
                              user.plan
                            )}`}
                          >
                            {getPlanName(user.plan)}
                          </span>

                        </td>

                        {/* STATUS */}

                        <td>

                          {user.isVerified ? (

                            <span className="user-status verified">
                              <UserCheck size={14} />
                              {t("admin.verified")}
                            </span>

                          ) : (

                            <span className="user-status unverified">
                              <UserX size={14} />
                              {t("admin.unverified")}
                            </span>

                          )}

                        </td>

                        {/* JOINED */}

                        <td>

                          <span className="date-text">
                            {formatDate(
                              user.createdAt
                            )}
                          </span>

                        </td>

                        {/* ACTIONS */}

                        <td>

                          <div className="user-actions">

                            <button
                              className="action-btn view"
                              title={t("admin.view")}
                              onClick={() =>
                                navigateTo(
                                  `/admin/users/${user._id}`
                                )
                              }
                            >
                              <Eye size={16} />
                            </button>

                            <button
                              className="action-btn delete"
                              title={t("admin.delete")}
                              onClick={() =>
                                handleDeleteUser(
                                  user._id,
                                  user.name ||
                                    "this user"
                                )
                              }
                            >
                              <Trash2 size={16} />
                            </button>

                          </div>

                        </td>

                      </tr>

                    ))

                  )}

                </tbody>

              </table>

            </div>

            {/* PAGINATION */}

            {pagination.totalUsers > 0 && (
              <div className="users-pagination">

                <span>
                  {t("admin.showing")}{" "}
                  <strong>
                    {(pagination.currentPage - 1) *
                      pagination.perPage +
                      1}
                  </strong>
                  {" - "}
                  <strong>
                    {Math.min(
                      pagination.currentPage *
                        pagination.perPage,
                      pagination.totalUsers
                    )}
                  </strong>
                  {t("admin.of")}
                  <strong>
                    {pagination.totalUsers}
                  </strong>
                </span>

                <div className="pagination-buttons">

                  <button
                    disabled={
                      pagination.currentPage <= 1
                    }
                    onClick={() =>
                      fetchUsers(
                        pagination.currentPage - 1
                      )
                    }
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <span className="page-number">
                    {pagination.currentPage}
                  </span>

                  <button
                    disabled={
                      pagination.currentPage >=
                      pagination.totalPages
                    }
                    onClick={() =>
                      fetchUsers(
                        pagination.currentPage + 1
                      )
                    }
                  >
                    <ChevronRight size={18} />
                  </button>

                </div>

              </div>
            )}

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

export default AdminUsers;