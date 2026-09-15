const express = require("express");

const router = express.Router();

const {
  verifytoken,
  verifyAuthorizationadmin,
} = require("../middlewares/verifyToken");

const {
  getAdminDashboard,
  getAllUsers,
  getUserDetails,
  deleteUser,
  getAllPayments,
  getRevenueAnalytics,
  getAllPlans,
  createPlan,
  updatePlan,
  deletePlan,
  broadcastNotification,
} = require("../controllers/adminController");

// Dashboard
router.get(
  "/dashboard",
  verifytoken,
  verifyAuthorizationadmin,
  getAdminDashboard
);

// Users
router.get(
  "/users",
  verifytoken,
  verifyAuthorizationadmin,
  getAllUsers
);

router.get(
  "/users/:id",
  verifytoken,
  verifyAuthorizationadmin,
  getUserDetails
);

router.delete(
  "/users/:id",
  verifytoken,
  verifyAuthorizationadmin,
  deleteUser
);

// Payments
router.get(
  "/payments",
  verifytoken,
  verifyAuthorizationadmin,
  getAllPayments
);

// Revenue
router.get(
  "/revenue",
  verifytoken,
  verifyAuthorizationadmin,
  getRevenueAnalytics
);

// Plans
router.get(
  "/plans",
  verifytoken,
  verifyAuthorizationadmin,
  getAllPlans
);

router.post(
  "/plans",
  verifytoken,
  verifyAuthorizationadmin,
  createPlan
);

router.patch(
  "/plans/:id",
  verifytoken,
  verifyAuthorizationadmin,
  updatePlan
);

router.delete(
  "/plans/:id",
  verifytoken,
  verifyAuthorizationadmin,
  deletePlan
);

router.post(
  "/broadcast",
  verifytoken,
  verifyAuthorizationadmin,
  broadcastNotification
);

module.exports = router;