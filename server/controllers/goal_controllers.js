
const asyncHandler = require("express-async-handler");
const SavingGoal = require("../models/Goal");

// =========================================
// Create Saving Goal
// =========================================

const createSavingGoal = asyncHandler(async (req, res) => {
  const {
    title,
    targetAmount,
    currentAmount = 0,
    deadline,
    status = "active",
  } = req.body;

  const savingGoal = await SavingGoal.create({
    title,
    targetAmount,
    currentAmount,
    deadline,
    status,
    user: req.user._id,
  });

  // Auto complete if already reached
  if (
    Number(savingGoal.currentAmount) >=
    Number(savingGoal.targetAmount)
  ) {
    savingGoal.status = "completed";
    await savingGoal.save();
  }

  res.status(201).json({
    message: "Saving goal created successfully",
    savingGoal,
  });
});

// =========================================
// Get All Saving Goals
// =========================================

const getAllSavingGoals = asyncHandler(async (req, res) => {
  const savingGoals = await SavingGoal.find({
    user: req.user._id,
  }).sort({
    createdAt: -1,
  });

  res.status(200).json({
    count: savingGoals.length,
    savingGoals,
  });
});

// =========================================
// Get Saving Goal By ID
// =========================================

const getSavingGoalById = asyncHandler(async (req, res) => {
  const savingGoal = await SavingGoal.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!savingGoal) {
    return res.status(404).json({
      message: "Saving goal not found",
    });
  }

  res.status(200).json(savingGoal);
});

// =========================================
// Update Saving Goal
// =========================================

const updateSavingGoal = asyncHandler(async (req, res) => {
  const savingGoal = await SavingGoal.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!savingGoal) {
    return res.status(404).json({
      message: "Saving goal not found",
    });
  }

  // Update only provided fields
  if (req.body.title !== undefined) {
    savingGoal.title = req.body.title;
  }

  if (req.body.targetAmount !== undefined) {
    savingGoal.targetAmount = Number(
      req.body.targetAmount
    );
  }

  if (req.body.currentAmount !== undefined) {
    savingGoal.currentAmount = Number(
      req.body.currentAmount
    );
  }

  if (req.body.deadline !== undefined) {
    savingGoal.deadline = req.body.deadline;
  }

  if (req.body.status !== undefined) {
    savingGoal.status = req.body.status;
  }

  // =========================================
  // Auto Status
  // =========================================

  if (
    Number(savingGoal.currentAmount) >=
    Number(savingGoal.targetAmount)
  ) {
    savingGoal.status = "completed";
  } else if (savingGoal.status === "completed") {
    savingGoal.status = "active";
  }

  await savingGoal.save();

  res.status(200).json({
    message: "Saving goal updated successfully",
    savingGoal,
  });
});

// =========================================
// Delete Saving Goal
// =========================================

const deleteSavingGoal = asyncHandler(async (req, res) => {
  const savingGoal = await SavingGoal.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!savingGoal) {
    return res.status(404).json({
      message: "Saving goal not found",
    });
  }

  await SavingGoal.deleteOne({
    _id: req.params.id,
  });

  res.status(200).json({
    message: "Saving goal deleted successfully",
  });
});

// =========================================
// CONTRIBUTE TO GOAL
// PATCH /goal/:id/contribute { amount }
// Increments currentAmount, records the contribution,
// auto-completes when the target is reached.
// =========================================

const contributeToGoal = asyncHandler(async (req, res) => {
  const amount = Number(req.body?.amount);

  if (!Number.isFinite(amount) || amount < 1) {
    return res.status(400).json({
      message: "A valid contribution amount (min 1) is required",
    });
  }

  const savingGoal = await SavingGoal.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!savingGoal) {
    return res.status(404).json({
      message: "Saving goal not found",
    });
  }

  savingGoal.currentAmount =
    Number(savingGoal.currentAmount || 0) + amount;

  savingGoal.contributions.push({ amount, date: new Date() });

  if (
    savingGoal.status === "active" &&
    Number(savingGoal.targetAmount) > 0 &&
    savingGoal.currentAmount >= Number(savingGoal.targetAmount)
  ) {
    savingGoal.status = "completed";
  }

  await savingGoal.save();

  res.status(200).json({
    success: true,
    goal: savingGoal,
  });
});

// =========================================
// Export
// =========================================

module.exports = {
  createSavingGoal,
  getAllSavingGoals,
  getSavingGoalById,
  updateSavingGoal,
  deleteSavingGoal,
  contributeToGoal,
};
