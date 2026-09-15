const express = require("express");

const router = express.Router();

const PushSubscription = require("../models/PushSubscription");

const { getVapidPublicKey } = require("../utils/push");

const { verifytoken } = require("../middlewares/verifyToken");

// Public key for the frontend subscription (safe to expose)
router.get("/vapid-key", (req, res) => {
    const key = getVapidPublicKey();

    if (!key) {
        return res.status(503).json({
            success: false,
            message: "Push notifications are not configured",
        });
    }

    res.status(200).json({ success: true, key });
});

// Save / refresh a browser subscription
router.post("/subscribe", verifytoken, async (req, res) => {
    try {
        const { endpoint, keys } = req.body?.subscription || req.body || {};

        if (
            !endpoint ||
            !keys?.p256dh ||
            !keys?.auth
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid push subscription",
            });
        }

        await PushSubscription.findOneAndUpdate(
            { endpoint },
            {
                user: req.user._id,
                endpoint,
                keys: {
                    p256dh: keys.p256dh,
                    auth: keys.auth,
                },
            },
            { upsert: true, new: true }
        );

        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to save push subscription",
        });
    }
});

// Remove a browser subscription
router.delete("/unsubscribe", verifytoken, async (req, res) => {
    try {
        const { endpoint } = req.body || {};

        if (!endpoint) {
            return res.status(400).json({
                success: false,
                message: "Endpoint is required",
            });
        }

        await PushSubscription.deleteOne({
            endpoint,
            user: req.user._id,
        });

        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to remove push subscription",
        });
    }
});

module.exports = router;
