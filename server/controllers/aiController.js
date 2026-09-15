
const Expense = require("../models/Expenses");
const Bill = require("../models/Bills");
const Subscription = require("../models/Subscriptions");
const Installment = require("../models/installments");
const Goal = require("../models/Goal");

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

// ======================================================
// GEMINI CONFIG
// ======================================================

const PRIMARY_MODEL = "gemini-3.6-flash";

// Fallback model
// If this model is not available in your Gemini account,
// replace it with another available Flash model.
const FALLBACK_MODEL = "gemini-3.5-flash-lite";

const MAX_RETRIES = 3;

// ======================================================
// SLEEP
// ======================================================

const sleep = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};

// ======================================================
// CHECK RETRYABLE ERROR
// ======================================================

const isRetryableError = (error) => {
    const status =
        error?.status ||
        error?.code ||
        error?.response?.status;

    return [
        429,
        500,
        502,
        503,
        504,
    ].includes(Number(status));
};

// ======================================================
// GENERATE GEMINI RESPONSE
// ======================================================

const generateAIResponse = async ({
    contents,
    config = undefined,
}) => {
    const models = [
        PRIMARY_MODEL,
        FALLBACK_MODEL,
    ];

    let lastError = null;

    for (const model of models) {
        for (
            let attempt = 1;
            attempt <= MAX_RETRIES;
            attempt++
        ) {
            try {
                console.log(
                    `🤖 Gemini request | Model: ${model} | Attempt: ${attempt}/${MAX_RETRIES}`
                );

                const response =
                    await ai.models.generateContent({
                        model,
                        contents,
                        config,
                    });

                console.log(
                    `✅ Gemini response received | Model: ${model}`
                );

                return response;

            } catch (error) {
                lastError = error;

                const status =
                    error?.status ||
                    error?.code ||
                    error?.response?.status;

                console.error(
                    `❌ Gemini failed | Model: ${model} | Attempt: ${attempt} | Status: ${status}`
                );

                console.error(
                    error?.message || error
                );

                // ------------------------------------------
                // NON-RETRYABLE ERROR
                // ------------------------------------------

                if (!isRetryableError(error)) {
                    console.error(
                        "🚫 Non-retryable Gemini error."
                    );

                    throw error;
                }

                // ------------------------------------------
                // RETRY DELAY
                // ------------------------------------------

                if (attempt < MAX_RETRIES) {
                    const delay =
                        Math.pow(2, attempt) * 1000;

                    console.log(
                        `⏳ Retrying Gemini in ${
                            delay / 1000
                        } seconds...`
                    );

                    await sleep(delay);
                }
            }
        }

        console.log(
            `⚠️ ${model} failed after ${MAX_RETRIES} attempts.`
        );

        console.log(
            `🔄 Switching to fallback model...`
        );
    }

    throw lastError;
};

// ======================================================
// CLEAN AI JSON RESPONSE
// ======================================================

