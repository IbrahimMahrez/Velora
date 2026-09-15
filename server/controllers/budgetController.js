const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Budget = require("../models/Budget");
const Expenses = require("../models/Expenses");

const EXPENSE_CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Entertainment",
  "Health",
  "Education",
  "Other",
];

const getFirstOfMonth = () => {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
};

// GET /budgets
const getBudgets = asyncHandler(async (req, res) => {
  const budgets = await Budget.find({ user: req.user._id }).sort({
    category: 1,
  });

  const firstOfMonth = getFirstOfMonth();

  const spentAgg = await Expenses.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(req.user._id.toString()),
        date: { $gte: firstOfMonth },
      },
    },
    {
      $group: {
        _id: "$category",
        total: { $sum: "$amount" },
      },
    },
  ]);

  const spentByCategory = {};
  for (const row of spentAgg) {
    if (row._id) spentByCategory[row._id] = row.total;
  }

  const result = budgets.map((b) => {
    const spent = spentByCategory[b.category] || 0;
    const percent =
      b.monthlyLimit > 0
        ? Math.round((spent / b.monthlyLimit) * 100)
        : 0;
    return {
      _id: b._id,
      category: b.category,
      monthlyLimit: b.monthlyLimit,
      spent,
      percent,
    };
  });

  res.status(200).json({ success: true, budgets: result });
});

// POST /budgets
const createBudget = asyncHandler(async (req, res) => {
  const { category, monthlyLimit } = req.body;

  if (!category || !EXPENSE_CATEGORIES.includes(category)) {
    return res.status(400).json({
      success: false,
      message: `Category must be one of: ${EXPENSE_CATEGORIES.join(", ")}`,
    });
  }

  if (
    monthlyLimit === undefined ||
    monthlyLimit === null ||
    Number(monthlyLimit) < 1
  ) {
    return res.status(400).json({
      success: false,
      message: "monthlyLimit must be a number >= 1",
    });
  }

  const existing = await Budget.findOne({
    user: req.user._id,
    category,
  });

  if (existing) {
    return res.status(400).json({
      success: false,
      message: "Budget for this category already exists",
    });
  }

  const budget = await Budget.create({
    user: req.user._id,
    category,
    monthlyLimit: Number(monthlyLimit),
  });

  res.status(201).json({ success: true, budget });
});

// PUT /budgets/:id
const updateBudget = asyncHandler(async (req, res) => {
  const { monthlyLimit } = req.body;

  if (
    monthlyLimit === undefined ||
    monthlyLimit === null ||
    Number(monthlyLimit) < 1
  ) {
    return res.status(400).json({
      success: false,
      message: "monthlyLimit must be a number >= 1",
    });
  }

  const budget = await Budget.findById(req.params.id);

  if (!budget) {
    return res.status(404).json({
      success: false,
      message: "Budget not found",
    });
  }

  if (budget.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "Not authorized",
    });
  }

  budget.monthlyLimit = Number(monthlyLimit);
  await budget.save();

  res.status(200).json({ success: true, budget });
});

// DELETE /budgets/:id
const deleteBudget = asyncHandler(async (req, res) => {
  const budget = await Budget.findById(req.params.id);

  if (!budget) {
    return res.status(404).json({
      success: false,
      message: "Budget not found",
    });
  }

  if (budget.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "Not authorized",
    });
  }

  await Budget.deleteOne({ _id: budget._id });

  res.status(200).json({
    success: true,
    message: "Budget deleted successfully",
  });
});

module.exports = {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
};
