const express = require("express");

const router = express.Router();

const {
  getProfile,
  updateProfile,
  updateAvatar,
} = require("../controllers/userController");

const {
  verifytoken,
  verifyAuthorization,
} = require("../middlewares/verifyToken");

const upload = require("../middlewares/uploads");

// Get profile
router.get(
  "/profile",
  verifytoken,
  verifyAuthorization,
  getProfile
);


// Update profile
router.put(
  "/profile",
  verifytoken,
  verifyAuthorization,
  updateProfile
);

// Update profile avatar
router.put(
  "/profile/avatar",
  verifytoken,
  verifyAuthorization,
  upload.single("avatar"),
  updateAvatar
);
module.exports = router;