const parseAIJson = (text) => {
    if (!text) {
        throw new Error(
            "Gemini returned an empty response."
        );
    }

    let cleaned = String(text).trim();

    // Remove ```json
    cleaned = cleaned.replace(
        /^```json\s*/i,
        ""
    );

    // Remove ```
    cleaned = cleaned.replace(
        /^```\s*/i,
        ""
    );

    cleaned = cleaned.replace(
        /\s*```$/i,
        ""
    );

    // Try direct parsing
    try {
        return JSON.parse(cleaned);
    } catch (error) {
        // ----------------------------------------------
        // Try extracting JSON object
        // ----------------------------------------------

        const start = cleaned.indexOf("{");
        const end = cleaned.lastIndexOf("}");

        if (start !== -1 && end !== -1) {
            const jsonString = cleaned.slice(
                start,
                end + 1
            );

            return JSON.parse(jsonString);
        }

        throw error;
    }
};

// ======================================================
// BUILD FINANCIAL SUMMARY
// ======================================================

const buildFinancialSummary = async (userId) => {
    const [
        expenses,
        bills,
        subscriptions,
        installments,
        goals,
    ] = await Promise.all([
        Expense.find({
            user: userId,
        }).lean(),

        Bill.find({
            user: userId,
        }).lean(),

        Subscription.find({
            user: userId,
        }).lean(),

        Installment.find({
            user: userId,
        }).lean(),

        Goal.find({
            user: userId,
        }).lean(),
    ]);

    // ==================================================
    // EXPENSES
    // ==================================================

    const totalExpenses = expenses.reduce(
        (sum, expense) => {
            return (
                sum +
                Number(
                    expense.amount ||
                        expense.price ||
                        0
                )
            );
        },
        0
    );

    const categoryMap = {};

    expenses.forEach((expense) => {
        const category =
            expense.category || "Other";

        const amount = Number(
            expense.amount ||
                expense.price ||
                0
        );

        categoryMap[category] =
            (categoryMap[category] || 0) +
            amount;
    });

    const topCategories = Object.entries(
        categoryMap
    )
        .map(([category, amount]) => ({
            category,
            amount: Number(
                amount.toFixed(2)
            ),
        }))
        .sort(
            (a, b) =>
                b.amount - a.amount
        );

    // ==================================================
    // BILLS
    // ==================================================

    const totalBills = bills.reduce(
        (sum, bill) => {
            return (
                sum +
                Number(
                    bill.amount ||
                        bill.price ||
                        0
                )
            );
        },
        0
    );

    // ==================================================
    // SUBSCRIPTIONS
    // ==================================================

    let monthlySubscriptions = 0;

    const subscriptionDetails =
        subscriptions.map(
            (subscription) => {
                const amount = Number(
                    subscription.amount ||
                        subscription.price ||
                        0
                );

                const billingCycle =
                    String(
                        subscription.billingCycle ||
                            subscription.renewalCycle ||
                            subscription.cycle ||
                            "monthly"
                    ).toLowerCase();

                let monthlyAmount =
                    amount;

                if (
                    billingCycle.includes(
                        "year"
                    )
                ) {
                    monthlyAmount =
                        amount / 12;
                } else if (
                    billingCycle.includes(
                        "week"
                    )
                ) {
                    monthlyAmount =
                        amount * 4.33;
                }

                monthlySubscriptions +=
                    monthlyAmount;

                return {
                    name:
                        subscription.name ||
                        subscription.title ||
                        "Subscription",

                    amount,

                    billingCycle,

                    monthlyAmount:
                        Number(
                            monthlyAmount.toFixed(
                                2
                            )
                        ),
                };
            }
        );

    // ==================================================
    // INSTALLMENTS
    // ==================================================

    const activeInstallments =
        installments.filter(
            (item) =>
                String(
                    item.status || ""
                ).toLowerCase() !==
                "completed"
        );

    const monthlyInstallments =
        activeInstallments.reduce(
            (sum, installment) => {
                return (
                    sum +
                    Number(
                        installment.monthlyPayment ||
                            installment.monthlyAmount ||
                            installment.amount ||
                            0
                    )
                );
            },
            0
        );

    const installmentDetails =
        activeInstallments.map(
            (installment) => ({
                name:
                    installment.productName ||
                    installment.name ||
                    installment.title ||
                    "Installment",

                monthlyPayment:
                    Number(
                        installment.monthlyPayment ||
                            installment.monthlyAmount ||
                            installment.amount ||
                            0
                    ),

                status:
                    installment.status ||
                    "active",

                nextPaymentDate:
                    installment.nextPaymentDate ||
                    null,
            })
        );

    // ==================================================
    // GOALS
    // ==================================================

    const goalDetails = goals.map(
        (goal) => {
            const target = Number(
                goal.targetAmount ||
                    goal.target ||
                    goal.amount ||
                    0
            );

            const saved = Number(
                goal.currentAmount ||
                    goal.savedAmount ||
                    goal.saved ||
                    0
            );

            const progress =
                target > 0
                    ? Math.min(
                          (saved /
                              target) *
                              100,
                          100
                      )
                    : 0;

            return {
                name:
                    goal.name ||
                    goal.title ||
                    "Saving Goal",

                target,

                saved,

                progress:
                    Number(
                        progress.toFixed(1)
                    ),
            };
        }
    );

    // ==================================================
    // FINAL SUMMARY
    // ==================================================

    return {
        totalExpenses:
            Number(
                totalExpenses.toFixed(2)
            ),

        totalBills:
            Number(
                totalBills.toFixed(2)
            ),

        monthlySubscriptions:
            Number(
                monthlySubscriptions.toFixed(
                    2
                )
            ),

        monthlyInstallments:
            Number(
                monthlyInstallments.toFixed(
                    2
                )
            ),

        topCategories,

        subscriptionDetails,

        installmentDetails,

        goals: goalDetails,
    };
};

// ======================================================
// CHAT WITH AI
// ======================================================

const chatWithAI = async (
    req,
    res
) => {
    try {
        const { message } = req.body;

        if (
            !message ||
            !message.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Message is required.",
            });
        }

        if (!req.user?._id) {
            return res.status(401).json({
                success: false,
                message:
                    "Unauthorized.",
            });
        }

        // ----------------------------------------------
        // BUILD SUMMARY
        // ----------------------------------------------

        const summary =
            await buildFinancialSummary(
                req.user._id
            );

        // ----------------------------------------------
        // PROMPT
        // ----------------------------------------------

        const systemPrompt = `
You are Velora AI, a personal financial assistant.

User financial data:

${JSON.stringify(
    summary,
    null,
    2
)}

User question:

${message}

Rules:

- Only use the financial data provided above.
- Never invent financial numbers.
- Never assume financial information that is not provided.
- Answer in the same language as the user.
- If the user speaks Arabic, use Egyptian Arabic.
- Give practical and simple financial advice.
- Mention exact numbers when useful.
- Explain recommendations briefly.
- If the data is insufficient, clearly say so.
- You are not a professional financial advisor.
`;

        // ----------------------------------------------
        // GEMINI
        // ----------------------------------------------

        const response =
            await generateAIResponse({
                contents:
                    systemPrompt,
            });

        const reply =
            response?.text ||
            "I couldn't generate a response.";

        return res.status(200).json({
            success: true,
            reply,
        });

    } catch (error) {
        console.error(
            "🔥 AI CHAT ERROR:",
            error?.message ||
                error
        );

        const status =
            error?.status ||
            error?.code;

        if (
            [
                429,
                500,
                502,
                503,
                504,
            ].includes(Number(status))
        ) {
            return res.status(503).json({
                success: false,
                message:
                    "Velora AI is temporarily busy. Please try again in a moment.",
            });
        }

        return res.status(500).json({
            success: false,
            message:
                "Failed to communicate with Velora AI.",
        });
    }
};

