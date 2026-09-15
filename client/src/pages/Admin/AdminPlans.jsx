import { useEffect, useState } from "react";
import {
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
  Plus,
  Pencil,
  Trash2,
  Check,
  Star,
  RefreshCw,
  XCircle,
} from "lucide-react";

import "./AdminPlans.css";
import { useLanguage } from "../../context/LanguageContext";
import { useCurrency } from "../../hooks/useCurrency";
import LanguageToggle from "../../components/LanguageToggle/LanguageToggle";
import api from "../../services/api";

const emptyForm = {
  name: "premium",
  description: "",
  monthlyPrice: "",
  yearlyPrice: "",
  duration: 30,
  features: "",
  isPopular: false,
  isActive: true,
};

const AdminPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [deletePlanId, setDeletePlanId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { t, lang } = useLanguage();
  const { currency } = useCurrency();
  const locale = lang === "ar" ? "ar-EG" : "en-EG";

  const fetchPlans = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/admin/plans");

      const result = response.data;

      setPlans(result?.data?.plans || []);
    } catch (err) {
      console.error("Plans Error:", err);
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
    fetchPlans();
  }, []);

  const navigate = (path) => {
    window.location.href = path;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const openCreateModal = () => {
    setEditingPlan(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (plan) => {
    setEditingPlan(plan);

    setForm({
      name: plan.name || "premium",
      description: plan.description || "",
      monthlyPrice: plan.monthlyPrice ?? "",
      yearlyPrice: plan.yearlyPrice ?? "",
      duration: plan.duration ?? 30,
      features: Array.isArray(plan.features)
        ? plan.features.join("\n")
        : "",
      isPopular: Boolean(plan.isPopular),
      isActive: Boolean(plan.isActive),
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingPlan(null);
    setForm(emptyForm);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const features = form.features
        .split("\n")
        .map((feature) => feature.trim())
        .filter(Boolean);

      let body;

      if (editingPlan) {
        body = {
          description: form.description,
          monthlyPrice: Number(form.monthlyPrice),
          yearlyPrice: Number(form.yearlyPrice),
          duration: Number(form.duration),
          features,
          isPopular: form.isPopular,
          isActive: form.isActive,
        };
      } else {
        body = {
          name: form.name,
          description: form.description,
          monthlyPrice: Number(form.monthlyPrice),
          yearlyPrice: Number(form.yearlyPrice),
          duration: Number(form.duration),
          features,
          isPopular: form.isPopular,
          isActive: form.isActive,
        };
      }

      if (editingPlan) {
        await api.patch(
          `/admin/plans/${editingPlan._id}`,
          body
        );
      } else {
        await api.post("/admin/plans", body);
      }

      closeModal();
      await fetchPlans(true);
    } catch (err) {
      console.error("Save Plan Error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          t("admin.somethingWrong")
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletePlanId) return;

    try {
      setDeleting(true);
      setError("");

      await api.delete(`/admin/plans/${deletePlanId}`);

      setDeletePlanId(null);
      await fetchPlans(true);
    } catch (err) {
      console.error("Delete Plan Error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          t("admin.somethingWrong")
      );
      setDeletePlanId(null);
    } finally {
      setDeleting(false);
    }
  };

  const formatPrice = (price) => {
    return `${Number(price || 0).toLocaleString(locale)} ${currency}`;
  };

  return (
    <div className="admin-plans-page">
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

          <button className="sidebar-item active">
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
              <strong>{t("admin.plans")}</strong>
            </div>
          </div>

          <div className="topbar-right">
            <button
              className={`refresh-btn ${refreshing ? "spinning" : ""}`}
              onClick={() => fetchPlans(true)}
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
          <section className="plans-header">
            <div>
              <span className="page-eyebrow">
                <Package size={14} />
                {t("admin.subscriptionMgmt")}
              </span>

              <h1>{t("admin.plans")}</h1>

              <p>
                {t("admin.createManageDesc")}
              </p>
            </div>

            <button className="add-plan-btn" onClick={openCreateModal}>
              <Plus size={18} />
              {t("admin.addNewPlan")}
            </button>
          </section>

          {/* ERROR */}
          {error && (
            <div className="plans-error">
              <XCircle size={19} />
              <span>{error}</span>

              <button onClick={() => setError("")}>
                <X size={16} />
              </button>
            </div>
          )}

          {/* CONTENT */}
          {loading ? (
            <div className="plans-loading">
              <div className="admin-loader"></div>
              <span>{t("admin.loadingPlans")}</span>
            </div>
          ) : plans.length === 0 ? (
            <div className="plans-empty">
              <div className="empty-icon">
                <Package size={26} />
              </div>

              <h3>{t("admin.noPlansAvailable")}</h3>

              <p>{t("admin.createFirstPlan")}</p>

              <button onClick={openCreateModal}>
                <Plus size={17} />
                {t("admin.createPlan")}
              </button>
            </div>
          ) : (
            <div className="plans-grid">
              {plans.map((plan) => (
                <article
                  className={`plan-card ${
                    plan.isPopular ? "popular" : ""
                  } ${!plan.isActive ? "inactive" : ""}`}
                  key={plan._id}
                >
                  {plan.isPopular && (
                    <div className="popular-badge">
                      <Star size={13} fill="currentColor" />
                      {t("admin.mostPopular")}
                    </div>
                  )}

                  <div className="plan-card-top">
                    <div>
                      <span
                        className={`plan-status ${
                          plan.isActive ? "active" : "inactive"
                        }`}
                      >
                        <span></span>
                        {plan.isActive ? t("admin.active") : t("admin.inactive")}
                      </span>

                      <h2>
                        {plan.name?.charAt(0).toUpperCase()}
                        {plan.name?.slice(1)}
                      </h2>

                      <p>{plan.description || t("admin.noDescription")}</p>
                    </div>
                  </div>

                  <div className="plan-prices">
                    <div>
                      <span>{t("admin.monthly")}</span>
                      <strong>{formatPrice(plan.monthlyPrice)}</strong>
                      <small>{t("admin.perMonth")}</small>
                    </div>

                    <div>
                      <span>{t("admin.yearly")}</span>
                      <strong>{formatPrice(plan.yearlyPrice)}</strong>
                      <small>{t("admin.perYear")}</small>
                    </div>
                  </div>

                  <div className="plan-features">
                    <span className="features-title">
                      {t("admin.features")}
                    </span>

                    {Array.isArray(plan.features) &&
                    plan.features.length > 0 ? (
                      plan.features.map((feature, index) => (
                        <div className="feature-item" key={index}>
                          <span className="feature-check">
                            <Check size={13} />
                          </span>

                          <span>{feature}</span>
                        </div>
                      ))
                    ) : (
                      <span className="no-features">
                        {t("admin.noFeatures")}
                      </span>
                    )}
                  </div>

                  <div className="plan-card-footer">
                    <button
                      className="edit-plan-btn"
                      onClick={() => openEditModal(plan)}
                    >
                      <Pencil size={15} />
                      Edit
                    </button>

                    <button
                      className="delete-plan-btn"
                      onClick={() => setDeletePlanId(plan._id)}
                    >
                      <Trash2 size={15} />
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
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

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="plan-modal-overlay">
          <div className="plan-modal">
            <div className="modal-header">
              <div>
                <span className="modal-eyebrow">
                  {editingPlan ? t("admin.updatePlan") : t("admin.newPlan")}
                </span>

                <h2>
                  {editingPlan ? t("admin.editPlan") : t("admin.createPlan")}
                </h2>
              </div>

              <button onClick={closeModal} disabled={saving}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {!editingPlan && (
                <div className="form-group">
                  <label>{t("admin.planName")}</label>

                  <select
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  >
                    <option value="free">{t("admin.free")}</option>
                    <option value="premium">{t("admin.premium")}</option>
                    <option value="family">{t("admin.family")}</option>
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>{t("admin.description")}</label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder={t("admin.descPlaceholder")}
                  rows="3"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{t("admin.monthlyPrice")}</label>

                  <div className="input-with-suffix">
                    <input
                      type="number"
                      name="monthlyPrice"
                      value={form.monthlyPrice}
                      onChange={handleChange}
                      min="0"
                      required
                    />
                    <span>{currency}</span>
                  </div>
                </div>

                <div className="form-group">
                  <label>{t("admin.yearlyPrice")}</label>

                  <div className="input-with-suffix">
                    <input
                      type="number"
                      name="yearlyPrice"
                      value={form.yearlyPrice}
                      onChange={handleChange}
                      min="0"
                      required
                    />
                    <span>{currency}</span>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>{t("admin.duration")}</label>

                <div className="input-with-suffix">
                  <input
                    type="number"
                    name="duration"
                    value={form.duration}
                    onChange={handleChange}
                    min="1"
                    required
                  />
                  <span>{t("admin.days")}</span>
                </div>
              </div>

              <div className="form-group">
                <label>{t("admin.features")}</label>

                <textarea
                  name="features"
                  value={form.features}
                  onChange={handleChange}
                  placeholder={
                    "Unlimited expenses\nAI financial insights\nPriority support"
                  }
                  rows="5"
                />

                <small>
                  {t("admin.onePerLine")}
                </small>
              </div>

              <div className="form-switches">
                <label className="switch-row">
                  <div>
                    <strong>{t("admin.popularPlan")}</strong>
                    <span>{t("admin.popularDesc")}</span>
                  </div>

                  <input
                    type="checkbox"
                    name="isPopular"
                    checked={form.isPopular}
                    onChange={handleChange}
                  />

                  <span className="custom-switch"></span>
                </label>

                <label className="switch-row">
                  <div>
                    <strong>{t("admin.activePlan")}</strong>
                    <span>{t("admin.activePlanDesc")}</span>
                  </div>

                  <input
                    type="checkbox"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleChange}
                  />

                  <span className="custom-switch"></span>
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-plan-btn"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <RefreshCw size={16} className="spinning" />
                      {t("admin.saving")}
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      {editingPlan ? t("admin.saveChanges") : t("admin.createPlan")}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deletePlanId && (
        <div className="plan-modal-overlay">
          <div className="delete-modal">
            <div className="delete-icon">
              <Trash2 size={23} />
            </div>

            <h2>{t("admin.deleteThisPlan")}</h2>

            <p>
              {t("admin.deletePlanConfirm")}
            </p>

            <div className="delete-actions">
              <button
                className="cancel-btn"
                onClick={() => setDeletePlanId(null)}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                className="confirm-delete-btn"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? t("admin.deleting") : t("admin.deletePlan")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPlans;