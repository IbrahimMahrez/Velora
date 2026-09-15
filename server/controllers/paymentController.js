const asyncHandler = require("express-async-handler");
const axios = require("axios");

const Payment = require("../models/Payment");
const Plan = require("../models/Plan");
const User = require("../models/User");

// ======================================================
// CREATE PAYMENT
// ======================================================

const createPayment = asyncHandler(async (req, res) => {
    console.log("");
    console.log("========================================");
    console.log("🔥 CREATE PAYMENT CONTROLLER HIT");
    console.log("========================================");

    try {
        // ==================================================
        // GET REQUEST DATA
        // ==================================================

        const { planId, billingCycle } = req.body;

        const userId = req.user?._id;

        console.log("User ID:", userId);
        console.log("Plan ID:", planId);
        console.log("Billing Cycle:", billingCycle);

        // ==================================================
        // CHECK AUTHENTICATED USER
        // ==================================================

        if (!userId) {
            return res.status(401).json({
                message: "User is not authenticated",
            });
        }

        // ==================================================
        // VALIDATE BILLING CYCLE
        // ==================================================

        if (
            !["monthly", "yearly"].includes(
                billingCycle
            )
        ) {
            return res.status(400).json({
                message:
                    "Billing cycle must be monthly or yearly",
            });
        }

        // ==================================================
        // GET PLAN
        // ==================================================

        const plan = await Plan.findById(planId);

        if (!plan) {
            return res.status(404).json({
                message: "Plan not found",
            });
        }

        console.log("Plan found:", {
            id: plan._id,
            name: plan.name,
            monthlyPrice: plan.monthlyPrice,
            yearlyPrice: plan.yearlyPrice,
        });

        // ==================================================
        // GET USER
        // ==================================================

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        console.log("User found:", {
            id: user._id,
            name: user.name,
            email: user.email,
        });

        // ==================================================
        // GET PRICE
        // ==================================================

        const amount =
            billingCycle === "monthly"
                ? plan.monthlyPrice
                : plan.yearlyPrice;

        console.log("Payment amount:", amount);

        // ==================================================
        // VALIDATE PRICE
        // ==================================================

        if (
            typeof amount !== "number" ||
            amount <= 0
        ) {
            return res.status(400).json({
                message:
                    "This plan does not require payment",
            });
        }

        // ==================================================
        // CHECK PAYMOB ENV
        // ==================================================

        if (!process.env.PAYMOB_SECRET_KEY) {
            console.error(
                "❌ PAYMOB_SECRET_KEY is missing"
            );

            return res.status(500).json({
                message:
                    "Paymob secret key is not configured",
            });
        }

        if (!process.env.PAYMOB_INTEGRATION_ID) {
            console.error(
                "❌ PAYMOB_INTEGRATION_ID is missing"
            );

            return res.status(500).json({
                message:
                    "Paymob integration ID is not configured",
            });
        }

        console.log(
            "Paymob Integration ID:",
            process.env.PAYMOB_INTEGRATION_ID
        );

        // ==================================================
        // CREATE LOCAL PAYMENT
        // ==================================================

        const payment = await Payment.create({
            user: userId,
            plan: plan._id,
            billingCycle,
            amount,
            currency: "EGP",
            status: "pending",
        });

        console.log(
            "Local payment created:",
            payment._id.toString()
        );

        // ==================================================
        // PREPARE USER NAME
        // ==================================================

        const nameParts = user.name
            .trim()
            .split(/\s+/);

        const firstName =
            nameParts[0] || "Customer";

        const lastName =
            nameParts.slice(1).join(" ") ||
            "User";

        // ==================================================
        // PAYMOB AMOUNT
        // EGP -> PIASTERS
        // ==================================================

        const amountInPiasters =
            Math.round(amount * 100);

        console.log(
            "Amount in piastres:",
            amountInPiasters
        );

        // ==================================================
        // PAYMOB INTENTION DATA
        // ==================================================

        const intentionData = {
            amount: amountInPiasters,

            currency: "EGP",

            payment_methods: [
                Number(
                    process.env
                        .PAYMOB_INTEGRATION_ID
                ),
            ],

            items: [
                {
                    name:
                        `${plan.name} subscription`,

                    amount:
                        amountInPiasters,

                    quantity: 1,

                    description:
                        `${plan.name} ${billingCycle} subscription`,
                },
            ],

            billing_data: {
                first_name: firstName,
                last_name: lastName,
                email: user.email,
                phone_number: "01000000000",
            },

            special_reference:
                payment._id.toString(),
        };

        console.log(
            "Sending request to Paymob..."
        );

        console.log(
            "Paymob Request:",
            JSON.stringify(
                {
                    ...intentionData,

                    // Don't log sensitive information
                },
                null,
                2
            )
        );

        // ==================================================
        // CREATE PAYMOB INTENTION
        // ==================================================

        const paymobResponse =
            await axios.post(
                "https://accept.paymob.com/v1/intention/",
                intentionData,
                {
                    headers: {
                        Authorization:
                            `Token ${process.env.PAYMOB_SECRET_KEY}`,

                        "Content-Type":
                            "application/json",
                    },

                    timeout: 30000,
                }
            );

        console.log(
            "========================================"
        );

        console.log(
            "✅ PAYMOB RESPONSE RECEIVED"
        );

        console.log(
            "========================================"
        );

        console.log(
            "Status:",
            paymobResponse.status
        );

        console.log(
            "Response:",
            JSON.stringify(
                paymobResponse.data,
                null,
                2
            )
        );

        // ==================================================
        // CHECK CLIENT SECRET
        // ==================================================

        const clientSecret =
            paymobResponse.data?.client_secret;

        const intentionId =
            paymobResponse.data?.id;

        if (!clientSecret) {
            console.error(
                "❌ Paymob did not return client_secret"
            );

            payment.status = "failed";

            await payment.save();

            return res.status(500).json({
                message:
                    "Paymob did not return client secret",

                paymobResponse:
                    paymobResponse.data,
            });
        }

        // ==================================================
        // SAVE PAYMOB INTENTION ID
        // ==================================================

        payment.transactionId =
            intentionId || null;

        await payment.save();

        console.log(
            "✅ Payment updated successfully"
        );

        // ==================================================
        // SUCCESS RESPONSE
        // ==================================================

        return res.status(201).json({
            message:
                "Payment created successfully",

            payment: {
                id: payment._id,

                plan: plan.name,

                billingCycle,

                amount,

                currency: "EGP",

                status: payment.status,
            },

            clientSecret,

            intentionId,
        });
    } catch (error) {
        // ==================================================
        // ERROR LOGGING
        // ==================================================

        console.log("");
        console.log(
            "========================================"
        );

        console.log(
            "❌ PAYMOB PAYMENT ERROR"
        );

        console.log(
            "========================================"
        );

        console.log(
            "Error message:"
        );

        console.log(
            error.message
        );

        console.log(
            "----------------------------------------"
        );

        console.log(
            "HTTP status:"
        );

        console.log(
            error.response?.status
        );

        console.log(
            "----------------------------------------"
        );

        console.log(
            "Paymob response:"
        );

        console.log(
            JSON.stringify(
                error.response?.data,
                null,
                2
            )
        );

        console.log(
            "----------------------------------------"
        );

        console.log(
            "Paymob headers:"
        );

        console.log(
            JSON.stringify(
                error.response?.headers,
                null,
                2
            )
        );

        console.log(
            "========================================"
        );

        // ==================================================
        // TRY TO MARK PAYMENT AS FAILED
        // ==================================================

        try {
            const { planId, billingCycle } =
                req.body;

            const userId =
                req.user?._id;

            const existingPayment =
                await Payment.findOne({
                    user: userId,
                    plan: planId,
                    billingCycle,
                    status: "pending",
                }).sort({
                    createdAt: -1,
                });

            if (existingPayment) {
                existingPayment.status =
                    "failed";

                await existingPayment.save();

                console.log(
                    "Payment marked as failed:",
                    existingPayment._id.toString()
                );
            }
        } catch (saveError) {
            console.error(
                "Could not update payment status:",
                saveError.message
            );
        }

        // ==================================================
        // SEND ERROR TO FRONTEND
        // ==================================================

        return res.status(500).json({
            message: "Paymob error",

            error:
                error.response?.data ||
                error.message,
        });
    }
});

// ======================================================
// EXPORT
// ======================================================

module.exports = {
    createPayment,
};