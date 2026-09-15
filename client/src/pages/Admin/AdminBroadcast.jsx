import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Package,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Megaphone,
  Send,
} from "lucide-react";
import api from "../../services/api";
import { useLanguage } from "../../context/LanguageContext";
import LanguageToggle from "../../components/LanguageToggle/LanguageToggle";
import "./AdminDashboard.css";
import "./AdminBroadcast.css";

function AdminBroadcast() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const navigateTo = (path) => navigate(path);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (title.trim().length < 3 || message.trim().length < 5) {
      setError(t("admin.broadcastInvalid"));
      return;
    }

    const confirmed = window.confirm(t("admin.broadcastConfirm"));
    if (!confirmed) return;

    try {
      setSending(true);
      const res = await api.post("/admin/broadcast", {
        title: title.trim(),
        message: message.trim(),
      });
      setResult(res.data);
      setTitle("");
      setMessage("");
    } catch (err) {
      setError(
        err.response?.data?.message || t("admin.somethingWrong")
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="admin-page">
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

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

          <button
            className="sidebar-item"
            onClick={() => navigate("/admin/analytics")}
          >
            <BarChart3 size={19} />
            <span>{t("admin.analytics")}</span>
          </button>

          <button className="sidebar-item active">
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

      <main className="admin-main">
        <header className="admin-topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>

            <div>
              <span className="breadcrumb">{t("admin.adminCrumb")}</span>
              <h1>{t("admin.broadcastTitle")}</h1>
            </div>
          </div>

          <div className="topbar-right">
            <LanguageToggle variant="dashboard" />
          </div>
        </header>

        <div className="admin-content">
          <section className="admin-card broadcast-card">
            <div className="broadcast-icon">
              <Megaphone size={22} />
            </div>

            <h2>{t("admin.broadcastHeading")}</h2>
            <p className="broadcast-hint">{t("admin.broadcastHint")}</p>

            <form onSubmit={handleSend}>
              <label>
                <span>{t("admin.broadcastTitleLabel")}</span>
                <input
                  type="text"
                  value={title}
                  maxLength={120}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t("admin.broadcastTitlePh")}
                />
              </label>

              <label>
                <span>{t("admin.broadcastMsgLabel")}</span>
                <textarea
                  rows={5}
                  maxLength={500}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t("admin.broadcastMsgPh")}
                />
              </label>

              {error && <p className="broadcast-error">{error}</p>}

              {result?.success && (
                <p className="broadcast-success">
                  {t("admin.broadcastSent")
                    .replace("{n}", result.notifiedUsers ?? 0)
                    .replace("{p}", result.pushSent ?? 0)}
                </p>
              )}

              <button
                type="submit"
                className="broadcast-send"
                disabled={sending}
              >
                <Send size={15} />
                {sending
                  ? t("admin.broadcastSending")
                  : t("admin.broadcastSend")}
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}

export default AdminBroadcast;
