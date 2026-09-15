const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");

const Expense = require("../models/Expenses");
const Bill = require("../models/Bills");
const Subscription = require("../models/Subscriptions");
const Installment = require("../models/installments");
const Goal = require("../models/Goal");
const Budget = require("../models/Budget");
const UserSettings = require("../models/UserSettings");

const BACKUP_VERSION = 1;

// Collections included in the backup. Family is intentionally
// excluded (shared with other users), notifications are
// transient and excluded too.
const COLLECTIONS = {
  expenses: Expense,
  bills: Bill,
  subscriptions: Subscription,
  installments: Installment,
  goals: Goal,
  budgets: Budget,
};

const stripDoc = (doc) => {
  const obj =
    typeof doc.toObject === "function" ? doc.toObject() : { ...doc };
  delete obj._id;
  delete obj.__v;
  return obj;
};

// ======================================================
// EXPORT BACKUP
// GET /backup/export
// ======================================================

const exportBackup = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const collections = {};

  for (const [key, Model] of Object.entries(COLLECTIONS)) {
    const docs = await Model.find({ user: userId }).lean();
    collections[key] = docs.map(stripDoc);
  }

  const settingsDoc = await UserSettings.findOne({
    userId,
  }).lean();

  const settings = settingsDoc
    ? stripDoc(settingsDoc)
    : null;

  if (settings) {
    delete settings.userId;
  }

  res.status(200).json({
    success: true,
    backup: {
      version: BACKUP_VERSION,
      app: "velora",
      exportedAt: new Date().toISOString(),
      collections,
      settings,
    },
  });
});

// ======================================================
// IMPORT BACKUP (REPLACE)
// POST /backup/import { backup }
// Replaces the user's data in the included collections.
// ======================================================

const importBackup = asyncHandler(async (req, res) => {
  const { backup } = req.body || {};

  if (
    !backup ||
    backup.app !== "velora" ||
    backup.version !== BACKUP_VERSION ||
    typeof backup.collections !== "object"
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid backup file",
    });
  }

  const userId = new mongoose.Types.ObjectId(req.user._id);
  const counts = {};

  for (const [key, Model] of Object.entries(COLLECTIONS)) {
    const docs = backup.collections[key];

    if (docs !== undefined && !Array.isArray(docs)) {
      return res.status(400).json({
        success: false,
        message: `Invalid backup section: ${key}`,
      });
    }

    await Model.deleteMany({ user: userId });

    const clean = (Array.isArray(docs) ? docs : [])
      .filter((d) => d && typeof d === "object")
      .map((d) => {
        const doc = { ...d };
        delete doc._id;
        delete doc.__v;
        doc.user = userId;
        return doc;
      });

    if (clean.length > 0) {
      await Model.insertMany(clean, { ordered: false });
    }

    counts[key] = clean.length;
  }

  if (backup.settings && typeof backup.settings === "object") {
    const settings = { ...backup.settings };
    delete settings._id;
    delete settings.__v;
    delete settings.userId;

    await UserSettings.findOneAndUpdate(
      { userId },
      { $set: settings },
      { upsert: true, new: true }
    );
  }

  res.status(200).json({
    success: true,
    message: "Backup restored successfully",
    counts,
  });
});

module.exports = {
  exportBackup,
  importBackup,
};
