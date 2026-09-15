const express = require("express");

const router = express.Router();

const {
  getNotificationSettings,
  updateNotificationSettings,
} = require("../controllers/notificationSettingsController");

const { verifytoken } = require("../middlewares/verifyToken");

router.use(verifytoken);

router.get("/", getNotificationSettings);

router.put("/", updateNotificationSettings);

module.exports = router;