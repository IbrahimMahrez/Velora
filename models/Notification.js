const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            minlength: 3
        },

        message: {
            type: String,
            required: true,
            trim: true,
            minlength: 5
        },

        type: {
            type: String,
            enum: [
                "bill",
                "expense",
                "subscription",
                "installment",
                "goal",
                "system"
            ],
            required: true
        },

        isRead: {
            type: Boolean,
            default: false
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

const Notification =
    mongoose.models.Notification ||
    mongoose.model("Notification", notificationSchema);

module.exports = Notification;