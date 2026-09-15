
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import LanguageToggle from "../../components/LanguageToggle/LanguageToggle";
import "./Register.css";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260806_133255_956f653f-5d80-4b06-abd5-0f46c98b60fa.mp4";

const POSTER_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260806_132328_5f9029c8-218f-4489-82b6-29ff2849920e.png";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  const [error, setError] = useState("");
  const [occupation, setOccupation] = useState("");

  const [loading, setLoading] = useState(false);

  const { t } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !occupation) {
      setError("Please complete all fields.");
      return;
    }

    try {
      setError("");
      setLoading(true);

      const response = await api.post(
        "/auth/register",
        {
          name,
          email,
          password,
    
          occupation,
        }
      );

      console.log("REGISTER RESPONSE:", response.data);

      const data = response.data || {};

      // New accounts require email verification: store auth (token +
      // full user incl. isVerified) and go to /verify-email.
      if (data.requiresVerification || data.needsVerification) {
        if (data.token && data.user) {
          login(data.user, data.token);
          navigate("/verify-email");
          return;
        }
        navigate("/login");
        return;
      }

      // Back-compat: some backends return token+user directly.
      if (data.token && data.user) {
        if (data.user.isVerified === false) {
          login(data.user, data.token);
          navigate("/verify-email");
          return;
        }
        login(data.user, data.token);

        // Replay anything queued while offline (non-blocking)
        import("../../utils/offlineQueue")
          .then(({ flushOutbox }) => flushOutbox())
          .catch(() => {});

        navigate("/dashboard");
        return;
      }

      navigate("/login");
    } catch (err) {
      console.log("REGISTER STATUS:", err.response?.status);
      console.log("REGISTER DATA:", err.response?.data);

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Unable to create your account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="register-page">
      {/* Background Media */}
      <div
        className="register-media"
        style={{
          backgroundImage: `url(${POSTER_URL})`,
        }}
      >
        <video
          className="register-video"
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
      <div className="register-scrim" />

      {/* Navigation */}
      <header className="register-nav">
        <Link to="/" className="register-logo">
          VELORA
        </Link>

        <div className="register-nav-right">
          <LanguageToggle />
          <span className="register-nav-text">{t("auth.alreadyMember")}</span>

          <Link to="/login" className="register-nav-button">
            {t("auth.loginBtn")}
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <section className="register-body">
        <div className="register-panel">
          <div className="register-chip">{t("auth.createAccountChip")}</div>

          <h1>VELORA</h1>

          <p className="register-tagline">
            {t("auth.buildWorkspace")}
          </p>

          <form
            className="register-form"
            onSubmit={handleRegister}
            noValidate
          >
            {/* Name */}
            <label htmlFor="name" className="sr-only">
              {t("auth.fullName")}
            </label>

            <input
              id="name"
              type="text"
              placeholder={t("auth.fullName")}
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />

            {/* Email */}
            <label htmlFor="register-email" className="sr-only">
              {t("auth.email")}
            </label>

            <input
              id="register-email"
              type="email"
              placeholder={t("auth.email")}
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />

            {/* Password */}
            <label htmlFor="register-password" className="sr-only">
              {t("auth.password")}
            </label>

            <input
              id="register-password"
              type="password"
              placeholder={t("auth.password")}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />

            {/* Occupation */}
            <label htmlFor="occupation" className="sr-only">
              {t("auth.occupation")}
            </label>

            <input
              id="occupation"
              type="text"
              placeholder={t("auth.occupation")}
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              disabled={loading}
            />

            
         

            {/* Error */}
            {error && <p className="register-error">{error}</p>}

            {/* Submit */}
            <button
              type="submit"
              className="register-btn"
              disabled={loading}
            >
              {loading ? t("auth.creating") : t("auth.createAccount")}
            </button>
          </form>

          <p className="register-login">
            {t("auth.haveAccount")}{" "}
            <Link to="/login">{t("auth.signIn")}</Link>
          </p>
        </div>
      </section>

      {/* Legal Footer */}
      <footer className="register-footer">
        <p>
          {t("auth.agreeByCreate")}{" "}
          <Link to="/privacy">{t("auth.privacyNotice")}</Link> {t("auth.and")}{" "}
          <Link to="/terms">{t("auth.serviceContract")}</Link>.
        </p>
      </footer>
    </main>
  );
}

export default Register;
