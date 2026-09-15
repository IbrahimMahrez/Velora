const asyncHandler = require("express-async-handler");

const NotificationSettings = require("../models/NotificationSettings");

// ======================================================
// GET NOTIFICATION SETTINGS
// GET /notification-settings
// ======================================================

const getNotificationSettings = asyncHandler(async (req, res) => {
  let settings = await NotificationSettings.findOne({
    user: req.user._id,
  });

  // Create default settings automatically
  if (!settings) {
    settings = await NotificationSettings.create({
      user: req.user._id,
    });
  }

  res.status(200).json({
    success: true,
    settings,
  });
});

// ======================================================
// UPDATE NOTIFICATION SETTINGS
// PUT /notification-settings
// ======================================================

const updateNotificationSettings = asyncHandler(async (req, res) => {
  const allowedFields = [
    "bill",
    "expense",
    "subscription",
    "installment",
    "goal",
    "system",
  ];

  const updateData = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updateData[field] = Boolean(req.body[field]);
    }
  });

  let settings = await NotificationSettings.findOne({
    user: req.user._id,
  });

  if (!settings) {
    settings = await NotificationSettings.create({
      user: req.user._id,
      ...updateData,
    });
  } else {
    Object.assign(settings, updateData);
    await settings.save();
  }

  res.status(200).json({
    success: true,
    message: "Notification preferences updated successfully",
    settings,
  });
});

module.exports = {
  getNotificationSettings,
  updateNotificationSettings,
};