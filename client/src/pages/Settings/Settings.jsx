import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

import "./Settings.css";
import { useLanguage } from "../../context/LanguageContext";
import LanguageToggle from "../../components/LanguageToggle/LanguageToggle";

const API_URL = "/settings";
const PROFILE_API_URL = "/users/profile";

function Settings() {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState("general");

    const [settings, setSettings] = useState({
        language: "English",
        currency: "EGP",
        monthStart: 1,

        emailNotifications: true,
        billReminders: true,
        subscriptionReminders: true,
        installmentReminders: true,
        goalReminders: true,

        theme: "dark",
        accentColor: "#7d5cff",
    });

    const [showPassword, setShowPassword] = useState(false);

    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [loadingSettings, setLoadingSettings] = useState(true);
    const [savingSettings, setSavingSettings] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [deletingAccount, setDeletingAccount] = useState(false);
    const [backupLoading, setBackupLoading] = useState(false);
    const [importLoading, setImportLoading] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // User's real subscription plan (from profile membership)
    const [membership, setMembership] = useState(null);

    const token = localStorage.getItem("token");

    // ==========================================
    // APPLY THEME
    // ==========================================

    const applyTheme = (data) => {
        document.documentElement.setAttribute(
            "data-theme",
            data.theme
        );

        document.documentElement.style.setProperty(
            "--velora-accent",
            data.accentColor
        );

        localStorage.setItem(
            "velora-theme",
            data.theme
        );

        localStorage.setItem(
            "velora-accent",
            data.accentColor
        );
    };

    // ==========================================
    // GET SETTINGS
    // ==========================================

    const fetchSettings = async () => {
        try {
            setLoadingSettings(true);
            setError("");

            const response = await api.get(API_URL, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.success) {
                const data = response.data.settings;

                const loadedSettings = {
                    language: data.language || "English",
                    currency: data.currency || "EGP",
                    monthStart: data.monthStart || 1,

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

                    theme: data.theme || "dark",

                    accentColor:
                        data.accentColor || "#7d5cff",
                };

                setSettings(loadedSettings);

                // Save locally
                localStorage.setItem(
                    "velora-settings",
                    JSON.stringify(loadedSettings)
                );

                window.dispatchEvent(
                    new Event("velora-settings-changed")
                );

                // Apply theme
                applyTheme(loadedSettings);
            }
        } catch (err) {
            console.error("Settings Error:", err);

            setError(
                err.response?.data?.message ||
                "Failed to load settings."
            );
        } finally {
            setLoadingSettings(false);
        }
    };

    // ==========================================
    // GET USER MEMBERSHIP (real plan)
    // GET /users/profile -> { membership: { plan, status, ... } }
    // ==========================================

    const fetchMembership = async () => {
        try {
            const response = await api.get(
                PROFILE_API_URL,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data?.success) {
                setMembership(
                    response.data.membership || null
                );
            }
        } catch (err) {
            console.error(
                "Membership Error:",
                err.response?.data || err.message
            );
            // Non-blocking: subscription card falls back to Free tier
        }
    };

    // ==========================================
    // PLAN HELPERS (dynamic, from membership)
    // ==========================================

    const getPlanTier = () => {
        const name = membership?.plan?.name;
        if (typeof name === "string") {
            const tier = name.toLowerCase();
            if (["free", "premium", "family"].includes(tier)) {
                return tier;
            }
        }
        return "free";
    };

    const getPlanDisplayName = () => {
        const tier = getPlanTier();
        if (tier === "family") return t("settings.planFamily");
        if (tier === "free") return t("settings.planFree");
        return t("settings.premium");
    };

    const getPlanPrice = () => {
        const backendPrice = Number(membership?.plan?.monthlyPrice);
        if (Number.isFinite(backendPrice)) {
            return backendPrice;
        }
        const fallback = { free: 0, premium: 150, family: 200 };
        return fallback[getPlanTier()] ?? 0;
    };

    const getPlanDescription = () => {
        if (membership?.plan?.description) {
            return membership.plan.description;
        }
        const tier = getPlanTier();
        if (tier === "family") return t("settings.familyHint");
        if (tier === "free") return t("settings.freeHint");
        return t("settings.premiumHint");
    };

    const getPlanFeatures = () => {
        const backendFeatures = membership?.plan?.features;
        if (
            Array.isArray(backendFeatures) &&
            backendFeatures.length > 0
        ) {
            return backendFeatures;
        }
        const tier = getPlanTier();
        if (tier === "family") return t("settings.familyFeatures");
        if (tier === "free") return t("settings.freeFeatures");
        return t("settings.premiumFeatures");
    };

    // ==========================================
    // INITIAL LOAD
    // ==========================================

    useEffect(() => {
        fetchSettings();
        fetchMembership();
    }, []);

    // ==========================================
    // UPDATE LOCAL SETTING
    // ==========================================

    const updateSetting = (key, value) => {
        setSettings((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    // ==========================================
    // SAVE SETTINGS
    // ==========================================

    const saveSettings = async () => {
        try {
            setSavingSettings(true);
            setMessage("");
            setError("");

            const response = await api.put(
                API_URL,
                {
                    language: settings.language,
                    currency: settings.currency,
                    monthStart: Number(settings.monthStart),

                    emailNotifications:
                        settings.emailNotifications,

                    billReminders:
                        settings.billReminders,

                    subscriptionReminders:
                        settings.subscriptionReminders,

                    installmentReminders:
                        settings.installmentReminders,

                    goalReminders:
                        settings.goalReminders,

                    theme: settings.theme,

                    accentColor:
                        settings.accentColor,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                const updatedSettings =
                    response.data.settings;

                setSettings({
                    language:
                        updatedSettings.language,

                    currency:
                        updatedSettings.currency,

                    monthStart:
                        updatedSettings.monthStart,

                    emailNotifications:
                        updatedSettings.emailNotifications,

                    billReminders:
                        updatedSettings.billReminders,

                    subscriptionReminders:
                        updatedSettings.subscriptionReminders,

                    installmentReminders:
                        updatedSettings.installmentReminders,

                    goalReminders:
                        updatedSettings.goalReminders,

                    theme:
                        updatedSettings.theme,

                    accentColor:
                        updatedSettings.accentColor,
                });

                localStorage.setItem(
                    "velora-settings",
                    JSON.stringify(updatedSettings)
                );

                window.dispatchEvent(
                    new Event("velora-settings-changed")
                );

                applyTheme(updatedSettings);

                setMessage(
                    "Settings saved successfully."
                );
            }
        } catch (err) {
            console.error("Save Settings Error:", err);

            setError(
                err.response?.data?.message ||
                "Failed to save settings."
            );
        } finally {
            setSavingSettings(false);
        }
    };

    // ==========================================
    // CHANGE PASSWORD
    // ==========================================

    const handlePasswordChange = async () => {
        try {
            setPasswordLoading(true);
            setMessage("");
            setError("");

            const response = await api.put(
                `${API_URL}/password`,
                passwords,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                setMessage(
                    "Password updated successfully."
                );

                setPasswords({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                });
            }
        } catch (err) {
            console.error(
                "Password Error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to update password."
            );
        } finally {
            setPasswordLoading(false);
        }
    };

    // ==========================================
    // DELETE ACCOUNT
    // ==========================================

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to permanently delete your Velora account?"
        );

        if (!confirmed) return;

        const secondConfirm = window.confirm(
            "This action cannot be undone. Do you really want to continue?"
        );

        if (!secondConfirm) return;

        try {
            setDeletingAccount(true);
            setMessage("");
            setError("");

            const response = await api.delete(
                `${API_URL}/account`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                localStorage.removeItem("token");
                localStorage.removeItem(
                    "velora-settings"
                );
                localStorage.removeItem(
                    "velora-theme"
                );
                localStorage.removeItem(
                    "velora-accent"
                );

                window.location.href = "/login";
            }
        } catch (err) {
            console.error(
                "Delete Account Error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to delete account."
            );
        } finally {
            setDeletingAccount(false);
        }
    };

    // ==========================================
    // BACKUP EXPORT / IMPORT
    // ==========================================

    const handleExportBackup = async () => {
        try {
            setBackupLoading(true);
            setMessage("");
            setError("");

            const response = await api.get(
                "/backup/export"
            );

            const blob = new Blob(
                [JSON.stringify(response.data?.backup || {}, null, 2)],
                { type: "application/json" }
            );

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            const stamp = new Date().toISOString().split("T")[0];
            link.href = url;
            link.download = `velora-backup-${stamp}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setMessage(t("settings.backupSaved"));
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to export backup."
            );
        } finally {
            setBackupLoading(false);
        }
    };

    const handleImportBackup = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = "";

        if (!file) return;

        const confirmed = window.confirm(
            t("settings.importConfirm")
        );

        if (!confirmed) return;

        try {
            setImportLoading(true);
            setMessage("");
            setError("");

            const text = await file.text();
            const backup = JSON.parse(text);

            const response = await api.post(
                "/backup/import",
                { backup }
            );

            if (response.data?.success) {
                setMessage(t("settings.importSuccess"));
                await fetchSettings();
                await fetchMembership();
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                t("settings.importInvalid")
            );
        } finally {
            setImportLoading(false);
        }
    };

    // ==========================================
    // LOGOUT
    // ==========================================

    const handleLogout = () => {
        localStorage.removeItem("token");

        window.location.href = "/login";
    };

    // ==========================================
    // MENU
    // ==========================================

    const menuItems = [
        {
            id: "general",
            icon: "⚙",
            title: t("settings.general"),
            description: t("settings.generalDesc"),
        },
        {
            id: "notifications",
            icon: "◉",
            title: t("settings.notifications"),
            description: t("settings.notificationsDesc"),
        },
        {
            id: "appearance",
            icon: "◐",
            title: t("settings.appearance"),
            description: t("settings.appearanceDesc"),
        },
        {
            id: "security",
            icon: "⌁",
            title: t("settings.security"),
            description: t("settings.securityDesc"),
        },
        {
            id: "subscription",
            icon: "◇",
            title: t("settings.subscription"),
            description: t("settings.subscriptionDesc"),
        },
        {
            id: "backup",
            icon: "⛁",
            title: t("settings.backup"),
            description: t("settings.backupDesc"),
        },
        {
            id: "danger",
            icon: "!",
            title: t("settings.danger"),
            description: t("settings.dangerDesc"),
        },
    ];

    // ==========================================
    // LOADING
    // ==========================================

    if (loadingSettings) {
        return (
            <div className="settings-page">
                <div className="settings-loading">
                    <div className="settings-loader"></div>

                    <p>
                        {t("settings.loading")}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="settings-page">

            {/* =========================
                TOP
            ========================= */}

            <div className="settings-top">

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Link
                    to="/dashboard"
                    className="settings-back"
                >
                    <span>←</span>
                    {t("settings.back")}
                </Link>
                    <LanguageToggle variant="dashboard" />
                </div>

                <div className="settings-heading">

                    <div className="settings-eyebrow">
                        <span>✦</span>
                        {t("settings.eyebrow")}
                    </div>

                    <h1>
                        {t("settings.title")}
                    </h1>

                    <p>
                        {t("settings.subtitle")}
                    </p>

                </div>

            </div>

            {/* =========================
                ALERTS
            ========================= */}

            <div className="settings-alert-wrapper">

                {message && (
                    <div className="settings-success">
                        <span>✓</span>
                        {message}
                    </div>
                )}

                {error && (
                    <div className="settings-error">
                        <span>!</span>
                        {error}
                    </div>
                )}

            </div>

            {/* =========================
                LAYOUT
            ========================= */}

            <div className="settings-container">

                {/* =========================
                    SIDEBAR
                ========================= */}

                <aside className="settings-sidebar">

                    <div className="settings-sidebar-title">
                        {t("settings.sidebarTitle")}
                    </div>

                    <div className="settings-menu">

                        {menuItems.map((item) => (

                            <button
                                key={item.id}
                                className={`settings-menu-item ${
                                    activeSection === item.id
                                        ? "active"
                                        : ""
                                }`}
                                onClick={() =>
                                    setActiveSection(
                                        item.id
                                    )
                                }
                            >

                                <span className="settings-menu-icon">
                                    {item.icon}
                                </span>

                                <span className="settings-menu-text">

                                    <strong>
                                        {item.title}
                                    </strong>

                                    <small>
                                        {item.description}
                                    </small>

                                </span>

                                <span className="settings-menu-arrow">
                                    →
                                </span>

                            </button>

                        ))}

                    </div>

                </aside>

                {/* =========================
                    CONTENT
                ========================= */}

                <main className="settings-content">

                    {/* =========================
                        GENERAL
                    ========================= */}

                    {activeSection === "general" && (

                        <section className="settings-section">

                            <SectionHeader
                                eyebrow={t("settings.generalEyebrow")}
                                title={t("settings.generalTitle")}
                                description={t("settings.generalHint")}
                            />

                            <div className="settings-card">

                                <SettingRow
                                    title={t("settings.language")}
                                    description={t("settings.languageHint")}
                                >

                                    <select
                                        value={settings.language}
                                        onChange={(e) =>
                                            updateSetting(
                                                "language",
                                                e.target.value
                                            )
                                        }
                                    >

                                        <option value="English">
                                            English
                                        </option>

                                        <option value="Arabic">
                                            العربية
                                        </option>

                                    </select>

                                </SettingRow>

                                <SettingRow
                                    title={t("settings.currency")}
                                    description={t("settings.currencyHint")}
                                >

                                    <select
                                        value={settings.currency}
                                        onChange={(e) =>
                                            updateSetting(
                                                "currency",
                                                e.target.value
                                            )
                                        }
                                    >

                                        <option value="EGP">
                                            EGP — Egyptian Pound
                                        </option>

                                        <option value="USD">
                                            USD — US Dollar
                                        </option>

                                        <option value="EUR">
                                            EUR — Euro
                                        </option>

                                    </select>

                                </SettingRow>

                                <SettingRow
                                    title={t("settings.monthStart")}
                                    description={t("settings.monthStartHint")}
                                >

                                    <select
                                        value={settings.monthStart}
                                        onChange={(e) =>
                                            updateSetting(
                                                "monthStart",
                                                Number(
                                                    e.target.value
                                                )
                                            )
                                        }
                                    >

                                        <option value={1}>
                                            {t("settings.firstDay")}
                                        </option>

                                        <option value={15}>
                                            {t("settings.fifteenthDay")}
                                        </option>

                                    </select>

                                </SettingRow>

                            </div>

                            <div className="settings-save-row">

                                <button
                                    className="settings-save-button"
                                    onClick={saveSettings}
                                    disabled={savingSettings}
                                >
                                    {savingSettings
                                        ? t("settings.saving")
                                        : t("settings.saveChanges")}
                                </button>

                            </div>

                        </section>
                    )}

                    {/* =========================
                        NOTIFICATIONS
                    ========================= */}

                    {activeSection === "notifications" && (

                        <section className="settings-section">

                            <SectionHeader
                                eyebrow={t("settings.notifEyebrow")}
                                title={t("settings.notifTitle")}
                                description={t("settings.notifHint")}
                            />

                            <div className="settings-card">

                                <ToggleRow
                                    title={t("settings.emailNotif")}
                                    description={t("settings.emailNotifHint")}
                                    enabled={
                                        settings.emailNotifications
                                    }
                                    onChange={(value) =>
                                        updateSetting(
                                            "emailNotifications",
                                            value
                                        )
                                    }
                                />

                                <ToggleRow
                                    title={t("settings.billRem")}
                                    description={t("settings.billRemHint")}
                                    enabled={
                                        settings.billReminders
                                    }
                                    onChange={(value) =>
                                        updateSetting(
                                            "billReminders",
                                            value
                                        )
                                    }
                                />

                                <ToggleRow
                                    title={t("settings.subRem")}
                                    description={t("settings.subRemHint")}
                                    enabled={
                                        settings.subscriptionReminders
                                    }
                                    onChange={(value) =>
                                        updateSetting(
                                            "subscriptionReminders",
                                            value
                                        )
                                    }
                                />

                                <ToggleRow
                                    title={t("settings.instRem")}
                                    description={t("settings.instRemHint")}
                                    enabled={
                                        settings.installmentReminders
                                    }
                                    onChange={(value) =>
                                        updateSetting(
                                            "installmentReminders",
                                            value
                                        )
                                    }
                                />

                                <ToggleRow
                                    title={t("settings.goalRem")}
                                    description={t("settings.goalRemHint")}
                                    enabled={
                                        settings.goalReminders
                                    }
                                    onChange={(value) =>
                                        updateSetting(
                                            "goalReminders",
                                            value
                                        )
                                    }
                                />

                            </div>

                            <div className="settings-save-row">

                                <button
                                    className="settings-save-button"
                                    onClick={saveSettings}
                                    disabled={savingSettings}
                                >
                                    {savingSettings
                                        ? t("settings.saving")
                                        : t("settings.savePrefs")}
                                </button>

                            </div>

                        </section>
                    )}

                    {/* =========================
                        APPEARANCE
                    ========================= */}

                    {activeSection === "appearance" && (

                        <section className="settings-section">

                            <SectionHeader
                                eyebrow={t("settings.appearEyebrow")}
                                title={t("settings.appearTitle")}
                                description={t("settings.appearHint")}
                            />

                            {/* THEME */}

                            <div className="settings-card">

                                <div className="appearance-title">

                                    <div>

                                        <strong>
                                            {t("settings.theme")}
                                        </strong>

                                        <span>
                                            {t("settings.themeHint")}
                                        </span>

                                    </div>

                                </div>

                                <div className="theme-grid">

                                    {/* DARK */}

                                    <button
                                        className={`theme-option ${
                                            settings.theme === "dark"
                                                ? "selected"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            updateSetting(
                                                "theme",
                                                "dark"
                                            )
                                        }
                                    >

                                        <div className="theme-preview dark-preview">

                                            <div className="preview-top"></div>

                                            <div className="preview-content">
                                                <span></span>
                                                <span></span>
                                                <span></span>
                                            </div>

                                        </div>

                                        <div className="theme-label">

                                            <strong>
                                                {t("settings.dark")}
                                            </strong>

                                            <span>
                                                {t("settings.darkHint")}
                                            </span>

                                        </div>

                                    </button>

                                    {/* LIGHT */}

                                    <button
                                        className={`theme-option ${
                                            settings.theme === "light"
                                                ? "selected"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            updateSetting(
                                                "theme",
                                                "light"
                                            )
                                        }
                                    >

                                        <div className="theme-preview light-preview">

                                            <div className="preview-top"></div>

                                            <div className="preview-content">
                                                <span></span>
                                                <span></span>
                                                <span></span>
                                            </div>

                                        </div>

                                        <div className="theme-label">

                                            <strong>
                                                {t("settings.light")}
                                            </strong>

                                            <span>
                                                {t("settings.lightHint")}
                                            </span>

                                        </div>

                                    </button>

                                </div>

                            </div>

                            {/* ACCENT */}

                            <div className="settings-card">

                                <div className="appearance-title">

                                    <div>

                                        <strong>
                                            {t("settings.accent")}
                                        </strong>

                                        <span>
                                            {t("settings.accentHint")}
                                        </span>

                                    </div>

                                </div>

                                <div className="accent-options">

                                    {[
                                        "#7d5cff",
                                        "#4f8cff",
                                        "#23c483",
                                        "#ff6b9d",
                                    ].map((color) => (

                                        <button
                                            key={color}
                                            className={`accent-option ${
                                                settings.accentColor === color
                                                    ? "active"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                updateSetting(
                                                    "accentColor",
                                                    color
                                                )
                                            }
                                        >

                                            <span
                                                style={{
                                                    background:
                                                        color,
                                                }}
                                            ></span>

                                        </button>

                                    ))}

                                </div>

                            </div>

                            <div className="settings-save-row">

                                <button
                                    className="settings-save-button"
                                    onClick={saveSettings}
                                    disabled={savingSettings}
                                >
                                    {savingSettings
                                        ? t("settings.saving")
                                        : t("settings.saveAppearance")}
                                </button>

                            </div>

                        </section>
                    )}

                    {/* =========================
                        SECURITY
                    ========================= */}

                    {activeSection === "security" && (

                        <section className="settings-section">

                            <SectionHeader
                                eyebrow={t("settings.secEyebrow")}
                                title={t("settings.secTitle")}
                                description={t("settings.secHint")}
                            />

                            <div className="settings-card">

                                <div className="password-header">

                                    <div>

                                        <strong>
                                            {t("settings.changePass")}
                                        </strong>

                                        <span>
                                            {t("settings.changePassHint")}
                                        </span>

                                    </div>

                                </div>

                                <div className="password-form">

                                    <label>
                                        {t("settings.currentPass")}
                                    </label>

                                    <input
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        placeholder={t("settings.currentPassPh")}
                                        value={
                                            passwords.currentPassword
                                        }
                                        onChange={(e) =>
                                            setPasswords({
                                                ...passwords,
                                                currentPassword:
                                                    e.target.value,
                                            })
                                        }
                                    />

                                    <label>
                                        {t("settings.newPass")}
                                    </label>

                                    <input
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        placeholder={t("settings.newPassPh")}
                                        value={
                                            passwords.newPassword
                                        }
                                        onChange={(e) =>
                                            setPasswords({
                                                ...passwords,
                                                newPassword:
                                                    e.target.value,
                                            })
                                        }
                                    />

                                    <label>
                                        {t("settings.confirmPass")}
                                    </label>

                                    <input
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        placeholder={t("settings.confirmPassPh")}
                                        value={
                                            passwords.confirmPassword
                                        }
                                        onChange={(e) =>
                                            setPasswords({
                                                ...passwords,
                                                confirmPassword:
                                                    e.target.value,
                                            })
                                        }
                                    />

                                    <label className="password-toggle">

                                        <input
                                            type="checkbox"
                                            checked={showPassword}
                                            onChange={(e) =>
                                                setShowPassword(
                                                    e.target.checked
                                                )
                                            }
                                        />

                                        <span>
                                            {t("settings.showPass")}
                                        </span>

                                    </label>

                                    <button
                                        className="settings-save-button"
                                        onClick={
                                            handlePasswordChange
                                        }
                                        disabled={
                                            passwordLoading
                                        }
                                    >
                                        {passwordLoading
                                            ? t("settings.updating")
                                            : t("settings.updatePass")}
                                    </button>

                                </div>

                            </div>

                            {/* CURRENT SESSION */}

                            <div className="settings-card">

                                <div className="security-session">

                                    <div>

                                        <strong>
                                            {t("settings.currentSession")}
                                        </strong>

                                        <span>
                                            {t("settings.thisDevice")}
                                        </span>

                                    </div>

                                    <span className="session-active">
                                        {t("settings.active")}
                                    </span>

                                </div>

                            </div>

                            {/* LOGOUT */}

                            <div className="settings-card logout-card">

                                <div>

                                    <strong>
                                        {t("settings.signOut")}
                                    </strong>

                                    <span>
                                        {t("settings.signOutHint")}
                                    </span>

                                </div>

                                <button
                                    className="logout-button"
                                    onClick={handleLogout}
                                >
                                    {t("settings.signOutBtn")}
                                </button>

                            </div>

                        </section>
                    )}

                    {/* =========================
                        SUBSCRIPTION
                    ========================= */}

                    {activeSection === "subscription" && (

                        <section className="settings-section">

                            <SectionHeader
                                eyebrow={t("settings.subEyebrow")}
                                title={t("settings.subTitle")}
                                description={t("settings.subHint")}
                            />

                            <div className="subscription-card">

                                <div className="subscription-glow"></div>

                                <div className="subscription-top">

                                    <div>

                                        <span>
                                            {t("settings.currentPlan")}
                                        </span>

                                        <h2>
                                            {getPlanDisplayName()}
                                        </h2>

                                        <p>
                                            {getPlanDescription()}
                                        </p>

                                    </div>

                                    <div className="subscription-price">

                                        <strong>
                                            {getPlanPrice() === 0
                                                ? t("settings.freePrice")
                                                : getPlanPrice()}
                                        </strong>

                                        {getPlanPrice() !== 0 && (
                                            <span>
                                                {settings.currency}{" "}
                                                {t("settings.perMonth")}
                                            </span>
                                        )}

                                    </div>

                                </div>

                                <div className="subscription-divider"></div>

                                <div className="subscription-features">

                                    {getPlanFeatures().map(
                                        (feature) => (
                                            <span key={feature}>
                                                ✓ {feature}
                                            </span>
                                        )
                                    )}

                                </div>

                                <button
                                    className="manage-plan-button"
                                    onClick={() =>
                                        navigate("/plans")
                                    }
                                >
                                    {t("settings.manageSub")}
                                </button>

                            </div>

                            <div className="billing-note">

                                <span>
                                    ◇
                                </span>

                                <p>
                                    {t("settings.billingNote")}
                                </p>

                            </div>

                        </section>
                    )}

                    {/* =========================
                        BACKUP
                    ========================= */}

                    {activeSection === "backup" && (

                        <section className="settings-section">

                            <SectionHeader
                                eyebrow={t("settings.backupEyebrow")}
                                title={t("settings.backupTitle")}
                                description={t("settings.backupHint")}
                            />

                            <div className="settings-card">

                                <SettingRow
                                    title={t("settings.exportTitle")}
                                    description={t("settings.exportHint")}
                                >

                                    <button
                                        className="settings-save-button"
                                        onClick={handleExportBackup}
                                        disabled={backupLoading}
                                    >
                                        {backupLoading
                                            ? t("settings.saving")
                                            : t("settings.exportBtn")}
                                    </button>

                                </SettingRow>

                                <SettingRow
                                    title={t("settings.importTitle")}
                                    description={t("settings.importHint")}
                                >

                                    <label className="settings-save-button settings-file-label">
                                        {importLoading
                                            ? t("settings.saving")
                                            : t("settings.importBtn")}
                                        <input
                                            type="file"
                                            accept="application/json,.json"
                                            hidden
                                            disabled={importLoading}
                                            onChange={handleImportBackup}
                                        />
                                    </label>

                                </SettingRow>

                            </div>

                            <div className="billing-note">

                                <span>
                                    ⛁
                                </span>

                                <p>
                                    {t("settings.backupNote")}
                                </p>

                            </div>

                        </section>
                    )}

                    {/* =========================
                        DANGER ZONE
                    ========================= */}

                    {activeSection === "danger" && (

                        <section className="settings-section">

                            <SectionHeader
                                eyebrow={t("settings.dangerEyebrow")}
                                title={t("settings.dangerTitle")}
                                description={t("settings.dangerHint")}
                            />

                            <div className="danger-card">

                                <div className="danger-icon">
                                    !
                                </div>

                                <div className="danger-content">

                                    <h3>
                                        {t("settings.deleteAccount")}
                                    </h3>

                                    <p>
                                        {t("settings.deleteHint")}
                                    </p>

                                    <button
                                        className="delete-button"
                                        onClick={
                                            handleDeleteAccount
                                        }
                                        disabled={
                                            deletingAccount
                                        }
                                    >
                                        {deletingAccount
                                            ? t("settings.deleting")
                                            : t("settings.deleteBtn")}
                                    </button>

                                </div>

                            </div>

                        </section>
                    )}

                </main>

            </div>

        </div>
    );
}

// ==========================================
// SECTION HEADER
// ==========================================

function SectionHeader({
    eyebrow,
    title,
    description,
}) {
    return (
        <div className="section-header">

            <span>
                {eyebrow}
            </span>

            <h2>
                {title}
            </h2>

            <p>
                {description}
            </p>

        </div>
    );
}

// ==========================================
// SETTING ROW
// ==========================================

function SettingRow({
    title,
    description,
    children,
}) {
    return (
        <div className="setting-row">

            <div className="setting-info">

                <strong>
                    {title}
                </strong>

                <span>
                    {description}
                </span>

            </div>

            <div className="setting-control">
                {children}
            </div>

        </div>
    );
}

// ==========================================
// TOGGLE ROW
// ==========================================

function ToggleRow({
    title,
    description,
    enabled,
    onChange,
}) {
    return (
        <div className="setting-row">

            <div className="setting-info">

                <strong>
                    {title}
                </strong>

                <span>
                    {description}
                </span>

            </div>

            <button
                type="button"
                className={`toggle ${
                    enabled ? "enabled" : ""
                }`}
                onClick={() =>
                    onChange(!enabled)
                }
            >
                <span></span>
            </button>

        </div>
    );
}

export default Settings;