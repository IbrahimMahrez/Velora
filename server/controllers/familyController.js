const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Family = require("../models/Family");
const Expenses = require("../models/Expenses");

const MAX_MEMBERS = 10;

// GET /family — family of current user
const getMyFamily = asyncHandler(async (req, res) => {
  const family = await Family.findOne({
    members: req.user._id,
  })
    .populate("members", "name email")
    .populate("owner", "name email");

  if (!family) {
    return res.status(200).json({ success: true, family: null });
  }

  // Current-month expense total per member
  const firstOfMonth = new Date();
  firstOfMonth.setDate(1);
  firstOfMonth.setHours(0, 0, 0, 0);

  const memberIds = family.members.map((m) => m._id);

  const totals = await Expenses.aggregate([
    {
      $match: {
        user: { $in: memberIds },
        date: { $gte: firstOfMonth },
      },
    },
    {
      $group: {
        _id: "$user",
        total: { $sum: "$amount" },
      },
    },
  ]);

  const totalByUser = {};
  for (const row of totals) {
    totalByUser[row._id.toString()] = row.total;
  }

  const stats = family.members.map((m) => ({
    userId: m._id,
    name: m.name,
    monthTotal: totalByUser[m._id.toString()] || 0,
  }));

  const spent = stats.reduce(
    (sum, s) => sum + Number(s.monthTotal || 0),
    0
  );

  const budgetAmount = Number(family.sharedBudget?.amount) || 0;

  res.status(200).json({
    success: true,
    family: {
      _id: family._id,
      name: family.name,
      inviteCode: family.inviteCode,
      owner: family.owner,
      members: family.members,
      stats,
      budget: {
        amount: budgetAmount,
        spent,
        percent:
          budgetAmount > 0
            ? Math.round((spent / budgetAmount) * 100)
            : 0,
      },
    },
  });
});

// POST /family
const createFamily = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name || !String(name).trim()) {
    return res.status(400).json({
      success: false,
      message: "Family name is required",
    });
  }

  const existing = await Family.findOne({
    members: req.user._id,
  });

  if (existing) {
    return res.status(400).json({
      success: false,
      message: "You are already in a family",
    });
  }

  const family = await Family.create({
    name: String(name).trim(),
    owner: req.user._id,
    members: [req.user._id],
  });

  await family.populate("members", "name email");
  await family.populate("owner", "name email");

  res.status(201).json({ success: true, family });
});

// POST /family/join
const joinFamily = asyncHandler(async (req, res) => {
  const { code } = req.body;

  if (!code || !String(code).trim()) {
    return res.status(400).json({
      success: false,
      message: "Invite code is required",
    });
  }

  const normalized = String(code).trim().toUpperCase();

  const alreadyIn = await Family.findOne({
    members: req.user._id,
  });

  if (alreadyIn) {
    return res.status(400).json({
      success: false,
      message: "You are already in a family",
    });
  }

  const family = await Family.findOne({ inviteCode: normalized });

  if (!family) {
    return res.status(404).json({
      success: false,
      message: "Family not found",
    });
  }

  if (family.members.some((m) => m.toString() === req.user._id.toString())) {
    return res.status(400).json({
      success: false,
      message: "You are already a member of this family",
    });
  }

  if (family.members.length >= MAX_MEMBERS) {
    return res.status(400).json({
      success: false,
      message: "Family is full (max 10 members)",
    });
  }

  family.members.push(req.user._id);
  await family.save();
  await family.populate("members", "name email");
  await family.populate("owner", "name email");

  res.status(200).json({ success: true, family });
});

// POST /family/leave
const leaveFamily = asyncHandler(async (req, res) => {
  const family = await Family.findOne({
    members: req.user._id,
  });

  if (!family) {
    return res.status(404).json({
      success: false,
      message: "Family not found",
    });
  }

  const isOwner = family.owner.toString() === req.user._id.toString();

  if (isOwner) {
    if (family.members.length <= 1) {
      await Family.deleteOne({ _id: family._id });
      return res.status(200).json({
        success: true,
        message: "Family deleted successfully",
      });
    }
    return res.status(400).json({
      success: false,
      message:
        "Owner cannot leave the family while other members exist. Remove members or delete the family instead.",
    });
  }

  family.members = family.members.filter(
    (m) => m.toString() !== req.user._id.toString()
  );
  await family.save();

  res.status(200).json({
    success: true,
    message: "Left family successfully",
  });
});

// POST /family/remove  { userId }
const removeMember = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "userId is required",
    });
  }

  if (userId.toString() === req.user._id.toString()) {
    return res.status(400).json({
      success: false,
      message: "You cannot remove yourself. Use leave instead.",
    });
  }

  const family = await Family.findOne({
    members: req.user._id,
  });

  if (!family) {
    return res.status(404).json({
      success: false,
      message: "Family not found",
    });
  }

  if (family.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "Only the owner can remove members",
    });
  }

  if (!family.members.some((m) => m.toString() === userId.toString())) {
    return res.status(404).json({
      success: false,
      message: "Member not found in this family",
    });
  }

  family.members = family.members.filter(
    (m) => m.toString() !== userId.toString()
  );
  await family.save();
  await family.populate("members", "name email");

  res.status(200).json({ success: true, family });
});

// DELETE /family
const deleteFamily = asyncHandler(async (req, res) => {
  const family = await Family.findOne({
    members: req.user._id,
  });

  if (!family) {
    return res.status(404).json({
      success: false,
      message: "Family not found",
    });
  }

  if (family.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "Only the owner can delete the family",
    });
  }

  await Family.deleteOne({ _id: family._id });

  res.status(200).json({
    success: true,
    message: "Family deleted successfully",
  });
});

// PUT /family/budget  { monthlyLimit } — owner only
const setFamilyBudget = asyncHandler(async (req, res) => {
  const monthlyLimit = Number(req.body?.monthlyLimit);

  if (!Number.isFinite(monthlyLimit) || monthlyLimit < 0) {
    return res.status(400).json({
      success: false,
      message: "A valid monthly limit is required",
    });
  }

  const family = await Family.findOne({
    members: req.user._id,
  });

  if (!family) {
    return res.status(404).json({
      success: false,
      message: "Family not found",
    });
  }

  if (family.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "Only the owner can set the family budget",
    });
  }

  family.sharedBudget = { amount: monthlyLimit };
  await family.save();

  res.status(200).json({
    success: true,
    budget: { amount: monthlyLimit },
  });
});

module.exports = {
  getMyFamily,
  createFamily,
  joinFamily,
  leaveFamily,
  removeMember,
  deleteFamily,
  setFamilyBudget,
};
