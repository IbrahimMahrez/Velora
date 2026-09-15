const express = require("express");

const router = express.Router();

const {
  getSubscription,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  markSubscriptionUsed,
  toggleAutoPost,
} = require("../controllers/subscriptions_controlles");

const { verifytoken } = require("../middlewares/verifyToken");

// Get all subscriptions
router.get("/", verifytoken, getSubscription);

// Get subscription by ID
router.get("/:id", verifytoken, getSubscriptionById);

// Create subscription
router.post("/", verifytoken, createSubscription);

// Update subscription
router.put("/:id", verifytoken, updateSubscription);

// Mark subscription as used
router.patch("/:id/used", verifytoken, markSubscriptionUsed);

// Toggle auto-post expense on renewal
router.patch("/:id/autopost", verifytoken, toggleAutoPost);

// Delete subscription
router.delete("/:id", verifytoken, deleteSubscription);

module.exports = router;