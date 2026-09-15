const webpush = require("web-push");

const PushSubscription = require("../models/PushSubscription");
const UserSettings = require("../models/UserSettings");

let configured = false;

const ensureConfigured = () => {
    if (configured) return true;

    const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } =
        process.env;

    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
        console.warn(
            "Web push disabled: VAPID keys missing in .env"
        );
        return false;
    }

    webpush.setVapidDetails(
        VAPID_SUBJECT || "mailto:admin@velora.app",
        VAPID_PUBLIC_KEY,
        VAPID_PRIVATE_KEY
    );

    configured = true;
    return true;
};

const getVapidPublicKey = () => process.env.VAPID_PUBLIC_KEY || "";

// Payment-critical notifications also go to the browser,
// even when the app is closed. Fire-and-forget by design.
const PUSH_TYPES = new Set(["bill", "installment"]);

const sendPushToUser = async (userId, { title, body, url = "/" }) => {
    try {
        if (!ensureConfigured()) return;

        const settings = await UserSettings.findOne({
            userId,
        }).lean();

        if (settings && settings.pushNotifications === false) {
            return;
        }

        const subs = await PushSubscription.find({
            user: userId,
        }).lean();

        if (!subs.length) return;

        const payload = JSON.stringify({ title, body, url });

        await Promise.all(
            subs.map(async (sub) => {
                try {
                    await webpush.sendNotification(
                        {
                            endpoint: sub.endpoint,
                            keys: sub.keys,
                        },
                        payload
                    );
                } catch (err) {
                    // Dead subscription (uninstalled/blocked) — drop it
                    if (
                        err?.statusCode === 404 ||
                        err?.statusCode === 410
                    ) {
                        await PushSubscription.deleteOne({
                            _id: sub._id,
                        }).catch(() => {});
                    } else {
                        console.error(
                            "Push send failed:",
                            err.message || err
                        );
                    }
                }
            })
        );
    } catch (err) {
        console.error(
            "Push dispatch failed:",
            err.message || err
        );
    }
};

module.exports = {
    ensureConfigured,
    getVapidPublicKey,
    sendPushToUser,
    PUSH_TYPES,
};
