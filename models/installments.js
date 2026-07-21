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
    },

    downPayment: {
      type: Number,
      default: 0,
    },

    monthlyPayment: {
      type: Number,
      required: true,
    },

    totalMonths: {
      type: Number,
      required: true,
    },

    paidMonths: {
      type: Number,
      default: 0,
    },

    remainingAmount: {
      type: Number,
      
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