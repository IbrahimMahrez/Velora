
import { useEffect, useRef, useState } from "react";
import api from "../../services/api";
import { Link } from "react-router-dom";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";

import "./AIInsights.css";
import { useLanguage } from "../../context/LanguageContext";
import { useCurrency } from "../../hooks/useCurrency";
import LanguageToggle from "../../components/LanguageToggle/LanguageToggle";

const PIE_COLORS = [
    "#7d5cff",
    "#9b82ff",
    "#a995ff",
    "#6747e8",
    "#b8aaff",
    "#5136c9",
];

function AIInsights() {
    const { t, lang } = useLanguage();
    const { currency } = useCurrency();
    const locale = lang === "ar" ? "ar-EG" : "en-US";
    const [insights, setInsights] = useState(null);
    const [insightsLoading, setInsightsLoading] = useState(true);
    const [insightsError, setInsightsError] = useState("");

    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);

    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: t("ai.greeting"),
        },
    ]);

    const hasFetchedInsights = useRef(false);

    const token = localStorage.getItem("token");

    /* =========================
       Fetch AI Insights
    ========================= */

    const fetchInsights = async () => {
        try {
            setInsightsLoading(true);
            setInsightsError("");

            const response = await api.get("/ai/insights", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log("INSIGHTS:", response.data);

            if (response.data?.success) {
                setInsights(response.data);
            } else {
                throw new Error("Failed to generate financial insights.");
            }
        } catch (error) {
            console.error("AI INSIGHTS ERROR:", error);

            // Prevent a second failed request from
            // removing successfully loaded data.
            if (!insights) {
                setInsightsError(
                    error.response?.data?.message ||
                        "Failed to generate financial insights."
                );
            }
        } finally {
            setInsightsLoading(false);
        }
    };

    useEffect(() => {
        if (hasFetchedInsights.current) return;

        hasFetchedInsights.current = true;

        fetchInsights();
    }, []);

    /* =========================
       Send Message
    ========================= */

    const sendMessage = async (e) => {
        e.preventDefault();

        const trimmedMessage = message.trim();

        if (!trimmedMessage || sending) return;

        const userMessage = {
            role: "user",
            content: trimmedMessage,
        };

        setMessages((prev) => [...prev, userMessage]);
        setMessage("");
        setSending(true);

        try {
            const response = await api.post(
                "/ai/chat",
                {
                    message: trimmedMessage,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const reply =
                response.data?.reply ||
                "مش قادر أطلع تحليل دلوقتي، حاول تاني.";

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: reply,
                },
            ]);
        } catch (error) {
            console.error("AI CHAT ERROR:", error);

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content:
                        "حصل خطأ وأنا بحاول أحلل بياناتك. حاول تاني بعد شوية.",
                },
            ]);
        } finally {
            setSending(false);
        }
    };

    /* =========================
       Format Money
    ========================= */

    const formatMoney = (value) => {
        const number = Number(value || 0);

        return `${number.toLocaleString(locale, {
            maximumFractionDigits: 0,
        })} ${currency}`;
    };

    /* =========================
       Loading
    ========================= */

    if (insightsLoading && !insights) {
        return (
            <div className="ai-insights-page">
                <div className="ai-loading-box">
                    <div className="ai-loading-spinner"></div>

                    <h2>{t("ai.analyzing")}</h2>

                    <p>
                        {t("ai.analyzingHint")}
                    </p>
                </div>
            </div>
        );
    }

    /* =========================
       Error
    ========================= */

    if (insightsError && !insights) {
        return (
            <div className="ai-insights-page">
                <div className="ai-error-box">
                    <div className="ai-error-icon">⚠️</div>

                    <h2>{t("ai.analysisFailed")}</h2>

                    <p>{insightsError}</p>

                    <button
                        className="ai-retry-button"
                        onClick={fetchInsights}
                    >
                        {t("ai.tryAgain")}
                    </button>

                    <Link
                        to="/dashboard"
                        className="ai-error-back-button"
                    >
                        ← {t("ai.back")}
                    </Link>
                </div>
            </div>
        );
    }

    /* =========================
       Data
    ========================= */

    const spending = insights?.spending || {};
    const subscriptions = insights?.subscriptions || {};
    const installments = insights?.installments || {};
    const goals = insights?.goals?.items || [];
    const advice = insights?.advice || {};

    const totalExpenses = Number(
        spending.totalExpenses ??
            spending.total ??
            spending.amount ??
            0
    );

    const monthlySubscriptions = Number(
        subscriptions.monthlySubscriptions ??
            subscriptions.monthly ??
            subscriptions.total ??
            0
    );

    const monthlyInstallments = Number(
        installments.monthlyInstallments ??
            installments.monthly ??
            installments.total ??
            0
    );

    /* =========================
       Spending Categories
    ========================= */

    const spendingCategories =
        spending.topCategories ||
        spending.categories ||
        [];

    const spendingChartData = spendingCategories
        .map((item) => ({
            name:
                item?.category ||
                item?.name ||
                "Other",

            amount: Number(
                item?.amount ??
                    item?.total ??
                    item?.value ??
                    0
            ),
        }))
        .filter((item) => item.amount > 0);

    /* =========================
       Pie Chart
    ========================= */

    const pieData = spendingChartData.slice(0, 6);

    /* =========================
       Monthly Commitments
    ========================= */

    const commitmentsData = [
        {
            name: t("ai.subscriptions"),
            amount: monthlySubscriptions,
        },
        {
            name: t("ai.installments"),
            amount: monthlyInstallments,
        },
    ];

    /* =========================
       Goals Chart
    ========================= */

    const goalsChartData = goals
        .map((goal) => {
            const saved = Number(
                goal?.currentAmount ??
                    goal?.savedAmount ??
                    goal?.saved ??
                    0
            );

            const target = Number(
                goal?.targetAmount ??
                    goal?.target ??
                    goal?.amount ??
                    0
            );

            const progress =
                target > 0
                    ? Math.min(
                          100,
                          (saved / target) * 100
                      )
                    : 0;

            return {
                name:
                    goal?.name ||
                    goal?.title ||
                    "Goal",

                progress: Number(
                    progress.toFixed(1)
                ),

                saved,
                target,
            };
        })
        .filter((goal) => goal.target > 0);

    return (
        <div className="ai-insights-page">

            {/* =========================
                Back Button
            ========================= */}

            <div className="ai-back-wrapper">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Link
                    to="/dashboard"
                    className="ai-back-button"
                >
                    <span>←</span>

                    {t("ai.back")}
                </Link>
                    <LanguageToggle variant="dashboard" />
                </div>
            </div>

            {/* =========================
                Header
            ========================= */}

            <header className="ai-insights-header">

                <div className="ai-header-content">

                    <div className="ai-eyebrow">
                        <span className="ai-header-icon">
                            ✦
                        </span>

                        {t("ai.eyebrow")}
                    </div>

                    <h1>
                        {t("ai.titleA")}
                        <span>{t("ai.titleB")}</span>
                    </h1>

                    <p>
                        {t("ai.subtitle")}
                    </p>

                </div>

            </header>

            <main className="ai-insights-container">

                {/* =========================
                    AI CHAT
                ========================= */}

                <section className="ai-chat-card">

                    <div className="ai-chat-header">

                        <div className="ai-chat-title">

                            <div className="ai-avatar">
                                ✦
                            </div>

                            <div>
                                <h3>Velora AI</h3>

                                <span className="ai-status">
                                    <span className="status-dot"></span>
                                    {t("ai.online")}
                                </span>
                            </div>

                        </div>

                        <div className="ai-powered">
                            Powered by Gemini
                        </div>

                    </div>

                    <div className="ai-messages">

                        {messages.map(
                            (msg, index) => (
                                <div
                                    key={index}
                                    className={`ai-message ${
                                        msg.role ===
                                        "user"
                                            ? "user-message"
                                            : "assistant-message"
                                    }`}
                                >

                                    <div className="message-avatar">
                                        {msg.role ===
                                        "user"
                                            ? "U"
                                            : "✦"}
                                    </div>

                                    <div className="message-content">
                                        {msg.content}
                                    </div>

                                </div>
                            )
                        )}

                        {sending && (
                            <div className="ai-message assistant-message">

                                <div className="message-avatar">
                                    ✦
                                </div>

                                <div className="message-content ai-typing">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>

                            </div>
                        )}

                    </div>

                    <form
                        className="ai-chat-input"
                        onSubmit={sendMessage}
                    >

                        <input
                            type="text"
                            value={message}
                            onChange={(e) =>
                                setMessage(
                                    e.target.value
                                )
                            }
                            placeholder="Ask Velora AI about your finances..."
                        />

                        <button
                            type="submit"
                            disabled={
                                sending ||
                                !message.trim()
                            }
                        >
                            <span>↑</span>
                        </button>

                    </form>

                </section>

                {/* =========================
                    SMART ANALYSIS
                ========================= */}

                <section className="ai-analysis-section">

                    <div className="ai-section-heading">

                        <div>
                            <div className="analysis-badge">
                                SMART ANALYSIS
                            </div>

                            <h2>
                                Your financial
                                overview
                            </h2>

                            <p>
                                Real insights generated
                                from your Velora data.
                            </p>
                        </div>

                    </div>

                    {/* =========================
                        Summary Cards
                    ========================= */}

                    <div className="ai-summary-grid">

                        <div className="ai-summary-card">

                            <div className="summary-icon">
                                ◉
                            </div>

                            <span>
                                Total Spending
                            </span>

                            <strong>
                                {formatMoney(
                                    totalExpenses
                                )}
                            </strong>

                            <small>
                                Overall expenses
                            </small>

                        </div>

                        <div className="ai-summary-card">

                            <div className="summary-icon">
                                ↻
                            </div>

                            <span>
                                Subscriptions
                            </span>

                            <strong>
                                {formatMoney(
                                    monthlySubscriptions
                                )}
                            </strong>

                            <small>
                                Monthly
                            </small>

                        </div>

                        <div className="ai-summary-card">

                            <div className="summary-icon">
                                ◇
                            </div>

                            <span>
                                Installments
                            </span>

                            <strong>
                                {formatMoney(
                                    monthlyInstallments
                                )}
                            </strong>

                            <small>
                                Monthly
                            </small>

                        </div>

                        <div className="ai-summary-card">

                            <div className="summary-icon">
                                ◎
                            </div>

                            <span>
                                Saving Goals
                            </span>

                            <strong>
                                {goals.length}
                            </strong>

                            <small>
                                Active goals
                            </small>

                        </div>

                    </div>

                    {/* =========================
                        Charts Grid
                    ========================= */}

                    <div className="ai-charts-grid">

                        {/* Spending Bar Chart */}

                        <div className="ai-analysis-card">

                            <div className="analysis-card-header">

                                <div>
                                    <span>
                                        SPENDING
                                    </span>

                                    <h3>
                                        Spending by category
                                    </h3>
                                </div>

                                <div className="chart-mini-icon">
                                    ◫
                                </div>

                            </div>

                            {spendingChartData.length >
                            0 ? (
                                <div className="chart-wrapper">

                                    <ResponsiveContainer
                                        width="100%"
                                        height={320}
                                    >
                                        <BarChart
                                            data={
                                                spendingChartData
                                            }
                                            margin={{
                                                top: 10,
                                                right: 10,
                                                left: 0,
                                                bottom: 10,
                                            }}
                                        >
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke="rgba(255,255,255,0.06)"
                                                vertical={false}
                                            />

                                            <XAxis
                                                dataKey="name"
                                                stroke="#777"
                                                tick={{
                                                    fill: "#888",
                                                    fontSize: 12,
                                                }}
                                                axisLine={false}
                                                tickLine={false}
                                            />

                                            <YAxis
                                                stroke="#777"
                                                tick={{
                                                    fill: "#888",
                                                    fontSize: 12,
                                                }}
                                                axisLine={false}
                                                tickLine={false}
                                            />

                                            <Tooltip
                                                contentStyle={{
                                                    background:
                                                        "#0d0b14",
                                                    border: "1px solid rgba(125,92,255,.25)",
                                                    borderRadius: 14,
                                                    color: "#fff",
                                                }}
                                                formatter={(
                                                    value
                                                ) =>
                                                    formatMoney(
                                                        value
                                                    )
                                                }
                                            />

                                            <Bar
                                                dataKey="amount"
                                                fill="#7d5cff"
                                                radius={[
                                                    8,
                                                    8,
                                                    0,
                                                    0,
                                                ]}
                                                maxBarSize={
                                                    55
                                                }
                                            />

                                        </BarChart>
                                    </ResponsiveContainer>

                                </div>
                            ) : (
                                <div className="empty-analysis">
                                    No spending category
                                    data available.
                                </div>
                            )}

                        </div>

                        {/* Spending Pie Chart */}

                        <div className="ai-analysis-card">

                            <div className="analysis-card-header">

                                <div>
                                    <span>
                                        DISTRIBUTION
                                    </span>

                                    <h3>
                                        Spending distribution
                                    </h3>
                                </div>

                                <div className="chart-mini-icon">
                                    ◔
                                </div>

                            </div>

                            {pieData.length > 0 ? (
                                <div className="chart-wrapper pie-chart-wrapper">

                                    <ResponsiveContainer
                                        width="100%"
                                        height={320}
                                    >
                                        <PieChart>

                                            <Pie
                                                data={pieData}
                                                dataKey="amount"
                                                nameKey="name"
                                                cx="50%"
                                                cy="45%"
                                                outerRadius={105}
                                                innerRadius={60}
                                                paddingAngle={4}
                                            >
                                                {pieData.map(
                                                    (
                                                        entry,
                                                        index
                                                    ) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={
                                                                PIE_COLORS[
                                                                    index %
                                                                        PIE_COLORS.length
                                                                ]
                                                            }
                                                        />
                                                    )
                                                )}
                                            </Pie>

                                            <Tooltip
                                                contentStyle={{
                                                    background:
                                                        "#0d0b14",
                                                    border: "1px solid rgba(125,92,255,.25)",
                                                    borderRadius: 14,
                                                    color: "#fff",
                                                }}
                                                formatter={(
                                                    value
                                                ) =>
                                                    formatMoney(
                                                        value
                                                    )
                                                }
                                            />

                                            <Legend
                                                wrapperStyle={{
                                                    fontSize: 12,
                                                    color: "#999",
                                                }}
                                            />

                                        </PieChart>
                                    </ResponsiveContainer>

                                </div>
                            ) : (
                                <div className="empty-analysis">
                                    No distribution data
                                    available.
                                </div>
                            )}

                        </div>

                        {/* Commitments Chart */}

                        <div className="ai-analysis-card">

                            <div className="analysis-card-header">

                                <div>
                                    <span>
                                        COMMITMENTS
                                    </span>

                                    <h3>
                                        Monthly commitments
                                    </h3>
                                </div>

                                <div className="chart-mini-icon">
                                    $
                                </div>

                            </div>

                            <div className="chart-wrapper">

                                <ResponsiveContainer
                                    width="100%"
                                    height={320}
                                >
                                    <BarChart
                                        data={
                                            commitmentsData
                                        }
                                        margin={{
                                            top: 10,
                                            right: 10,
                                            left: 0,
                                            bottom: 10,
                                        }}
                                    >

                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="rgba(255,255,255,0.06)"
                                            vertical={false}
                                        />

                                        <XAxis
                                            dataKey="name"
                                            stroke="#777"
                                            tick={{
                                                fill: "#888",
                                                fontSize: 12,
                                            }}
                                            axisLine={false}
                                            tickLine={false}
                                        />

                                        <YAxis
                                            stroke="#777"
                                            tick={{
                                                fill: "#888",
                                                fontSize: 12,
                                            }}
                                            axisLine={false}
                                            tickLine={false}
                                        />

                                        <Tooltip
                                            contentStyle={{
                                                background:
                                                    "#0d0b14",
                                                border: "1px solid rgba(125,92,255,.25)",
                                                borderRadius: 14,
                                                color: "#fff",
                                            }}
                                            formatter={(
                                                value
                                            ) =>
                                                formatMoney(
                                                    value
                                                )
                                            }
                                        />

                                        <Legend />

                                        <Bar
                                            dataKey="amount"
                                            name="Monthly amount"
                                            fill="#9b82ff"
                                            radius={[
                                                8,
                                                8,
                                                0,
                                                0,
                                            ]}
                                            maxBarSize={70}
                                        />

                                    </BarChart>
                                </ResponsiveContainer>

                            </div>

                        </div>

                        {/* Goals Chart */}

                        <div className="ai-analysis-card">

                            <div className="analysis-card-header">

                                <div>
                                    <span>
                                        GOALS
                                    </span>

                                    <h3>
                                        Goals performance
                                    </h3>
                                </div>

                                <div className="chart-mini-icon">
                                    ◎
                                </div>

                            </div>

                            {goalsChartData.length >
                            0 ? (
                                <div className="chart-wrapper">

                                    <ResponsiveContainer
                                        width="100%"
                                        height={320}
                                    >
                                        <BarChart
                                            data={
                                                goalsChartData
                                            }
                                            layout="vertical"
                                            margin={{
                                                top: 10,
                                                right: 20,
                                                left: 10,
                                                bottom: 10,
                                            }}
                                        >

                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke="rgba(255,255,255,0.06)"
                                                horizontal={false}
                                            />

                                            <XAxis
                                                type="number"
                                                domain={[
                                                    0,
                                                    100,
                                                ]}
                                                unit="%"
                                                stroke="#777"
                                                tick={{
                                                    fill: "#888",
                                                    fontSize: 12,
                                                }}
                                                axisLine={false}
                                                tickLine={false}
                                            />

                                            <YAxis
                                                type="category"
                                                dataKey="name"
                                                width={100}
                                                stroke="#777"
                                                tick={{
                                                    fill: "#aaa",
                                                    fontSize: 12,
                                                }}
                                                axisLine={false}
                                                tickLine={false}
                                            />

                                            <Tooltip
                                                contentStyle={{
                                                    background:
                                                        "#0d0b14",
                                                    border: "1px solid rgba(125,92,255,.25)",
                                                    borderRadius: 14,
                                                    color: "#fff",
                                                }}
                                                formatter={(
                                                    value
                                                ) =>
                                                    `${value}%`
                                                }
                                            />

                                            <Bar
                                                dataKey="progress"
                                                name="Progress"
                                                fill="#7d5cff"
                                                radius={[
                                                    0,
                                                    8,
                                                    8,
                                                    0,
                                                ]}
                                                maxBarSize={
                                                    28
                                                }
                                            />

                                        </BarChart>
                                    </ResponsiveContainer>

                                </div>
                            ) : (
                                <div className="empty-analysis">
                                    No active goals
                                    available.
                                </div>
                            )}

                        </div>

                    </div>

                    {/* =========================
                        Detailed Analysis
                    ========================= */}

                    <div className="ai-two-columns">

                        {/* Subscriptions */}

                        <div className="ai-analysis-card">

                            <div className="analysis-card-header">

                                <div>
                                    <span>
                                        SUBSCRIPTIONS
                                    </span>

                                    <h3>
                                        Recurring payments
                                    </h3>
                                </div>

                                <strong className="analysis-number">
                                    {formatMoney(
                                        monthlySubscriptions
                                    )}
                                </strong>

                            </div>

                            {subscriptions.activeSubscriptions
                                ?.length > 0 ? (
                                <div className="analysis-list">

                                    {subscriptions.activeSubscriptions
                                        .slice(0, 5)
                                        .map(
                                            (
                                                item,
                                                index
                                            ) => (
                                                <div
                                                    className="analysis-list-item"
                                                    key={
                                                        item._id ||
                                                        index
                                                    }
                                                >
                                                    <span>
                                                        {item.name ||
                                                            item.title ||
                                                            "Subscription"}
                                                    </span>

                                                    <strong>
                                                        {formatMoney(
                                                            item.amount ??
                                                                item.price
                                                        )}
                                                    </strong>
                                                </div>
                                            )
                                        )}

                                </div>
                            ) : (
                                <div className="empty-analysis">
                                    No active
                                    subscriptions.
                                </div>
                            )}

                        </div>

                        {/* Installments */}

                        <div className="ai-analysis-card">

                            <div className="analysis-card-header">

                                <div>
                                    <span>
                                        INSTALLMENTS
                                    </span>

                                    <h3>
                                        Active installments
                                    </h3>
                                </div>

                                <strong className="analysis-number">
                                    {formatMoney(
                                        monthlyInstallments
                                    )}
                                </strong>

                            </div>

                            {installments.activeInstallments
                                ?.length > 0 ? (
                                <div className="analysis-list">

                                    {installments.activeInstallments
                                        .slice(0, 5)
                                        .map(
                                            (
                                                item,
                                                index
                                            ) => (
                                                <div
                                                    className="analysis-list-item"
                                                    key={
                                                        item._id ||
                                                        index
                                                    }
                                                >
                                                    <span>
                                                        {item.productName ||
                                                            item.name ||
                                                            item.title ||
                                                            "Installment"}
                                                    </span>

                                                    <strong>
                                                        {formatMoney(
                                                            item.monthlyPayment ??
                                                                item.monthlyAmount ??
                                                                item.amount
                                                        )}
                                                    </strong>
                                                </div>
                                            )
                                        )}

                                </div>
                            ) : (
                                <div className="empty-analysis">
                                    No active
                                    installments.
                                </div>
                            )}

                        </div>

                    </div>

                    {/* =========================
                        Goals List
                    ========================= */}

                    {goals.length > 0 && (
                        <div className="ai-analysis-card goals-card">

                            <div className="analysis-card-header">

                                <div>
                                    <span>
                                        SAVING GOALS
                                    </span>

                                    <h3>
                                        Your progress
                                    </h3>
                                </div>

                            </div>

                            <div className="goals-list">

                                {goals.map(
                                    (goal, index) => {
                                        const saved =
                                            Number(
                                                goal?.currentAmount ??
                                                    goal?.savedAmount ??
                                                    goal?.saved ??
                                                    0
                                            );

                                        const target =
                                            Number(
                                                goal?.targetAmount ??
                                                    goal?.target ??
                                                    goal?.amount ??
                                                    0
                                            );

                                        const progress =
                                            target > 0
                                                ? Math.min(
                                                      100,
                                                      (saved /
                                                          target) *
                                                          100
                                                  )
                                                : 0;

                                        return (
                                            <div
                                                className="goal-item"
                                                key={
                                                    goal._id ||
                                                    index
                                                }
                                            >

                                                <div className="goal-header">

                                                    <span>
                                                        {goal.name ||
                                                            goal.title ||
                                                            "Goal"}
                                                    </span>

                                                    <span>
                                                        {Math.round(
                                                            progress
                                                        )}
                                                        %
                                                    </span>

                                                </div>

                                                <div className="goal-progress">

                                                    <div
                                                        style={{
                                                            width: `${progress}%`,
                                                        }}
                                                    />

                                                </div>

                                                <div className="goal-money">

                                                    <span>
                                                        {formatMoney(
                                                            saved
                                                        )}
                                                    </span>

                                                    <span>
                                                        of{" "}
                                                        {formatMoney(
                                                            target
                                                        )}
                                                    </span>

                                                </div>

                                            </div>
                                        );
                                    }
                                )}

                            </div>

                        </div>
                    )}

                    {/* =========================
                        AI Advice
                    ========================= */}

                    <div className="ai-overall-advice">

                        <div className="overall-ai-icon">
                            ✦
                        </div>

                        <div>

                            <span>
                                VELORA AI RECOMMENDATION
                            </span>

                            <h3>
                                Smart financial advice
                            </h3>

                            <p>
                                {advice.overall ||
                                    advice.message ||
                                    advice.summary ||
                                    "Keep tracking your finances consistently and review your spending regularly."}
                            </p>

                        </div>

                    </div>

                </section>

            </main>

        </div>
    );
}

export default AIInsights;
