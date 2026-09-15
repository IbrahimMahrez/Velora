const Notification = require("../models/Notification");
const User = require("../models/User");
const UserSettings = require("../models/UserSettings");
const sendEmail = require("../services/emailService");

const createNotification = async ({
    userId,
    title,
    message,
    type,
    relatedId = null,
    reminderType = null,
    reminderDate = null,
    emailSubject,
    emailEnabledKey,
}) => {
    if (!userId) {
        throw new Error("User ID is required to create notification");
    }

    // منع تكرار نفس التنبيه
    if (relatedId && reminderType && reminderDate) {
        const existingNotification = await Notification.findOne({
            user: userId,
            relatedId,
            reminderType,
            reminderDate,
        });

        if (existingNotification) {
            return existingNotification;
        }
    }

    const notification = await Notification.create({
        user: userId,
        title,
        message,
        type,
        relatedId,
        reminderType,
        reminderDate,
    });

    const [user, settings] = await Promise.all([
        User.findById(userId).select("name email"),
        UserSettings.findOne({ userId }),
    ]);

    const emailAllowed =
        user &&
        user.email &&
        settings?.emailNotifications !== false &&
        (!emailEnabledKey ||
            settings?.[emailEnabledKey] !== false);

    if (emailAllowed) {
        try {
            await sendEmail(
                user.email,
                emailSubject || title,
                `
                <div style="
                    font-family: Arial, sans-serif;
                    padding: 24px;
                    background: #111;
                    color: #fff;
                ">
                    <h2>${title}</h2>

                    <p style="color:#ccc;">
                        ${message}
                    </p>

                    <p style="
                        margin-top:24px;
                        color:#8b5cf6;
                        font-weight:bold;
                    ">
                        Velora
                    </p>
                </div>
                `
            );

            console.log(`✅ Notification email sent to ${user.email}`);
        } catch (emailError) {
            console.error(
                "❌ Notification email failed:",
                emailError.message
            );
        }
    } else {
        console.log("📪 Email notification is disabled.");
    }

    // Browser push for payment-critical reminders (bills,
    // installments) — works even with the app closed.
    // Fire-and-forget: never break notification creation.
    try {
        const { sendPushToUser, PUSH_TYPES } = require("../utils/push");

        if (type && PUSH_TYPES.has(type)) {
            sendPushToUser(userId, {
                title,
                body: message,
            }).catch(() => {});
        }
    } catch {
        // push infra optional — ignore
    }

    return notification;
};

module.exports = {
    createNotification,
};