// ======================================================
// GET AI INSIGHTS
// ======================================================

const getAIInsights = async (
    req,
    res
) => {
    try {
        console.log(
            "🔥 AI INSIGHTS REQUEST"
        );

        if (!req.user?._id) {
            return res.status(401).json({
                success: false,
                message:
                    "Unauthorized.",
            });
        }

        // ==================================================
        // BUILD SUMMARY
        // ==================================================

        const summary =
            await buildFinancialSummary(
                req.user._id
            );

        console.log(
            "📊 Financial summary built successfully."
        );

        // ==================================================
        // SPENDING
        // ==================================================

        const spendingCategories =
            summary.topCategories.map(
                (item) => ({
                    category:
                        item.category,

                    amount:
                        Number(
                            item.amount.toFixed(
                                2
                            )
                        ),
                })
            );

        const topCategory =
            spendingCategories.length > 0
                ? spendingCategories[0]
                : null;

        // ==================================================
        // SUBSCRIPTIONS
        // ==================================================

        const subscriptionTotal =
            summary.monthlySubscriptions;

        // ==================================================
        // INSTALLMENTS
        // ==================================================

        const installmentTotal =
            summary.monthlyInstallments;

        // ==================================================
        // GOALS
        // ==================================================

        const goals =
            summary.goals;

        // ==================================================
        // GEMINI PROMPT
        // ==================================================

        const prompt = `
You are Velora AI, a financial analysis assistant.

Analyze this user's financial data:

${JSON.stringify(
    summary,
    null,
    2
)}

Return practical advice for the user.

You MUST:

- Never invent numbers.
- Only use the provided data.
- Keep recommendations realistic.
- Use Egyptian Arabic.
- Be concise.
- Focus on actionable advice.
- Do not mention data that does not exist.
- Do not create fake percentages or financial values.

Give advice about:

1. Spending
2. Subscriptions
3. Installments
4. Saving goals
5. Overall financial health

Return ONLY a JSON object in this exact structure:

{
    "spendingAdvice": "",
    "subscriptionAdvice": "",
    "installmentAdvice": "",
    "goalAdvice": "",
    "overallAdvice": "",
    "recommendations": [
        ""
    ]
}
`;

        // ==================================================
        // GEMINI
        // ==================================================

        console.log(
            "🤖 Generating AI financial insights..."
        );

        const aiResponse =
            await generateAIResponse({
                contents: prompt,

                config: {
                    responseMimeType:
                        "application/json",
                },
            });

        // ==================================================
        // PARSE RESPONSE
        // ==================================================

        let advice;

        try {
            advice = parseAIJson(
                aiResponse?.text
            );
        } catch (error) {
            console.error(
                "🔥 AI INSIGHTS JSON PARSE ERROR:",
                error?.message
            );

            console.error(
                "AI RESPONSE:",
                aiResponse?.text
            );

            return res.status(502).json({
                success: false,
                message:
                    "Velora AI returned an invalid response.",
            });
        }

        // ==================================================
        // VALIDATE ADVICE
        // ==================================================

        advice = {
            spendingAdvice:
                advice?.spendingAdvice ||
                "",

            subscriptionAdvice:
                advice?.subscriptionAdvice ||
                "",

            installmentAdvice:
                advice?.installmentAdvice ||
                "",

            goalAdvice:
                advice?.goalAdvice ||
                "",

            overallAdvice:
                advice?.overallAdvice ||
                "",

            recommendations:
                Array.isArray(
                    advice?.recommendations
                )
                    ? advice.recommendations
                    : [],
        };

        // ==================================================
        // RESPONSE
        // ==================================================

        console.log(
            "✅ AI INSIGHTS GENERATED SUCCESSFULLY"
        );

        return res.status(200).json({
            success: true,

            spending: {
                total:
                    summary.totalExpenses,

                categories:
                    spendingCategories,

                topCategory,
            },

            subscriptions: {
                monthlyTotal:
                    subscriptionTotal,

                count:
                    summary
                        .subscriptionDetails
                        .length,

                items:
                    summary.subscriptionDetails,
            },

            installments: {
                monthlyTotal:
                    installmentTotal,

                activeCount:
                    summary
                        .installmentDetails
                        .length,

                items:
                    summary.installmentDetails,
            },

            goals: {
                items: goals,
            },

            advice,
        });

    } catch (error) {
        console.error(
            "🔥 AI INSIGHTS ERROR:",
            error?.message ||
                error
        );

        console.error(
            "STATUS:",
            error?.status ||
                error?.code ||
                "UNKNOWN"
        );

        const status =
            error?.status ||
            error?.code;

        // ==================================================
        // TEMPORARY GEMINI ERROR
        // ==================================================

        if (
            [
                429,
                500,
                502,
                503,
                504,
            ].includes(Number(status))
        ) {
            return res.status(503).json({
                success: false,

                message:
                    "Velora AI is temporarily unavailable. Please try again in a moment.",
            });
        }

        // ==================================================
        // GENERAL ERROR
        // ==================================================

        return res.status(500).json({
            success: false,

            message:
                "Failed to generate financial insights.",
        });
    }
};

