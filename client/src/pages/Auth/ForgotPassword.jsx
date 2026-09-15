import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useLanguage } from "../../context/LanguageContext";
import LanguageToggle from "../../components/LanguageToggle/LanguageToggle";
import "./ForgotPassword.css";
import "../Login/Login.css";
const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260806_133255_956f653f-5d80-4b06-abd5-0f46c98b60fa.mp4";

const POSTER_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260806_132328_5f9029c8-218f-4489-82b6-29ff2849920e.png";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await api.post(
        "/auth/forgetpassword",
        {
          email: email.trim(),
        }
      );

      setSuccess(
        response.data?.message ||
          "Password reset link sent successfully. Check your email."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Unable to send reset link. Please try again."
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

      {/* Cinematic Scrim */}
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
          <div className="auth-chip">{t("auth.accountRecovery")}</div>

          <h1>{t("auth.recoverTitle")}</h1>

          <p className="auth-tagline">
            {t("auth.resetAccessTagline")}
          </p>

          {!success ? (
            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <label htmlFor="email" className="sr-only">
                {t("auth.email")}
              </label>

              <input
                id="email"
                type="email"
                placeholder={t("auth.email")}
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />

              {error && <p className="auth-error">{error}</p>}

              <button
                type="submit"
                className="auth-btn auth-btn-solid"
                disabled={loading}
              >
                {loading ? t("auth.sending") : t("auth.sendResetLink")}
              </button>
            </form>
          ) : (
            <div className="forgot-success">
              <div className="forgot-success-icon">✓</div>

              <h2>{t("auth.checkEmail")}</h2>

              <p>{success}</p>

              <button
                className="auth-btn auth-btn-solid"
                onClick={() => navigate("/login")}
              >
                {t("auth.returnToLogin")}
              </button>
            </div>
          )}

          {!success && (
            <Link to="/login" className="auth-referral">
              ← {t("auth.backToLogin")}
            </Link>
          )}

          <p className="auth-register">
            {t("auth.noAccount")}{" "}
            <Link to="/register">{t("auth.createOne")}</Link>
          </p>
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

export default ForgotPassword;