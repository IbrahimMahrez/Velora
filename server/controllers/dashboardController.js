const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");

const Expense = require("../models/Expenses");
const Bill = require("../models/Bills");
const Subscription = require("../models/Subscriptions");
const Installment = require("../models/installments");
const Goal = require("../models/Goal");
const UserPlan = require("../models/UserPlan");

const { sumPipeline } = require("../utils/aggregateUtils");

const getDashboard = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(
    req.user._id.toString()
  );

  console.log("USER ID:", userId);

  const [
    totalExpenses,
    totalBills,
    pendingBills,
    totalBillsAmount,
    totalSubscriptions,
    monthlySubscriptionsCost,
    activeInstallments,
    remainingInstallments,
    totalGoals,
    completedGoals,
    recentExpenses,
    upcomingBills,
    upcomingInstallments,
    currentPlan,
  ] = await Promise.all([
    // Expenses
    Expense.aggregate([
      {
        $match: {
          user: userId,
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$amount",
          },
        },
      },
    ]),

    // Bills
    Bill.countDocuments({
      user: userId,
    }),

    Bill.countDocuments({
      user: userId,
      status: "pending",
    }),

    Bill.aggregate(
      sumPipeline(userId, "amount")
    ),

    // Subscriptions
    Subscription.countDocuments({
      user: userId,
    }),

    Subscription.aggregate(
      sumPipeline(userId, "price")
    ),

    // Installments
    Installment.countDocuments({
      user: userId,
      status: "active",
    }),

    Installment.aggregate(
      sumPipeline(userId, "remainingAmount")
    ),

    // Goals
    Goal.countDocuments({
      user: userId,
    }),

    Goal.countDocuments({
      user: userId,
      status: "completed",
    }),

    // Recent Expenses
    Expense.find({
      user: userId,
    })
      .sort({ date: -1 })
      .limit(25),

    // Upcoming Bills
    Bill.find({
      user: userId,
      status: "pending",
    })
      .sort({ dueDate: 1 })
      .limit(5),

    // Upcoming Installments
    Installment.find({
      user: userId,
      status: "active",
    })
      .sort({ nextPaymentDate: 1 })
      .limit(5),

    // Current Plan
    UserPlan.findOne({
      user: userId,
      status: "active",
    }).populate("plan"),
  ]);



  res.status(200).json({
    expenses: {
      totalExpenses: totalExpenses[0]?.total || 0,
    },

    subscriptions: {
      totalSubscriptions,
      monthlySubscriptionsCost:
        monthlySubscriptionsCost[0]?.total || 0,
    },

    bills: {
      totalBills,
      pendingBills,
      totalBillsAmount:
        totalBillsAmount[0]?.total || 0,
    },

    installments: {
      activeInstallments,
      remainingAmount:
        remainingInstallments[0]?.total || 0,
    },

    goals: {
      totalGoals,
      completedGoals,
    },

    userPlan: currentPlan
      ? {
          name: currentPlan.plan?.name || "Free",
          price: currentPlan.plan?.price || 0,
          status: currentPlan.status,
          startDate: currentPlan.startDate,
          endDate: currentPlan.endDate,
        }
      : null,

    recentExpenses,
    upcomingBills,
    upcomingInstallments,
  });
});

// ======================================================
// MONTHLY SPENDING SERIES
// GET /dashboard/monthly?months=6
// -> { success, data: [{ key: "2026-03", total }] }
// Oldest month first. Used by the dashboard trend chart.
// ======================================================

const getMonthlySeries = asyncHandler(async (req, res) => {
  const months = Math.min(
    Math.max(Number(req.query.months) || 6, 1),
    12
  );

  const now = new Date();
  const start = new Date(
    now.getFullYear(),
    now.getMonth() - months + 1,
    1
  );

  const rows = await Expense.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(req.user._id),
        date: { $gte: start },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
        },
        total: { $sum: "$amount" },
      },
    },
  ]);

  const byKey = new Map(
    rows.map((r) => [
      `${r._id.year}-${String(r._id.month).padStart(2, "0")}`,
      r.total,
    ])
  );

  const data = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(
      now.getFullYear(),
      now.getMonth() - i,
      1
    );
    const key = `${d.getFullYear()}-${String(
      d.getMonth() + 1
    ).padStart(2, "0")}`;

    data.push({ key, total: byKey.get(key) || 0 });
  }

  res.status(200).json({ success: true, data });
});

module.exports = {
  getDashboard,
  getMonthlySeries,
};