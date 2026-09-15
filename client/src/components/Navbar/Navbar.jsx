import { motion } from "motion/react";

import {
  LayoutDashboard,
  LogOut,
  ChevronRight,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import LanguageToggle from "../LanguageToggle/LanguageToggle";
import { SERVER_URL } from "../../services/api";
import logo from "../../assets/logo.png";

function Navbar() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const { user, isAuthenticated, logout } = useAuth();

  const userName =
    user?.name ||
    user?.username ||
    user?.email?.split("@")[0] ||
    "User";

  // Convert relative avatar path to backend URL
  const getAvatarUrl = (avatar) => {
    if (!avatar) return null;

    if (
      avatar.startsWith("http://") ||
      avatar.startsWith("https://")
    ) {
      return avatar;
    }

    return `${SERVER_URL}${avatar}`;
  };

  const profileImage = getAvatarUrl(user?.avatar);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative z-20 px-6 py-6 w-full"
    >
      <div className="liquid-glass rounded-full px-6 py-3 flex items-center justify-between max-w-6xl mx-auto">

        {/* Logo + Links */}
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="flex items-center gap-2"
          >
            <img
              src={logo}
              alt="Velora"
              className="h-12 w-auto object-contain brightness-0 invert"
            />
          </Link>

          <div className="hidden md:flex items-center gap-8 text-white/80 text-sm font-medium">
            <a
              href="#features"
              className="hover:text-white transition-colors duration-300"
            >
              {t("nav.features")}
            </a>

            <a
              href="#pricing"
              className="hover:text-white transition-colors duration-300"
            >
              {t("nav.pricing")}
            </a>

            <a
              href="#about"
              className="hover:text-white transition-colors duration-300"
            >
              {t("nav.about")}
            </a>
          </div>
        </div>

        {/* Actions */}
        {!isAuthenticated ? (
          <div className="flex items-center gap-4">
            <LanguageToggle />
            <button
              className="text-white hover:text-white/80 transition-colors text-sm font-medium cursor-pointer"
              onClick={() => navigate("/register")}
            >
              {t("nav.signUp")}
            </button>

            <button
              className="liquid-glass rounded-full px-6 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity cursor-pointer"
              onClick={() => navigate("/login")}
            >
              {t("nav.login")}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">

            <LanguageToggle />
            {/* Dashboard */}
            <Link
              to="/dashboard"
              className="hidden sm:flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-medium"
            >
              <LayoutDashboard size={16} />
              {t("nav.dashboard")}
            </Link>

            {/* Profile */}
            <Link
              to="/profile"
              className="group flex items-center gap-3 rounded-full px-3 py-2 hover:bg-white/10 transition-all duration-300"
            >
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full overflow-hidden bg-purple-600/30 border border-white/20 flex items-center justify-center text-white font-semibold text-sm">

                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={userName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  userName.charAt(0).toUpperCase()
                )}

              </div>

              {/* User Info */}
              <div className="hidden sm:flex flex-col leading-tight text-left">
                <span className="text-white text-sm font-medium">
                  {userName}
                </span>

                <span className="text-white/50 text-[11px]">
                  {t("nav.viewProfile")}
                </span>
              </div>

              <ChevronRight
                size={15}
                className="text-white/40 group-hover:text-white transition-colors"
              />
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              title={t("nav.logout")}
              className="hidden sm:flex w-9 h-9 items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <LogOut size={16} />
            </button>

          </div>
        )}
      </div>
    </motion.nav>
  );
}

export default Navbar;
