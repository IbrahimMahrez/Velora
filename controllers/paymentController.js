const asyncHandler = require("express-async-handler");
const axios = require("axios");

const Payment = require("../models/Payment");
const Plan = require("../models/Plan");

const createPayment = asyncHandler(async (req, res) => {
    const { planId } = req.body;

    const userId = req.user._id;

    const plan = await Plan.findById(planId);

    if (!plan) {
        return res.status(404).json({
            message: "Plan not found"
        });
    }

    const payment = await Payment.create({
        user: userId,
        plan: plan._id,
        amount: plan.price,
        status: "pending"
    });

    try {

        const response = await axios.post(
            "https://accept.paymob.com/v1/intention/",
            {
                amount: plan.price * 100,
                currency: "EGP",

                payment_methods: [
                    Number(process.env.PAYMOB_INTEGRATION_ID)
                ],

                items: [
                    {
                        name: plan.name,
                        amount: plan.price * 100,
                        quantity: 1,
                        description: `${plan.name} subscription`
                    }
                ],

                billing_data: {
                    first_name: "Ibrahim",
                    last_name: "Mahrez",
                    email: "test@example.com",
                    phone_number: "+201000000000"
                },

                special_reference: payment._id.toString()
            },
            {
                headers: {
                    Authorization: `Token ${process.env.PAYMOB_SECRET_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        payment.transactionId = response.data.id;

        await payment.save();

        return res.status(201).json({
            message: "Payment created successfully",
            payment,
            paymobResponse: response.data
        });

    } catch (error) {

        console.log(
            error.response?.data || error.message
        );

        return res.status(500).json({
            message: "Paymob error",
            error: error.response?.data || error.message
        });

    }
});

module.exports = {
    createPayment
};