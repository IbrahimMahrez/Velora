const mongoose = require("mongoose");

const SubscriptionsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 5,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
    },

    category: {
      type: String,
      enum: [
        "Entertainment",
        "Education",
        "Sports",
        "Health",
        "Finance",
        "Travel",
        "Food",
        "Music",
        "Other",
      ],
      default: "Other",
    },

    renewalCycle: {
      type: String,
      enum: ["monthly", "yearly", "weekly"],
      default: "monthly",
    },

    renewalDate: {
      type: Date,
      required: true,
    },

    lastUsedAt: {
      type: Date,
      default: null,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    autoPostExpense: {
      type: Boolean,
      default: true,
    },

    lastPostedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Subscriptions", SubscriptionsSchema);