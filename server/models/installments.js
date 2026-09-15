const mongoose = require("mongoose");

const installmentSchema = new mongoose.Schema(
    {
        productName: {
            type: String,
            required: true,
            trim: true,
        },

        totalPrice: {
            type: Number,
            required: true,
            min: 0,
        },

        downPayment: {
            type: Number,
            default: 0,
            min: 0,
        },

        monthlyPayment: {
            type: Number,
            required: true,
            min: 0,
        },

        totalMonths: {
            type: Number,
            required: true,
            min: 1,
        },

        paidMonths: {
            type: Number,
            default: 0,
            min: 0,
        },

        remainingAmount: {
            type: Number,
            default: 0,
            min: 0,
        },

        startDate: {
            type: Date,
            required: true,
        },

        nextPaymentDate: {
            type: Date,
            required: true,
        },

        status: {
            type: String,
            enum: ["active", "completed", "overdue"],
            default: "active",
        },

        notes: {
            type: String,
            trim: true,
            default: "",
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Installment =
    mongoose.models.Installment ||
    mongoose.model("Installment", installmentSchema);

module.exports = Installment;