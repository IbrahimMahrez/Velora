import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import LanguageToggle from "../../components/LanguageToggle/LanguageToggle";
import "./VerifyEmail.css";
import "../Login/Login.css";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260806_133255_956f653f-5d80-4b06-abd5-0f46c98b60fa.mp4";

const POSTER_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260806_132328_5f9029c8-218f-4489-82b6-29ff2849920e.png";

const COOLDOWN_SECONDS = 30;

function VerifyEmail() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const { t } = useLanguage();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    // Already verified (e.g. verified in another tab) — don't
    // strand the user on the code form.
    if (user && user.isVerified === true) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate, user]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const markVerifiedAndGo = () => {
    try {
      updateUser({ isVerified: true });
    } catch {
      try {
        const raw = localStorage.getItem("user");
        if (raw) {
          const user = JSON.parse(raw);
          user.isVerified = true;
          localStorage.setItem("user", JSON.stringify(user));
        }
      } catch {
        // ignore storage errors
      }
    }
    navigate("/dashboard", { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!/^\d{6}$/.test(trimmed)) {
      setError(t("auth.verifyHint"));
      return;
    }
    try {
      setError("");
      setSuccess("");
      setLoading(true);
      await api.post("/auth/verify-email", { code: trimmed });
      markVerifiedAndGo();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Verification failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    try {
      setResending(true);
      setError("");
      setSuccess("");
      await api.post("/auth/send-verification");
      setSuccess(t("auth.verifySent"));
      setCooldown(COOLDOWN_SECONDS);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Unable to resend code."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="auth-page">
      <div
        className="auth-media"
        style={{ backgroundImage: `url(${POSTER_URL})` }}
      >
        <video className="auth-video" autoPlay muted loop playsInline preload="auto">
          <source src={VIDEO_URL} type="video/mp4" />
        </video>
      </div>
      <div className="auth-scrim" />

      <header className="auth-nav">
        <Link to="/" className="auth-logo">
          VELORA
        </Link>
        <div className="auth-nav-right">
          <LanguageToggle />
        </div>
      </header>

      <section className="auth-body">
        <div className="auth-panel">
          <div className="auth-chip">{t("auth.verifyCheckEmail")}</div>
          <h1>{t("auth.verifyTitle")}</h1>
          <p className="auth-tagline">{t("auth.verifyHint")}</p>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <label htmlFor="verify-code" className="sr-only">
              {t("auth.verifyCodeLabel")}
            </label>
            <input
              id="verify-code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder={t("auth.verifyCodeLabel")}
              autoComplete="one-time-code"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              disabled={loading}
              className="verify-code-input"
            />

            {error && <p className="auth-error">{error}</p>}
            {success && <p className="verify-success">{success}</p>}

            <button
              type="submit"
              className="auth-btn auth-btn-solid"
              disabled={loading}
            >
              {loading ? t("auth.verifyVerifying") : t("auth.verifySubmit")}
            </button>

            <button
              type="button"
              className="auth-btn auth-btn-ghost"
              disabled={resending || cooldown > 0}
              onClick={handleResend}
            >
              {cooldown > 0
                ? `${t("auth.verifyResendCooldown")} ${cooldown}s`
                : t("auth.verifyResend")}
            </button>
          </form>

          <Link to="/login" className="auth-referral">
            ← {t("auth.verifyBackLogin")}
          </Link>
        </div>
      </section>

      <footer className="auth-footer">
        <p>
          {t("auth.agreeByAccess")} <Link to="/privacy">{t("auth.privacyNotice")}</Link>{" "}
          {t("auth.and")} <Link to="/terms">{t("auth.serviceContract")}</Link>.
        </p>
      </footer>
    </main>
  );
}

export default VerifyEmail;
