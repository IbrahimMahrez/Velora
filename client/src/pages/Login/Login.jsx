
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import LanguageToggle from "../../components/LanguageToggle/LanguageToggle";
import "./Login.css";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260806_133255_956f653f-5d80-4b06-abd5-0f46c98b60fa.mp4";

const POSTER_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260806_132328_5f9029c8-218f-4489-82b6-29ff2849920e.png";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setError("");
      setLoading(true);

      const response = await api.post(
        "/auth/login",
        {
          email,
          password,
        }
      );

      console.log("LOGIN RESPONSE:", response.data);

      const { token, user } = response.data;

      // Backend may flag unverified accounts directly on success.
      if (user?.requiresVerification || user?.isVerified === false) {
        if (token) login(user, token);
        navigate("/verify-email");
        return;
      }

      login(user, token);

      // Replay anything queued while offline (non-blocking)
      import("../../utils/offlineQueue")
        .then(({ flushOutbox }) => flushOutbox())
        .catch(() => {});

      if (user.isAdmin) {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.log("LOGIN STATUS:", err.response?.status);
      console.log("LOGIN DATA:", err.response?.data);

      const data = err.response?.data || {};

      // Unverified accounts get 403 { needsVerification: true }.
      // Some backends also return the token/user so we can continue
      // straight to the verification page.
      if (
        err.response?.status === 403 &&
        (data.needsVerification || data.requiresVerification)
      ) {
        if (data.token && data.user) {
          login(data.user, data.token);
        }
        navigate("/verify-email");
        return;
      }

      setError(
        data.message ||
          err.response?.data ||
          "Unable to login. Please check your credentials."
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
          <span className="auth-nav-text">{t("auth.newToVelora")}</span>

          <Link to="/register" className="auth-nav-button">
            {t("auth.joinUp")}
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <section className="auth-body">
        <div className="auth-panel">
          <div className="auth-chip">{t("auth.financialEntry")}</div>

          <h1>VELORA</h1>

          <p className="auth-tagline">
            {t("auth.yourWorkspace")}
          </p>

          <form className="auth-form" onSubmit={handleLogin} noValidate>
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

            <label htmlFor="password" className="sr-only">
              {t("auth.password")}
            </label>

            <input
              id="password"
              type="password"
              placeholder={t("auth.password")}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />

            {error && <p className="auth-error">{error}</p>}

            <button
              type="submit"
              className="auth-btn auth-btn-ghost"
              disabled={loading}
            >
              {loading ? t("auth.authenticating") : t("auth.proceedEmail")}
            </button>

            <button
              type="submit"
              className="auth-btn auth-btn-solid"
              disabled={loading}
            >
              {loading ? t("auth.pleaseWait") : t("auth.access")}
            </button>
          </form>

         <Link to="/forgot-password" className="auth-referral">
  {t("auth.forgotPassword")}
</Link>

          <p className="auth-register">
            {t("auth.noAccount")}{" "}
            <Link to="/register">{t("auth.createOne")}</Link>
          </p>
        </div>
      </section>

      {/* Legal Footer */}
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

export default Login;
