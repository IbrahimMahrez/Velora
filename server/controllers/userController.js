const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const UserPlan = require("../models/UserPlan");

// ======================================================
// GET USER PROFILE
// GET /users/profile
// ======================================================

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const membership = await UserPlan.findOne({
    user: req.user._id,
    status: "active",
  }).populate("plan");

  res.status(200).json({
    success: true,

    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      occupation: user.occupation,
      isVerified: user.isVerified,
      isAdmin: user.isAdmin,
      date: user.date,
    },

    membership: membership
      ? {
          _id: membership._id,
          plan: membership.plan,
          startDate: membership.startDate,
          endDate: membership.endDate,
          status: membership.status,
        }
      : null,
  });
});


// ======================================================
// UPDATE USER PROFILE
// PUT /users/profile
// ======================================================

const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, occupation } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  if (name !== undefined) {
    user.name = name;
  }

  if (occupation !== undefined) {
    user.occupation = occupation;
  }

  if (email !== undefined && email !== user.email) {
    const existingUser = await User.findOne({
      email,
      _id: { $ne: user._id },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already in use",
      });
    }

    user.email = email;
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",

    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      occupation: user.occupation,
      isVerified: user.isVerified,
      date: user.date,
    },
  });
});
// ======================================================
// UPDATE PROFILE AVATAR
// PUT /users/profile/avatar
// ======================================================

const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Please select an image.",
    });
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  user.avatar = `/${req.file.path.replace(/\\/g, "/")}`;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile photo updated successfully",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      occupation: user.occupation,
      isVerified: user.isVerified,
      date: user.date,
    },
  });
});


module.exports = {
  getProfile,
  updateProfile,
    updateAvatar,
};