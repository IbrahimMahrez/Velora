const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
        },

        message: {
            type: String,
            required: true,
            trim: true,
            minlength: 5,
        },

        type: {
            type: String,
            enum: [
                "bill",
                "expense",
                "subscription",
                "installment",
                "goal",
                "system",
            ],
            required: true,
        },

        isRead: {
            type: Boolean,
            default: false,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // العنصر المرتبط بالتنبيه
        relatedId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },

        // نوع الحدث نفسه
        reminderType: {
            type: String,
            default: null,
        },

        // اليوم الذي تم إرسال التذكير فيه
        reminderDate: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// يمنع إنشاء نفس التذكير لنفس المستخدم في نفس اليوم
notificationSchema.index(
    {
        user: 1,
        relatedId: 1,
        reminderType: 1,
        reminderDate: 1,
    },
    {
        unique: true,
        sparse: true,
    }
);

const Notification =
    mongoose.models.Notification ||
    mongoose.model("Notification", notificationSchema);

module.exports = Notification;