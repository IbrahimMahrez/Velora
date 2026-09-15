const express = require("express");

const {
    chatWithAI,
    getAIInsights,
    categorizeExpense,
    scanReceipt
} = require("../controllers/aiController");

const {
    verifytoken
} = require("../middlewares/verifyToken");

const router =
    express.Router();


// AI CHAT

router.post(
    "/chat",
    verifytoken,
    chatWithAI
);


// AI INSIGHTS

router.get(
    "/insights",
    verifytoken,
    getAIInsights
);


// EXPENSE AUTO-CATEGORIZATION

router.post(
    "/categorize",
    verifytoken,
    categorizeExpense
);


// RECEIPT SCANNING (multipart image, never stored)

const multer = require("multer");

const scanUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        const ok = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ].includes(file.mimetype);

        if (ok) return cb(null, true);

        cb(new Error("Only JPG/PNG/WebP images are allowed"));
    },
});

router.post(
    "/scan-receipt",
    verifytoken,
    scanUpload.single("image"),
    scanReceipt
);


module.exports = router;