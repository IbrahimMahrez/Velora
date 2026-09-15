const jwt = require("jsonwebtoken");
const User = require("../models/User");


// ========================================
// Verify Token
// ========================================

const verifytoken = async (req, res, next) => {
    try {
        // Get Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "No authorization token provided",
            });
        }

        // Check Bearer
        if (!authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Invalid authorization format",
            });
        }

        // Extract token
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token is missing",
            });
        }

        // Verify JWT
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        console.log("🔐 DECODED TOKEN:", decoded);

        // Get user ID from token
        const userId = decoded.id || decoded._id || decoded.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User ID not found in token",
            });
        }

        // Get user from database
        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }

        // Attach user to request
        req.user = user;

        console.log("👤 AUTHENTICATED USER:", req.user._id);

        next();

    } catch (error) {

        console.error("❌ VERIFY TOKEN ERROR:", error.message);

        // Persistent debug log: a user-specific 500 was reported
        // ("Authentication failed" on expenses). Capture the exact
        // error so the root cause can be fixed instead of guessed.
        try {
            const fs = require("fs");
            const path = require("path");
            const logDir = path.join(__dirname, "..", "logs");

            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true });
            }

            const logFile = path.join(logDir, "auth-errors.log");

            // Rotate: keep the debug log small
            try {
                const stat = fs.statSync(logFile);
                if (stat.size > 1024 * 1024) {
                    fs.writeFileSync(logFile, "");
                }
            } catch {
                // file may not exist yet
            }

            fs.appendFileSync(
                path.join(logDir, "auth-errors.log"),
                JSON.stringify({
                    at: new Date().toISOString(),
                    method: req.method,
                    url: req.originalUrl,
                    hasAuthHeader: Boolean(req.headers.authorization),
                    errorName: error.name,
                    errorMessage: error.message,
                    errorStack: String(
                        error.stack || ""
                    ).split("\n").slice(0, 5),
                }) + "\n"
            );
        } catch {
            // logging must never break auth
        }

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid token",
            });
        }

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token expired",
            });
        }

        // Malformed user id inside an otherwise Decodable token
        // (stale/corrupt stored token) — treat as invalid auth,
        // NOT a server error, so the app redirects to login
        // instead of showing a dead-end 500.
        if (
            error.name === "CastError" ||
            error.name === "BSONError" ||
            error.name === "BSONTypeError"
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid token",
            });
        }

        // Database unreachable (DNS flap, Atlas hiccup...).
        // This is NOT an auth problem — answer 503 so clients
        // retry instead of logging the user out.
        const isDbDown =
            error.name === "MongoServerSelectionError" ||
            error.name === "MongooseServerSelectionError" ||
            error.name === "MongoNetworkError" ||
            error.name === "MongoNetworkTimeoutError" ||
            /ENOTFOUND|ETIMEDOUT|ECONNREFUSED/i.test(
                error.message || ""
            );

        if (isDbDown) {
            return res.status(503).json({
                success: false,
                message:
                    "Service temporarily unavailable, please try again",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Authentication failed",
        });
    }
};


// ========================================
// Authorization
// ========================================

const verifyAuthorization = (req, res, next) => {

    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }

    next();
};


// ========================================
// Admin Authorization
// ========================================

const verifyAuthorizationadmin = (req, res, next) => {

    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }

    if (!req.user.isAdmin) {
        return res.status(403).json({
            success: false,
            message: "Admin access required",
        });
    }

    next();
};


module.exports = {
    verifytoken,
    verifyAuthorization,
    verifyAuthorizationadmin,
};