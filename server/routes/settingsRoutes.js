const express = require("express");

const {
    getSettings,
    updateSettings,
    changePassword,
    deleteAccount,
} = require("../controllers/settingsController");

const { verifytoken } = require("../middlewares/verifyToken");

const router = express.Router();

// Get settings
router.get("/", verifytoken, getSettings);

// Update settings
router.put("/", verifytoken, updateSettings);

// Change password
router.put("/password", verifytoken, changePassword);

// Delete account
router.delete("/account", verifytoken, deleteAccount);

module.exports = router;