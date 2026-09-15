const mongoose = require("mongoose");

const notificationSettingsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    bill: {
      type: Boolean,
      default: true,
    },

    expense: {
      type: Boolean,
      default: true,
    },

    subscription: {
      type: Boolean,
      default: true,
    },

    installment: {
      type: Boolean,
      default: true,
    },

    goal: {
      type: Boolean,
      default: true,
    },

    system: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const NotificationSettings =
  mongoose.models.NotificationSettings ||
  mongoose.model("NotificationSettings", notificationSettingsSchema);

module.exports = NotificationSettings;