// ======================================================
// EXPENSE CATEGORIES (mirrors Expenses model enum)
// ======================================================

const EXPENSE_CATEGORIES = [
    "Food",
    "Transport",
    "Shopping",
    "Entertainment",
    "Health",
    "Education",
    "Other",
];

// Offline keyword fallback (Arabic + English) when AI
// is unavailable — keeps the suggest button always working.
const CATEGORY_KEYWORDS = {
    Food: [
        "food", "eat", "restaurant", "pizza", "burger", "coffee",
        "كشري", "مطعم", "اكل", "أكل", "قهوة", "فطار", "غدا", "عشا",
        "فول", "طعمية", "حلويات", "عصير", "شاي", "بيتزا",
    ],
    Transport: [
        "uber", "taxi", "bus", "metro", "fuel", "gas", "parking",
        "اوبر", "تاكسي", "مواصلات", "بنزين", "مترو", "اتوبيس",
        "سفر", "طريق", "جراج",
    ],
    Shopping: [
        "shop", "mall", "clothes", "shoes", "amazon",
        "تسوق", "ملابس", "هدوم", "مول", "شراء", "سوبر", "ماركت",
    ],
    Entertainment: [
        "cinema", "movie", "game", "netflix", "party", "trip",
        "سينما", "فيلم", "ترفيه", "لعبة", "حفلة", "خروجة",
    ],
    Health: [
        "doctor", "pharmacy", "hospital", "clinic", "medicine",
        "دكتور", "صيدلية", "مستشفى", "علاج", "دواء", "تحليل",
    ],
    Education: [
        "school", "course", "book", "university", "lesson",
        "مدرسة", "كورس", "كتاب", "جامعة", "درس", "تعليم",
    ],
};

