const express = require("express");

const router = express.Router();

const {
  exportBackup,
  importBackup,
} = require("../controllers/backupController");

const { verifytoken } = require("../middlewares/verifyToken");

router.get("/export", verifytoken, exportBackup);

// Backups can be large — allow up to 10MB just for import
router.post(
  "/import",
  verifytoken,
  express.json({ limit: "10mb" }),
  importBackup
);

module.exports = router;
