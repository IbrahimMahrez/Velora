const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Joi = require("joi");
const helmet = require("helmet");
const cors = require("cors");
const path = require("path");
const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({ windowMs: 15*60*1000, max: 20, standardHeaders: "draft-8", legacyHeaders: false, message: { success:false, message:"Too many attempts, please try again later." } });

// Middlewares
const { notFound, errorHandler } = require("./middlewares/errors");

// Routes
const planRoutes = require("./routes/plan");
const userPlanRoutes = require("./routes/userPlan");
const expensesRoutes = require("./routes/expenses");
const adminRoutes = require("./routes/admin");

// Jobs
require("./jobs/reminderJob");

// Load environment variables
dotenv.config();

const app = express();

// ======================================================
// CORS
// ======================================================

const FRONTEND_URLS = (process.env.FRONTEND_URL || "http://localhost:5173").split(",").map(s => s.trim()).filter(Boolean);

const corsOptions = {
    origin: FRONTEND_URLS.length === 1 ? FRONTEND_URLS[0] : FRONTEND_URLS,

    credentials: true,

    methods: [
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS",
    ],

    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "Cache-Control",
        "Pragma",
    ],
};

app.use(cors(corsOptions));

// ======================================================
// SECURITY
// ======================================================

app.use(
    helmet({
        crossOriginResourcePolicy: false,
    })
);

// ======================================================
// BODY PARSERS
// ======================================================

app.use(express.json());

app.use(
    express.urlencoded({
        extended: false,
    })
);

// ======================================================
// STATIC FILES
// ======================================================

app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
);

// ======================================================
// VIEW ENGINE
// ======================================================

app.set("view engine", "ejs");

// ======================================================
// DATABASE + SERVER
// Never boot a dead server: if MongoDB is unreachable
// (wrong URI, Atlas IP whitelist, network down) exit
// with a clear message instead of accepting requests
// that can only fail with buffering timeouts.
// ======================================================

const port = process.env.PORT || 7000;

connectDB()
  .then(() => {
    // Schedulers need a live DB connection, so they
    // start only after MongoDB is reachable.
    const {
      startNotificationScheduler,
      runNotificationChecks,
    } = require("./services/notificationScheduler");

    startNotificationScheduler();
    runNotificationChecks();

    app.listen(port, () => {
      console.log(
        `Server is running in ${process.env.NODE_ENV || "development"} mode on port ${port}`
      );

      console.log(
        `http://localhost:${port}`
      );
    });
  })
  .catch((err) => {
    console.error(
      "Could not connect to MongoDB. Server not started."
    );
    console.error(`Reason: ${err.message}`);
    console.error(
      "If you use MongoDB Atlas, whitelist your current IP: Atlas dashboard > Network Access > Add IP Address."
    );
    process.exit(1);
  });

// ======================================================
// ROUTES
// ======================================================

// Authentication
app.use("/auth/login", authLimiter);
app.use("/auth/forgetpassword", authLimiter);
app.use("/auth/send-verification", authLimiter);
app.use(
    "/auth",
    require("./routes/auth")
);

// Subscriptions
app.use(
    "/subscription",
    require("./routes/subscriptions")
);

// Bills
app.use(
    "/bills",
    require("./routes/bills")
);

// Expenses
app.use(
    "/expenses",
    (req, res, next) => {
        res.set("Cache-Control", "no-store");
        next();
    }
);

app.use(
    "/expenses",
    expensesRoutes
);

// Budgets
app.use(
    "/budgets",
    require("./routes/budget")
);

// Family
app.use(
    "/family",
    require("./routes/family")
);

// Installments
app.use(
    "/installments",
    require("./routes/installments")
);

// Goals
app.use(
    "/goal",
    require("./routes/goal")
);

// Dashboard
app.use(
    "/dashboard",
    require("./routes/dashboard")
);

// Plans
app.use(
    "/plans",
    planRoutes
);

// User Plan
app.use(
    "/user-plan",
    userPlanRoutes
);

// Users
const userRoutes = require("./routes/userRoutes");

app.use(
    "/users",
    userRoutes
);

// Payments
const paymentRoutes = require("./routes/payment");

app.use(
    "/payments",
    paymentRoutes
);

// AI
const aiRoutes = require("./routes/aiRoutes");

app.use(
    "/ai",
    aiRoutes
);

// Notifications
const notificationRoutes = require("./routes/notification");

app.use(
    "/notifications",
    notificationRoutes
);

// Notification Settings
const notificationSettingsRoutes = require("./routes/notificationSettingsRoutes");

app.use(
    "/notification-settings",
    notificationSettingsRoutes
);

// Web Push
const pushRoutes = require("./routes/push");

app.use(
    "/push",
    pushRoutes
);

// Backup (export / import)
const backupRoutes = require("./routes/backup");

app.use(
    "/backup",
    backupRoutes
);

// Settings
const settingsRoutes = require("./routes/settingsRoutes");

app.use(
    "/settings",
    settingsRoutes
);

// ======================================================
// ADMIN ROUTES
// ======================================================

app.use(
    "/admin",
    adminRoutes
);

// ======================================================
// ERROR HANDLING
// ======================================================

app.use(notFound);

app.use(errorHandler);