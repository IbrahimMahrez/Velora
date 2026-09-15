import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import { useLanguage } from "../../context/LanguageContext";
import LanguageToggle from "../../components/LanguageToggle/LanguageToggle";
import "./ResetPassword.css";
import "../Login/Login.css";
const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260806_133255_956f653f-5d80-4b06-abd5-0f46c98b60fa.mp4";

const POSTER_URL =
  "https://d8j0ntlcm.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260806_132328_5f9029c8-218f-4489-82b6-29ff2849920e.png";

function ResetPassword() {
  const { userId, token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const { t } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await api.post(
        `/auth/reset-password/${userId}/${token}`,
        {
          password,
          confirmPassword,
        }
      );

      setSuccess(
        response.data?.message || "Password reset successfully."
      );

      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Invalid or expired reset link."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      {/* Background Media */}
      <div
        className="auth-media"
        style={{
          backgroundImage: `url(${POSTER_URL})`,
        }}
      >
        <video
          className="auth-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source src={VIDEO_URL} type="video/mp4" />
        </video>
      </div>

      <div className="auth-scrim" />

      {/* Navigation */}
      <header className="auth-nav">
        <Link to="/" className="auth-logo">
          VELORA
        </Link>

        <div className="auth-nav-right">
          <LanguageToggle />
          <span className="auth-nav-text">{t("auth.remembered")}</span>

          <Link to="/login" className="auth-nav-button">
            {t("auth.loginBtn")}
          </Link>
        </div>
      </header>

      {/* Main */}
      <section className="auth-body">
        <div className="auth-panel">
          <div className="auth-chip">{t("auth.securityRestoration")}</div>

          <h1>{t("auth.resetTitle")}</h1>

          <p className="auth-tagline">
            {t("auth.newPasswordTagline")}
          </p>

          {!success ? (
            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <label htmlFor="password" className="sr-only">
                {t("auth.newPassword")}
              </label>

              <input
                id="password"
                type="password"
                placeholder={t("auth.newPassword")}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />

              <label htmlFor="confirmPassword" className="sr-only">
                {t("auth.confirmPassword")}
              </label>

              <input
                id="confirmPassword"
                type="password"
                placeholder={t("auth.confirmPassword")}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />

              {error && <p className="auth-error">{error}</p>}

              <button
                type="submit"
                className="auth-btn auth-btn-solid"
                disabled={loading}
              >
                {loading ? t("auth.resetting") : t("auth.resetPasswordBtn")}
              </button>
            </form>
          ) : (
            <div className="forgot-success">
              <div className="forgot-success-icon">✓</div>

              <h2>{t("auth.passwordUpdated")}</h2>

              <p>{success}</p>

              <button
                className="auth-btn auth-btn-solid"
                onClick={() => navigate("/login")}
              >
                {t("auth.accessVelora")}
              </button>
            </div>
          )}

          {!success && (
            <Link to="/login" className="auth-referral">
              ← {t("auth.backToLogin")}
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="auth-footer">
        <p>
          {t("auth.agreeByAccess")}{" "}
          <Link to="/privacy">{t("auth.privacyNotice")}</Link> {t("auth.and")}{" "}
          <Link to="/terms">{t("auth.serviceContract")}</Link>.
        </p>
      </footer>
    </main>
  );
}

export default ResetPassword;