const keywordFallback = (title = "") => {
    const text = String(title).toLowerCase();

    for (const [category, keywords] of Object.entries(
        CATEGORY_KEYWORDS
    )) {
        if (keywords.some((kw) => text.includes(kw.toLowerCase()))) {
            return category;
        }
    }

    return "Other";
};

// ======================================================
// CATEGORIZE EXPENSE TITLE
// POST /ai/categorize { title } -> { category }
// ======================================================

const categorizeExpense = async (req, res) => {
    const { title } = req.body;

    if (!title || !String(title).trim()) {
        return res.status(400).json({
            success: false,
            message: "Expense title is required.",
        });
    }

    let category = null;

    try {
        const response = await generateAIResponse({
            contents:
                `Classify this expense title into exactly one of these categories: ` +
                `Food, Transport, Shopping, Entertainment, Health, Education, Other. ` +
                `Reply with ONLY the category word, nothing else.\n` +
                `Title: "${String(title).trim()}"`,
        });

        const cleaned = String(response?.text || "")
            .trim()
            .toLowerCase();

        category =
            EXPENSE_CATEGORIES.find(
                (c) => c.toLowerCase() === cleaned
            ) ||
            EXPENSE_CATEGORIES.find((c) =>
                cleaned.includes(c.toLowerCase())
            ) ||
            null;
    } catch (error) {
        console.error(
            "AI categorize failed, using keyword fallback:",
            error?.message || error
        );
    }

    if (!category) {
        category = keywordFallback(title);
    }

    return res.status(200).json({
        success: true,
        category,
    });
};

// ======================================================
// SCAN RECEIPT PHOTO
// POST /ai/scan-receipt (multipart "image")
// -> { success, receipt: { title, amount, date, category } }
// ======================================================

const scanReceipt = async (req, res) => {
    try {
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({
                success: false,
                message: "Receipt image is required.",
            });
        }

        const mimeType = req.file.mimetype || "image/jpeg";
        const base64 = req.file.buffer.toString("base64");

        const response = await generateAIResponse({
            contents: [
                {
                    inlineData: {
                        mimeType,
                        data: base64,
                    },
                },
                {
                    text:
                        `Read this receipt/invoice photo and reply with ONLY a JSON object ` +
                        `(no markdown, no extra text) with these keys: ` +
                        `"title" (merchant or bill name, short), ` +
                        `"amount" (total number only, no currency), ` +
                        `"date" (YYYY-MM-DD or null if not visible), ` +
                        `"category" (exactly one of: Food, Transport, Shopping, Entertainment, Health, Education, Other). ` +
                        `Example: {"title":"Carrefour","amount":842.5,"date":"2026-09-01","category":"Shopping"}`,
                },
            ],
            config: {
                responseMimeType: "application/json",
            },
        });

        let parsed = null;
        try {
            const raw = String(response?.text || "")
                .trim()
                .replace(/^```json\s*/i, "")
                .replace(/^```\s*/i, "")
                .replace(/\s*```$/i, "");
            parsed = JSON.parse(raw);
        } catch {
            parsed = null;
        }

        if (!parsed || typeof parsed !== "object") {
            return res.status(503).json({
                success: false,
                message:
                    "Could not read the receipt. Please fill the form manually.",
            });
        }

        const amount = Number(parsed.amount);
        let date = null;
        if (parsed.date) {
            const d = new Date(parsed.date);
            if (!Number.isNaN(d.getTime())) {
                date = d.toISOString().split("T")[0];
            }
        }
        const cat = String(parsed.category || "").trim();
        const category =
            EXPENSE_CATEGORIES.find(
                (c) => c.toLowerCase() === cat.toLowerCase()
            ) || "Other";

        return res.status(200).json({
            success: true,
            receipt: {
                title: String(parsed.title || "").slice(0, 80),
                amount: Number.isFinite(amount) ? amount : null,
                date,
                category,
            },
        });
    } catch (error) {
        console.error(
            "AI scan receipt failed:",
            error?.message || error
        );
        return res.status(503).json({
            success: false,
            message:
                "Could not read the receipt. Please fill the form manually.",
        });
    }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
    buildFinancialSummary,
    chatWithAI,
    getAIInsights,
    categorizeExpense,
    scanReceipt,
};
