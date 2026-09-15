const mongoose = require("mongoose");

const PlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      enum: ["free", "premium", "family"],
    },

    description: {
      type: String,
      default: "",
    },

    monthlyPrice: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    yearlyPrice: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    duration: {
      type: Number,
      default: 30,
    },

    features: [
      {
        type: String,
      },
    ],

    isPopular: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Plan", PlanSchema);