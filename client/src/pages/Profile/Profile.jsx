import { useEffect, useMemo, useState } from "react";
import api, { SERVER_URL } from "../../services/api";
import { motion, AnimatePresence } from "motion/react";
import {
  UserRound,
  Mail,
  ShieldCheck,
  Bell,
  CreditCard,
  LockKeyhole,
  ChevronRight,
  Edit3,
  Camera,
  Sparkles,
  LogOut,
  CalendarDays,
  CheckCircle2,
  WalletCards,
  BriefcaseBusiness,
  X,
  Save,
  LoaderCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import MembershipCard from "./MembershipCard";
import "./Profile.css";
import { useLanguage } from "../../context/LanguageContext";
import LanguageToggle from "../../components/LanguageToggle/LanguageToggle";

const API_URL = "/users";
const SETTINGS_URL = "/settings";

const Profile = () => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const locale = lang === "ar" ? "ar-EG" : "en-US";

  // =====================================================
  // STATE
  // =====================================================

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit profile
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Avatar
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Security
  const [securityOpen, setSecurityOpen] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  // Notifications
  const [notificationsOpen, setNotificationsOpen] =
    useState(false);

  const [notificationsLoading, setNotificationsLoading] =
    useState(false);

  const [notificationsSaving, setNotificationsSaving] =
    useState(false);

  const [settings, setSettings] = useState({
    emailNotifications: true,
    billReminders: true,
    subscriptionReminders: true,
    installmentReminders: true,
    goalReminders: true,
  });

  // General message
  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  // Edit form
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    occupation: "",
  });

  // =====================================================
  // HELPERS
  // =====================================================

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const getAuthHeaders = () => {
    const token = getToken();

    return {
      Authorization: `Bearer ${token}`,
    };
  };

  const showMessage = (type, text) => {
    setMessage({
      type,
      text,
    });

    setTimeout(() => {
      setMessage({
        type: "",
        text: "",
      });
    }, 3000);
  };

  // =====================================================
  // GET PROFILE
  // =====================================================

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await api.get(
        `${API_URL}/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProfile(response.data);

      const profileUser = response.data.user;

      setFormData({
        name: profileUser?.name || "",
        email: profileUser?.email || "",
        occupation: profileUser?.occupation || "",
      });
    } catch (error) {
      console.error("PROFILE ERROR:", error);

      if (error.response?.status === 401) {
        logout();
        navigate("/login");
        return;
      }

      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Unable to load your profile.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // =====================================================
  // USER DATA
  // =====================================================

  const profileUser = profile?.user || user;

  const userName = useMemo(() => {
    return (
      profileUser?.name ||
      profileUser?.email?.split("@")[0] ||
      "Velora User"
    );
  }, [profileUser]);

  const userEmail =
    profileUser?.email || "No email available";

  const occupation =
    profileUser?.occupation ||
    t("profile.noOccupation");

  const profileImage =
    profileUser?.avatar || null;

  // =====================================================
  // AVATAR URL
  // =====================================================

  const getAvatarUrl = () => {
    if (!profileImage) return null;

    if (
      profileImage.startsWith("http://") ||
      profileImage.startsWith("https://")
    ) {
      return profileImage;
    }

    return `${SERVER_URL}${profileImage}`;
  };

  // =====================================================
  // MEMBERSHIP
  // =====================================================

  const membership = profile?.membership;

  const currentPlan = useMemo(() => {
    return membership?.plan?.name || "Free";
  }, [membership]);

  const planClass = useMemo(() => {
    const plan = currentPlan.toLowerCase();

    if (plan.includes("premium")) {
      return "premium";
    }

    if (plan.includes("family")) {
      return "family";
    }

    return "free";
  }, [currentPlan]);

  const membershipStatus =
    membership?.status || "active";

  const joinedDate = profileUser?.createdAt
    ? new Date(
        profileUser.createdAt
      ).toLocaleDateString(locale, {
        month: "long",
        year: "numeric",
      })
    : profileUser?.date
    ? new Date(
        profileUser.date
      ).toLocaleDateString(locale, {
        month: "long",
        year: "numeric",
      })
    : t("profile.recently");

  // =====================================================
  // EDIT PROFILE
  // =====================================================

  const openEditModal = () => {
    setFormData({
      name: profileUser?.name || "",
      email: profileUser?.email || "",
      occupation: profileUser?.occupation || "",
    });

    setMessage({
      type: "",
      text: "",
    });

    setEditOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // UPDATE PROFILE
  // =====================================================

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setMessage({
        type: "error",
        text: "Name is required.",
      });
      return;
    }

    if (!formData.email.trim()) {
      setMessage({
        type: "error",
        text: "Email is required.",
      });
      return;
    }

    try {
      setSaving(true);

      const token = getToken();

      const response = await api.put(
        `${API_URL}/profile`,
        {
          name: formData.name.trim(),
          email: formData.email.trim(),
          occupation: formData.occupation.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedUser = response.data.user;

      setProfile((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          ...updatedUser,
        },
      }));

      if (login && token) {
        login(
          {
            ...user,
            ...updatedUser,
          },
          token
        );
      }

      setEditOpen(false);

      showMessage(
        "success",
        "Profile updated successfully."
      );
    } catch (error) {
      console.error(
        "UPDATE PROFILE ERROR:",
        error
      );

      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Unable to update your profile.",
      });
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // UPDATE AVATAR
  // =====================================================

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage({
        type: "error",
        text: "Please select a valid image.",
      });

      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({
        type: "error",
        text: "Image size must be less than 5MB.",
      });

      e.target.value = "";
      return;
    }

    try {
      setAvatarUploading(true);

      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      const data = new FormData();

      data.append("avatar", file);

      const response = await api.put(
        `${API_URL}/profile/avatar`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedUser = response.data.user;

      setProfile((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          ...updatedUser,
        },
      }));

      if (login) {
        login(
          {
            ...user,
            ...updatedUser,
          },
          token
        );
      }

      showMessage(
        "success",
        "Profile photo updated successfully."
      );
    } catch (error) {
      console.error(
        "AVATAR UPLOAD ERROR:",
        error
      );

      if (error.response?.status === 401) {
        logout();
        navigate("/login");
        return;
      }

      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Unable to update profile photo.",
      });
    } finally {
      setAvatarUploading(false);

      e.target.value = "";
    }
  };

  // =====================================================
  // SECURITY
  // =====================================================

  const openSecurityModal = () => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);

    setMessage({
      type: "",
      text: "",
    });

    setSecurityOpen(true);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = passwordData;

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      setMessage({
        type: "error",
        text: "Please fill in all password fields.",
      });

      return;
    }

    if (newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "New password must be at least 6 characters.",
      });

      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({
        type: "error",
        text: "Passwords do not match.",
      });

      return;
    }

    try {
      setPasswordSaving(true);

      const response = await api.put(
        `${SETTINGS_URL}/password`,
        {
          currentPassword,
          newPassword,
          confirmPassword,
        },
        {
          headers: getAuthHeaders(),
        }
      );

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setSecurityOpen(false);

      showMessage(
        "success",
        response.data?.message ||
          "Password updated successfully."
      );
    } catch (error) {
      console.error(
        "CHANGE PASSWORD ERROR:",
        error
      );

      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Unable to update your password.",
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  // =====================================================
  // NOTIFICATION SETTINGS
  // =====================================================

  const openNotificationsModal = async () => {
    setNotificationsOpen(true);
    setNotificationsLoading(true);

    setMessage({
      type: "",
      text: "",
    });

    try {
      const response = await api.get(
        SETTINGS_URL,
        {
          headers: getAuthHeaders(),
        }
      );

      const data = response.data?.settings;

      if (data) {
        setSettings({
          emailNotifications:
            data.emailNotifications ?? true,

          billReminders:
            data.billReminders ?? true,

          subscriptionReminders:
            data.subscriptionReminders ?? true,

          installmentReminders:
            data.installmentReminders ?? true,

          goalReminders:
            data.goalReminders ?? true,
        });
      }
    } catch (error) {
      console.error(
        "GET NOTIFICATION SETTINGS ERROR:",
        error
      );

      setNotificationsOpen(false);

      showMessage(
        "error",
        error.response?.data?.message ||
          "Unable to load notification preferences."
      );
    } finally {
      setNotificationsLoading(false);
    }
  };

  const handleNotificationToggle = async (
    field
  ) => {
    const newValue = !settings[field];

    // Optimistic UI update
    setSettings((prev) => ({
      ...prev,
      [field]: newValue,
    }));

    try {
      setNotificationsSaving(true);

      const response = await api.put(
        SETTINGS_URL,
        {
          [field]: newValue,
        },
        {
          headers: getAuthHeaders(),
        }
      );

      const updatedSettings =
        response.data?.settings;

      if (updatedSettings) {
        setSettings({
          emailNotifications:
            updatedSettings.emailNotifications ??
            true,

          billReminders:
            updatedSettings.billReminders ??
            true,

          subscriptionReminders:
            updatedSettings.subscriptionReminders ??
            true,

          installmentReminders:
            updatedSettings.installmentReminders ??
            true,

          goalReminders:
            updatedSettings.goalReminders ??
            true,
        });
      }
    } catch (error) {
      console.error(
        "UPDATE NOTIFICATION SETTINGS ERROR:",
        error
      );

      // Rollback if request fails
      setSettings((prev) => ({
        ...prev,
        [field]: !newValue,
      }));

      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Unable to update notification preference.",
      });
    } finally {
      setNotificationsSaving(false);
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error(error);
    }

    navigate("/login");
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-background">
          <div className="profile-orb profile-orb-one" />
          <div className="profile-orb profile-orb-two" />
          <div className="profile-orb profile-orb-three" />
          <div className="profile-grid" />
        </div>

        <div className="profile-loading">
          <LoaderCircle
            size={28}
            className="profile-loading-icon"
          />

          <span>
            {t("profile.loading")}
          </span>
        </div>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="profile-page">
      {/* Background */}

      <div className="profile-background">
        <div className="profile-orb profile-orb-one" />
        <div className="profile-orb profile-orb-two" />
        <div className="profile-orb profile-orb-three" />
        <div className="profile-grid" />
      </div>

      {/* Main */}

      <main className="profile-main">
        {/* Header */}

        <motion.header
          className="profile-header"
          initial={{
            opacity: 0,
            y: -20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.65,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <div className="profile-header-info">
            <span className="profile-eyebrow">
              {t("profile.eyebrow")}
            </span>

            <h1>{t("profile.title")}</h1>

            <p>
              {t("profile.subtitle")}
            </p>
          </div>

          <div className="profile-header-actions">
            <LanguageToggle variant="dashboard" />
            <Link
              to="/dashboard"
              className="profile-back-button"
            >
              <WalletCards size={15} />
              {t("profile.back")}
            </Link>

            <button
              className="profile-logout-button"
              onClick={handleLogout}
              type="button"
            >
              <LogOut size={15} />
              {t("profile.logout")}
            </button>
          </div>
        </motion.header>

        {/* Message */}

        <AnimatePresence>
          {message.text &&
            !editOpen &&
            !securityOpen &&
            !notificationsOpen && (
              <motion.div
                className={`profile-message ${
                  message.type === "error"
                    ? "error"
                    : "success"
                }`}
                initial={{
                  opacity: 0,
                  y: -10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -10,
                }}
              >
                {message.type === "success" ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <ShieldCheck size={16} />
                )}

                {message.text}
              </motion.div>
            )}
        </AnimatePresence>

        {/* Identity Card */}

        <motion.section
          className="profile-identity-card"
          initial={{
            opacity: 0,
            y: 25,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.7,
            delay: 0.08,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <div className="profile-identity-left">
            {/* Avatar */}

            <div className="profile-large-avatar">
              {getAvatarUrl() ? (
                <img
                  src={getAvatarUrl()}
                  alt={userName}
                />
              ) : (
                <span>
                  {userName
                    .charAt(0)
                    .toUpperCase()}
                </span>
              )}

              {/* Camera */}

              <label
                className={`profile-camera-button ${
                  avatarUploading
                    ? "uploading"
                    : ""
                }`}
                title="Change profile photo"
              >
                {avatarUploading ? (
                  <LoaderCircle
                    size={14}
                    className="profile-loading-icon"
                  />
                ) : (
                  <Camera size={14} />
                )}

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleAvatarUpload}
                  disabled={avatarUploading}
                  hidden
                />
              </label>
            </div>

            {/* Identity */}

            <div className="profile-identity-info">
              <div className="profile-name-row">
                <h2>{userName}</h2>

                <span
                  className={`profile-plan-badge ${planClass}`}
                >
                  <Sparkles size={12} />
                  {currentPlan}
                </span>
              </div>

              <div className="profile-email">
                <Mail size={15} />

                <span>
                  {userEmail}
                </span>
              </div>

              <div className="profile-member-date">
                <CalendarDays size={14} />

                <span>
                  {t("profile.memberSince")} {joinedDate}
                </span>
              </div>

              <div className="profile-member-date">
                <BriefcaseBusiness size={14} />

                <span>
                  {occupation}
                </span>
              </div>
            </div>
          </div>

          {/* Edit */}

          <button
            className="profile-edit-button"
            type="button"
            onClick={openEditModal}
          >
            <Edit3 size={15} />
            {t("profile.editProfile")}
          </button>
        </motion.section>

        {/* Membership */}

        <motion.section
          className="profile-section"
          initial={{
            opacity: 0,
            y: 30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.7,
            delay: 0.15,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <div className="profile-section-heading">
            <div>
              <span>
                {t("profile.membershipEyebrow")}
              </span>

              <h2>
                {t("profile.membershipTitle")}
              </h2>

              <p>
                {t("profile.membershipHint")}
              </p>
            </div>

            <div className="membership-status">
              <span className="status-dot" />
              {membershipStatus}
            </div>
          </div>

          <div className="profile-membership-stack">
            <MembershipCard
              plan={currentPlan}
              user={profileUser}
            />

            <div className="membership-info-panel">
              <div className="membership-info-item">
                <span>
                  {t("profile.currentPlan")}
                </span>

                <strong>
                  {currentPlan}
                </strong>
              </div>

              <div className="membership-info-item">
                <span>
                  {t("profile.accountType")}
                </span>

                <strong>
                  {t("profile.personalAccount")}
                </strong>
              </div>

              <div className="membership-info-item">
                <span>
                  {t("profile.membershipStatus")}
                </span>

                <strong className="active-text">
                  <CheckCircle2 size={15} />
                  {membershipStatus}
                </strong>
              </div>

              {membership?.startDate && (
                <div className="membership-info-item">
                  <span>
                    {t("profile.startDate")}
                  </span>

                  <strong>
                    {new Date(
                      membership.startDate
                    ).toLocaleDateString()}
                  </strong>
                </div>
              )}

              {membership?.endDate && (
                <div className="membership-info-item">
                  <span>
                    {t("profile.endDate")}
                  </span>

                  <strong>
                    {new Date(
                      membership.endDate
                    ).toLocaleDateString()}
                  </strong>
                </div>
              )}

              <Link
                to="/plans"
                className="manage-plan-button"
              >
                {t("profile.manageMembership")}
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </motion.section>

        {/* Account Settings */}

        <motion.section
          className="profile-section"
          initial={{
            opacity: 0,
            y: 30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.7,
            delay: 0.22,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <div className="profile-section-heading">
            <div>
              <span>
                {t("profile.accountEyebrow")}
              </span>

              <h2>
                {t("profile.accountTitle")}
              </h2>

              <p>
                {t("profile.accountHint")}
              </p>
            </div>
          </div>

          <div className="profile-settings-stack">
            {/* Personal */}

            <button
              className="profile-setting-card"
              type="button"
              onClick={openEditModal}
            >
              <div className="profile-setting-icon">
                <UserRound size={19} />
              </div>

              <div className="profile-setting-content">
                <strong>
                  {t("profile.personalInfo")}
                </strong>

                <span>
                  {t("profile.personalInfoHint")}
                </span>
              </div>

              <ChevronRight
                size={17}
                className="profile-setting-arrow"
              />
            </button>

            {/* Security */}

            <button
              className="profile-setting-card"
              type="button"
              onClick={openSecurityModal}
            >
              <div className="profile-setting-icon">
                <LockKeyhole size={19} />
              </div>

              <div className="profile-setting-content">
                <strong>
                  {t("profile.security")}
                </strong>

                <span>
                  {t("profile.securityHint")}
                </span>
              </div>

              <ChevronRight
                size={17}
                className="profile-setting-arrow"
              />
            </button>

            {/* Notifications */}

            <button
              className="profile-setting-card"
              type="button"
              onClick={openNotificationsModal}
            >
              <div className="profile-setting-icon">
                <Bell size={19} />
              </div>

              <div className="profile-setting-content">
                <strong>
                  {t("profile.notifications")}
                </strong>

                <span>
                  {t("profile.notificationsHint")}
                </span>
              </div>

              <ChevronRight
                size={17}
                className="profile-setting-arrow"
              />
            </button>

            {/* Billing */}

            <Link
              to="/plans"
              className="profile-setting-card"
            >
              <div className="profile-setting-icon">
                <CreditCard size={19} />
              </div>

              <div className="profile-setting-content">
                <strong>
                  {t("profile.billing")}
                </strong>

                <span>
                  {t("profile.billingHint")}
                </span>
              </div>

              <ChevronRight
                size={17}
                className="profile-setting-arrow"
              />
            </Link>
          </div>
        </motion.section>

        {/* Security Banner */}

        <motion.section
          className="profile-security-banner"
          initial={{
            opacity: 0,
            y: 25,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.7,
            delay: 0.28,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <div className="security-banner-icon">
            <ShieldCheck size={21} />
          </div>

          <div>
            <strong>
              {t("profile.protected")}
            </strong>

            <p>
              {t("profile.protectedHint")}
            </p>
          </div>

          <span className="security-verified">
            {profileUser?.isVerified
              ? t("profile.verified")
              : t("profile.notVerified")}
          </span>
        </motion.section>
      </main>

      {/* =================================================
          EDIT PROFILE MODAL
      ================================================= */}

      <AnimatePresence>
        {editOpen && (
          <motion.div
            className="profile-modal-overlay"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            onMouseDown={(e) => {
              if (
                e.target === e.currentTarget
              ) {
                setEditOpen(false);
              }
            }}
          >
            <motion.div
              className="profile-edit-modal"
              initial={{
                opacity: 0,
                y: 25,
                scale: 0.97,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 20,
                scale: 0.97,
              }}
            >
              {/* Modal Header */}

              <div className="profile-modal-header">
                <div>
                  <span>
                    {t("profile.eyebrow")}
                  </span>

                  <h2>
                    {t("profile.editTitle")}
                  </h2>

                  <p>
                    {t("profile.editHint")}
                  </p>
                </div>

                <button
                  type="button"
                  className="profile-modal-close"
                  onClick={() =>
                    setEditOpen(false)
                  }
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form */}

              <form
                className="profile-edit-form"
                onSubmit={handleUpdateProfile}
              >
                {/* Name */}

                <div className="profile-form-field">
                  <label>
                    <UserRound size={14} />
                    {t("profile.fullName")}
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={
                      handleInputChange
                    }
                    placeholder={t("profile.namePh")}
                  />
                </div>

                {/* Email */}

                <div className="profile-form-field">
                  <label>
                    <Mail size={14} />
                    {t("profile.emailAddr")}
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={
                      handleInputChange
                    }
                    placeholder="you@example.com"
                  />
                </div>

                {/* Occupation */}

                <div className="profile-form-field">
                  <label>
                    <BriefcaseBusiness
                      size={14}
                    />
                    {t("profile.occupation")}
                  </label>

                  <input
                    type="text"
                    name="occupation"
                    value={
                      formData.occupation
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder={t("profile.occupationPh")}
                  />
                </div>

                {/* Modal Message */}

                {message.text && (
                  <div
                    className={`profile-modal-message ${
                      message.type ===
                      "error"
                        ? "error"
                        : "success"
                    }`}
                  >
                    {message.text}
                  </div>
                )}

                {/* Actions */}

                <div className="profile-modal-actions">
                  <button
                    type="button"
                    className="profile-modal-cancel"
                    onClick={() =>
                      setEditOpen(false)
                    }
                  >
                    {t("profile.cancel")}
                  </button>

                  <button
                    type="submit"
                    className="profile-modal-save"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <LoaderCircle
                          size={15}
                          className="profile-loading-icon"
                        />
                        {t("profile.saving")}
                      </>
                    ) : (
                      <>
                        <Save size={15} />
                        {t("profile.saveChanges")}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =================================================
          SECURITY MODAL
      ================================================= */}

      <AnimatePresence>
        {securityOpen && (
          <motion.div
            className="profile-modal-overlay"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            onMouseDown={(e) => {
              if (
                e.target === e.currentTarget &&
                !passwordSaving
              ) {
                setSecurityOpen(false);
              }
            }}
          >
            <motion.div
              className="profile-edit-modal"
              initial={{
                opacity: 0,
                y: 25,
                scale: 0.97,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 20,
                scale: 0.97,
              }}
            >
              {/* Header */}

              <div className="profile-modal-header">
                <div>
                  <span>
                    {t("settings.security")}
                  </span>

                  <h2>
                    {t("profile.changePass")}
                  </h2>

                  <p>
                    {t("profile.changePassHint")}
                  </p>
                </div>

                <button
                  type="button"
                  className="profile-modal-close"
                  onClick={() =>
                    !passwordSaving &&
                    setSecurityOpen(false)
                  }
                >
                  <X size={18} />
                </button>
              </div>

              {/* Password Form */}

              <form
                className="profile-edit-form"
                onSubmit={handleChangePassword}
              >
                {/* Current Password */}

                <div className="profile-form-field">
                  <label>
                    <LockKeyhole size={14} />
                    {t("profile.currentPass")}
                  </label>

                  <div className="profile-password-wrapper">
                    <input
                      type={
                        showCurrentPassword
                          ? "text"
                          : "password"
                      }
                      name="currentPassword"
                      value={
                        passwordData.currentPassword
                      }
                      onChange={
                        handlePasswordChange
                      }
                      placeholder={t("profile.currentPassPh")}
                      autoComplete="current-password"
                    />

                    <button
                      type="button"
                      className="profile-password-toggle"
                      onClick={() =>
                        setShowCurrentPassword(
                          (prev) => !prev
                        )
                      }
                    >
                      {showCurrentPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}

                <div className="profile-form-field">
                  <label>
                    <LockKeyhole size={14} />
                    {t("profile.newPass")}
                  </label>

                  <div className="profile-password-wrapper">
                    <input
                      type={
                        showNewPassword
                          ? "text"
                          : "password"
                      }
                      name="newPassword"
                      value={
                        passwordData.newPassword
                      }
                      onChange={
                        handlePasswordChange
                      }
                      placeholder={t("profile.newPassPh")}
                      autoComplete="new-password"
                    />

                    <button
                      type="button"
                      className="profile-password-toggle"
                      onClick={() =>
                        setShowNewPassword(
                          (prev) => !prev
                        )
                      }
                    >
                      {showNewPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}

                <div className="profile-form-field">
                  <label>
                    <LockKeyhole size={14} />
                    {t("profile.confirmPass")}
                  </label>

                  <div className="profile-password-wrapper">
                    <input
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      name="confirmPassword"
                      value={
                        passwordData.confirmPassword
                      }
                      onChange={
                        handlePasswordChange
                      }
                      placeholder={t("profile.confirmPassPh")}
                      autoComplete="new-password"
                    />

                    <button
                      type="button"
                      className="profile-password-toggle"
                      onClick={() =>
                        setShowConfirmPassword(
                          (prev) => !prev
                        )
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Message */}

                {message.text && (
                  <div
                    className={`profile-modal-message ${
                      message.type ===
                      "error"
                        ? "error"
                        : "success"
                    }`}
                  >
                    {message.text}
                  </div>
                )}

                {/* Actions */}

                <div className="profile-modal-actions">
                  <button
                    type="button"
                    className="profile-modal-cancel"
                    onClick={() =>
                      !passwordSaving &&
                      setSecurityOpen(false)
                    }
                    disabled={passwordSaving}
                  >
                    {t("profile.cancel")}
                  </button>

                  <button
                    type="submit"
                    className="profile-modal-save"
                    disabled={passwordSaving}
                  >
                    {passwordSaving ? (
                      <>
                        <LoaderCircle
                          size={15}
                          className="profile-loading-icon"
                        />
                        {t("profile.updating")}
                      </>
                    ) : (
                      <>
                        <ShieldCheck
                          size={15}
                        />
                        {t("profile.updatePass")}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =================================================
          NOTIFICATIONS MODAL
      ================================================= */}

      <AnimatePresence>
        {notificationsOpen && (
          <motion.div
            className="profile-modal-overlay"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            onMouseDown={(e) => {
              if (
                e.target === e.currentTarget &&
                !notificationsSaving
              ) {
                setNotificationsOpen(false);
              }
            }}
          >
            <motion.div
              className="profile-edit-modal profile-notifications-modal"
              initial={{
                opacity: 0,
                y: 25,
                scale: 0.97,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 20,
                scale: 0.97,
              }}
            >
              {/* Header */}

              <div className="profile-modal-header">
                <div>
                  <span>
                    PREFERENCES
                  </span>

                  <h2>
                    {t("profile.notifTitle")}
                  </h2>

                  <p>
                    {t("profile.notifHint")}
                  </p>
                </div>

                <button
                  type="button"
                  className="profile-modal-close"
                  onClick={() =>
                    !notificationsSaving &&
                    setNotificationsOpen(false)
                  }
                >
                  <X size={18} />
                </button>
              </div>

              {notificationsLoading ? (
                <div className="profile-settings-loading">
                  <LoaderCircle
                    size={25}
                    className="profile-loading-icon"
                  />

                  <span>
                    {t("profile.loadingPrefs")}
                  </span>
                </div>
              ) : (
                <div className="profile-notification-settings">
                  {/* Email */}

                  <div className="profile-notification-row">
                    <div className="profile-notification-icon">
                      <Mail size={18} />
                    </div>

                    <div className="profile-notification-content">
                      <strong>
                        {t("profile.emailNotif")}
                      </strong>

                      <span>
                        {t("profile.emailNotifHint")}
                      </span>
                    </div>

                    <button
                      type="button"
                      className={`profile-toggle ${
                        settings.emailNotifications
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        handleNotificationToggle(
                          "emailNotifications"
                        )
                      }
                      disabled={
                        notificationsSaving
                      }
                      aria-label="Toggle email notifications"
                      aria-pressed={
                        settings.emailNotifications
                      }
                    >
                      <span />
                    </button>
                  </div>

                  {/* Bill */}

                  <div className="profile-notification-row">
                    <div className="profile-notification-icon">
                      <CreditCard size={18} />
                    </div>

                    <div className="profile-notification-content">
                      <strong>
                        {t("profile.billRem")}
                      </strong>

                      <span>
                        {t("profile.billRemHint")}
                      </span>
                    </div>

                    <button
                      type="button"
                      className={`profile-toggle ${
                        settings.billReminders
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        handleNotificationToggle(
                          "billReminders"
                        )
                      }
                      disabled={
                        notificationsSaving
                      }
                      aria-label="Toggle bill reminders"
                      aria-pressed={
                        settings.billReminders
                      }
                    >
                      <span />
                    </button>
                  </div>

                  {/* Subscription */}

                  <div className="profile-notification-row">
                    <div className="profile-notification-icon">
                      <Bell size={18} />
                    </div>

                    <div className="profile-notification-content">
                      <strong>
                        {t("profile.subRem")}
                      </strong>

                      <span>
                        {t("profile.subRemHint")}
                      </span>
                    </div>

                    <button
                      type="button"
                      className={`profile-toggle ${
                        settings.subscriptionReminders
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        handleNotificationToggle(
                          "subscriptionReminders"
                        )
                      }
                      disabled={
                        notificationsSaving
                      }
                      aria-label="Toggle subscription reminders"
                      aria-pressed={
                        settings.subscriptionReminders
                      }
                    >
                      <span />
                    </button>
                  </div>

                  {/* Installment */}

                  <div className="profile-notification-row">
                    <div className="profile-notification-icon">
                      <WalletCards size={18} />
                    </div>

                    <div className="profile-notification-content">
                      <strong>
                        {t("profile.instRem")}
                      </strong>

                      <span>
                        {t("profile.instRemHint")}
                      </span>
                    </div>

                    <button
                      type="button"
                      className={`profile-toggle ${
                        settings.installmentReminders
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        handleNotificationToggle(
                          "installmentReminders"
                        )
                      }
                      disabled={
                        notificationsSaving
                      }
                      aria-label="Toggle installment reminders"
                      aria-pressed={
                        settings.installmentReminders
                      }
                    >
                      <span />
                    </button>
                  </div>

                  {/* Goal */}

                  <div className="profile-notification-row">
                    <div className="profile-notification-icon">
                      <Sparkles size={18} />
                    </div>

                    <div className="profile-notification-content">
                      <strong>
                        {t("profile.goalRem")}
                      </strong>

                      <span>
                        {t("profile.goalRemHint")}
                      </span>
                    </div>

                    <button
                      type="button"
                      className={`profile-toggle ${
                        settings.goalReminders
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        handleNotificationToggle(
                          "goalReminders"
                        )
                      }
                      disabled={
                        notificationsSaving
                      }
                      aria-label="Toggle goal reminders"
                      aria-pressed={
                        settings.goalReminders
                      }
                    >
                      <span />
                    </button>
                  </div>
                </div>
              )}

              {/* Footer */}

              <div className="profile-notifications-footer">
                <div>
                  <ShieldCheck size={15} />

                  <span>
                    {t("profile.prefsSaved")}
                  </span>
                </div>

                <button
                  type="button"
                  className="profile-modal-cancel"
                  onClick={() =>
                    !notificationsSaving &&
                    setNotificationsOpen(false)
                  }
                  disabled={notificationsSaving}
                >
                  {t("profile.done")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;