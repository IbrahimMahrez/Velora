const mongoose = require("mongoose");

const UserSettingsSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true,
        },

        language: {
            type: String,
            enum: ["English", "Arabic"],
            default: "English",
        },

        currency: {
            type: String,
            enum: ["EGP", "USD", "EUR"],
            default: "EGP",
        },

        monthStart: {
            type: Number,
            enum: [1, 15],
            default: 1,
        },

        emailNotifications: {
            type: Boolean,
            default: true,
        },

        pushNotifications: {
            type: Boolean,
            default: true,
        },

        billReminders: {
            type: Boolean,
            default: true,
        },

        subscriptionReminders: {
            type: Boolean,
            default: true,
        },

        installmentReminders: {
            type: Boolean,
            default: true,
        },

        goalReminders: {
            type: Boolean,
            default: true,
        },

        theme: {
            type: String,
            enum: ["dark", "light"],
            default: "dark",
        },

        accentColor: {
            type: String,
            default: "#7d5cff",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("UserSettings", UserSettingsSchema);