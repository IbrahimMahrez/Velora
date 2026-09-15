
const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Joi = require("joi");
const helmet = require("helmet");
const cors = require("cors");
const path = require("path");
const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts, please try again later.",
  },
});

// ======================================================
// MIDDLEWARES
// ======================================================

const { notFound, errorHandler } = require("./middlewares/errors");

// ======================================================
// ROUTES
// ======================================================

const planRoutes = require("./routes/plan");
const userPlanRoutes = require("./routes/userPlan");
const expensesRoutes = require("./routes/expenses");
const adminRoutes = require("./routes/admin");

// ======================================================
// LOAD ENVIRONMENT VARIABLES
// ======================================================

dotenv.config();

// ======================================================
// INIT
// ======================================================

const app = express();

// ======================================================
// CORS
// ======================================================

const FRONTEND_URLS = (
  process.env.FRONTEND_URL ||
  "http://localhost:5173"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests without Origin
    // Example: Postman / server-to-server
    if (!origin) {
      return callback(null, true);
    }

    if (FRONTEND_URLS.includes(origin)) {
      return callback(null, true);
    }

    return callback(
      new Error(`CORS blocked origin: ${origin}`)
    );
  },

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

  optionsSuccessStatus: 204,
};

// CORS middleware
app.use(cors(corsOptions));

// Explicitly handle preflight requests
app.options(/.*/, cors(corsOptions));

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
// ======================================================

const port = process.env.PORT || 8000;

connectDB()
  .then(() => {
    // Start schedulers only after MongoDB is connected
    const {
      startNotificationScheduler,
      runNotificationChecks,
    } = require("./services/notificationScheduler");

    startNotificationScheduler();
    runNotificationChecks();

    app.listen(port, () => {
      console.log(
        `Server is running in ${
          process.env.NODE_ENV || "development"
        } mode on port ${port}`
      );

      console.log(
        `Server URL: http://localhost:${port}`
      );

      console.log(
        "Allowed Frontend URLs:",
        FRONTEND_URLS
      );
    });
  })
  .catch((err) => {
    console.error(
      "Could not connect to MongoDB. Server not started."
    );

    console.error(
      `Reason: ${err.message}`
    );

    console.error(
      "If you use MongoDB Atlas, whitelist your server IP in Atlas > Network Access."
    );

    process.exit(1);
  });

// ======================================================
// ROUTES
// ======================================================

// Authentication
app.use(
  "/auth/login",
  authLimiter
);

app.use(
  "/auth/forgetpassword",
  authLimiter
);

app.use(
  "/auth/send-verification",
  authLimiter
);

app.use(
  "/auth",
  require("./routes/auth")
);

// ======================================================
// SUBSCRIPTIONS
// ======================================================

app.use(
  "/subscription",
  require("./routes/subscriptions")
);

// ======================================================
// BILLS
// ======================================================

app.use(
  "/bills",
  require("./routes/bills")
);

// ======================================================
// EXPENSES
// ======================================================

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

// ======================================================
// BUDGETS
// ======================================================

app.use(
  "/budgets",
  require("./routes/budget")
);

// ======================================================
// FAMILY
// ======================================================

app.use(
  "/family",
  require("./routes/family")
);

// ======================================================
// INSTALLMENTS
// ======================================================

app.use(
  "/installments",
  require("./routes/installments")
);

// ======================================================
// GOALS
// ======================================================

app.use(
  "/goal",
  require("./routes/goal")
);

// ======================================================
// DASHBOARD
// ======================================================

app.use(
  "/dashboard",
  require("./routes/dashboard")
);

// ======================================================
// PLANS
// ======================================================

app.use(
  "/plans",
  planRoutes
);

// ======================================================
// USER PLAN
// ======================================================

app.use(
  "/user-plan",
  userPlanRoutes
);

// ======================================================
// USERS
// ======================================================

const userRoutes = require("./routes/userRoutes");

app.use(
  "/users",
  userRoutes
);

// ======================================================
// PAYMENTS
// ======================================================

const paymentRoutes = require("./routes/payment");

app.use(
  "/payments",
  paymentRoutes
);

// ======================================================
// AI
// ======================================================

const aiRoutes = require("./routes/aiRoutes");

app.use(
  "/ai",
  aiRoutes
);

// ======================================================
// NOTIFICATIONS
// ======================================================

const notificationRoutes = require("./routes/notification");

app.use(
  "/notifications",
  notificationRoutes
);

// ======================================================
// NOTIFICATION SETTINGS
// ======================================================

const notificationSettingsRoutes = require(
  "./routes/notificationSettingsRoutes"
);

app.use(
  "/notification-settings",
  notificationSettingsRoutes
);

// ======================================================
// WEB PUSH
// ======================================================

const pushRoutes = require("./routes/push");

app.use(
  "/push",
  pushRoutes
);

// ======================================================
// BACKUP
// ======================================================

const backupRoutes = require("./routes/backup");

app.use(
  "/backup",
  backupRoutes
);

// ======================================================
// SETTINGS
// ======================================================

const settingsRoutes = require(
  "./routes/settingsRoutes"
);

app.use(
  "/settings",
  settingsRoutes
);

// ======================================================
// ADMIN
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
