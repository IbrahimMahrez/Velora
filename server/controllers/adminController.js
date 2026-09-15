const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");

const User = require("../models/User");
const Plan = require("../models/Plan");
const UserPlan = require("../models/UserPlan");
const Payment = require("../models/Payment");

// ======================================================
// ADMIN DASHBOARD
// GET /admin/dashboard
// ======================================================

const getAdminDashboard = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    verifiedUsers,
    totalPlans,
    activePlans,
    totalPayments,
    paidPayments,
    pendingPayments,
    failedPayments,
  ] = await Promise.all([
    User.countDocuments({ isAdmin: false }),

    User.countDocuments({
      isAdmin: false,
      isVerified: true,
    }),

    Plan.countDocuments(),

    Plan.countDocuments({
      isActive: true,
    }),

    Payment.countDocuments(),

    Payment.countDocuments({
      status: "paid",
    }),

    Payment.countDocuments({
      status: "pending",
    }),

    Payment.countDocuments({
      status: "failed",
    }),
  ]);

  // Total revenue
  const totalRevenueResult = await Payment.aggregate([
    {
      $match: {
        status: "paid",
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: {
          $sum: "$amount",
        },
      },
    },
  ]);

  const totalRevenue =
    totalRevenueResult.length > 0
      ? totalRevenueResult[0].totalRevenue
      : 0;

  // Current month revenue
  const now = new Date();

  const startOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  );

  const monthlyRevenueResult = await Payment.aggregate([
    {
      $match: {
        status: "paid",
        createdAt: {
          $gte: startOfMonth,
        },
      },
    },
    {
      $group: {
        _id: null,
        revenue: {
          $sum: "$amount",
        },
      },
    },
  ]);

  const monthlyRevenue =
    monthlyRevenueResult.length > 0
      ? monthlyRevenueResult[0].revenue
      : 0;

  // Users by plan
  const usersByPlan = await User.aggregate([
    {
      $match: {
        isAdmin: false,
      },
    },
    {
      $group: {
        _id: "$plan",
        count: {
          $sum: 1,
        },
      },
    },
    {
      $sort: {
        count: -1,
      },
    },
  ]);

  // Revenue by plan
  const revenueByPlan = await Payment.aggregate([
    {
      $match: {
        status: "paid",
      },
    },
    {
      $lookup: {
        from: "plans",
        localField: "plan",
        foreignField: "_id",
        as: "planData",
      },
    },
    {
      $unwind: {
        path: "$planData",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: "$planData.name",
        revenue: {
          $sum: "$amount",
        },
      },
    },
    {
      $sort: {
        revenue: -1,
      },
    },
  ]);

  // Recent users
  const recentUsers = await User.find({
    isAdmin: false,
  })
    .select("-password")
    .sort({
      createdAt: -1,
    })
    .limit(5);

  // Recent payments
  const recentPayments = await Payment.find()
    .populate("user", "name email")
    .populate("plan", "name")
    .sort({
      createdAt: -1,
    })
    .limit(5);

  res.status(200).json({
    success: true,
    data: {
      statistics: {
        totalUsers,
        verifiedUsers,
        totalPlans,
        activePlans,
        totalPayments,
        paidPayments,
        pendingPayments,
        failedPayments,
        totalRevenue,
        monthlyRevenue,
      },
      usersByPlan,
      revenueByPlan,
      recentUsers,
      recentPayments,
    },
  });
});

// ======================================================
// GET ALL USERS
// GET /admin/users
// ======================================================

const getAllUsers = asyncHandler(async (req, res) => {
  const {
    search = "",
    plan,
    page = 1,
    limit = 10,
  } = req.query;

  const currentPage = Math.max(Number(page), 1);
  const perPage = Math.min(
    Math.max(Number(limit), 1),
    100
  );

  const query = {
    isAdmin: false,
  };

  if (search.trim()) {
    query.$or = [
      {
        name: {
          $regex: search.trim(),
          $options: "i",
        },
      },
      {
        email: {
          $regex: search.trim(),
          $options: "i",
        },
      },
    ];
  }

  if (
    plan &&
    ["free", "premium", "family"].includes(plan)
  ) {
    query.plan = plan;
  }

  const skip = (currentPage - 1) * perPage;

  const [users, totalUsers] = await Promise.all([
    User.find(query)
      .select("-password")
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(perPage),

    User.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: {
      users,
      pagination: {
        currentPage,
        perPage,
        totalUsers,
        totalPages: Math.ceil(
          totalUsers / perPage
        ),
      },
    },
  });
});

// ======================================================
// GET USER DETAILS
// GET /admin/users/:id
// ======================================================

const getUserDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID",
    });
  }

  const user = await User.findOne({
    _id: id,
    isAdmin: false,
  }).select("-password");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const currentPlan = await UserPlan.findOne({
    user: id,
    status: "active",
  })
    .populate("plan")
    .sort({
      createdAt: -1,
    });

  const payments = await Payment.find({
    user: id,
  })
    .populate("plan", "name")
    .sort({
      createdAt: -1,
    });

  const revenueResult = await Payment.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(id),
        status: "paid",
      },
    },
    {
      $group: {
        _id: null,
        totalPaid: {
          $sum: "$amount",
        },
      },
    },
  ]);

  const totalPaid =
    revenueResult.length > 0
      ? revenueResult[0].totalPaid
      : 0;

  res.status(200).json({
    success: true,
    data: {
      user,
      currentPlan,
      payments,
      statistics: {
        totalPayments: payments.length,
        totalPaid,
      },
    },
  });
});

// ======================================================
// DELETE USER
// DELETE /admin/users/:id
// ======================================================

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID",
    });
  }

  const user = await User.findOne({
    _id: id,
    isAdmin: false,
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found or cannot be deleted",
    });
  }

  await Promise.all([
    UserPlan.deleteMany({
      user: id,
    }),

    Payment.deleteMany({
      user: id,
    }),
  ]);

  await User.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});

// ======================================================
// GET ALL PAYMENTS
// GET /admin/payments
// ======================================================

const getAllPayments = asyncHandler(async (req, res) => {
  const {
    status,
    billingCycle,
    page = 1,
    limit = 10,
  } = req.query;

  const currentPage = Math.max(Number(page), 1);
  const perPage = Math.min(
    Math.max(Number(limit), 1),
    100
  );

  const query = {};

  if (
    status &&
    ["pending", "paid", "failed"].includes(status)
  ) {
    query.status = status;
  }

  if (
    billingCycle &&
    ["monthly", "yearly"].includes(billingCycle)
  ) {
    query.billingCycle = billingCycle;
  }

  const skip = (currentPage - 1) * perPage;

  const [payments, totalPayments] = await Promise.all([
    Payment.find(query)
      .populate("user", "name email")
      .populate("plan", "name")
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(perPage),

    Payment.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: {
      payments,
      pagination: {
        currentPage,
        perPage,
        totalPayments,
        totalPages: Math.ceil(
          totalPayments / perPage
        ),
      },
    },
  });
});

// ======================================================
// REVENUE ANALYTICS
// GET /admin/revenue
// ======================================================

const getRevenueAnalytics = asyncHandler(async (req, res) => {
  const revenueByMonth = await Payment.aggregate([
    {
      $match: {
        status: "paid",
      },
    },
    {
      $group: {
        _id: {
          year: {
            $year: "$createdAt",
          },
          month: {
            $month: "$createdAt",
          },
        },
        revenue: {
          $sum: "$amount",
        },
        payments: {
          $sum: 1,
        },
      },
    },
    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1,
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: {
      revenueByMonth,
    },
  });
});

// ======================================================
// GET ALL PLANS
// GET /admin/plans
// ======================================================

const getAllPlans = asyncHandler(async (req, res) => {
  const plans = await Plan.find().sort({
    monthlyPrice: 1,
  });

  res.status(200).json({
    success: true,
    data: {
      plans,
    },
  });
});

// ======================================================
// CREATE PLAN
// POST /admin/plans
// ======================================================

const createPlan = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    monthlyPrice,
    yearlyPrice,
    duration,
    features,
    isPopular,
    isActive,
  } = req.body;

  if (
    !name ||
    !["free", "premium", "family"].includes(name)
  ) {
    return res.status(400).json({
      success: false,
      message: "Valid plan name is required",
    });
  }

  const existingPlan = await Plan.findOne({
    name,
  });

  if (existingPlan) {
    return res.status(400).json({
      success: false,
      message: "Plan already exists",
    });
  }

  const plan = await Plan.create({
    name,
    description,
    monthlyPrice,
    yearlyPrice,
    duration,
    features,
    isPopular,
    isActive,
  });

  res.status(201).json({
    success: true,
    message: "Plan created successfully",
    plan,
  });
});

// ======================================================
// UPDATE PLAN
// PATCH /admin/plans/:id
// ======================================================

const updatePlan = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid plan ID",
    });
  }

  const plan = await Plan.findById(id);

  if (!plan) {
    return res.status(404).json({
      success: false,
      message: "Plan not found",
    });
  }

  const allowedFields = [
    "description",
    "monthlyPrice",
    "yearlyPrice",
    "duration",
    "features",
    "isPopular",
    "isActive",
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      plan[field] = req.body[field];
    }
  });

  await plan.save();

  res.status(200).json({
    success: true,
    message: "Plan updated successfully",
    plan,
  });
});

// ======================================================
// DELETE PLAN
// DELETE /admin/plans/:id
// ======================================================

const deletePlan = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid plan ID",
    });
  }

  const plan = await Plan.findById(id);

  if (!plan) {
    return res.status(404).json({
      success: false,
      message: "Plan not found",
    });
  }

  const usersUsingPlan = await UserPlan.countDocuments({
    plan: id,
    status: "active",
  });

  if (usersUsingPlan > 0) {
    return res.status(400).json({
      success: false,
      message:
        "Cannot delete a plan that is currently assigned to users",
    });
  }

  await Plan.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Plan deleted successfully",
  });
});

// ======================================================
// BROADCAST NOTIFICATION TO ALL USERS
// POST /admin/broadcast { title, message }
// In-app notification for everyone (+ browser push unless
// the user disabled push). No emails (spam risk).
// ======================================================

const broadcastNotification = asyncHandler(async (req, res) => {
  const title = String(req.body?.title || "").trim();
  const message = String(req.body?.message || "").trim();

  if (title.length < 3 || message.length < 5) {
    return res.status(400).json({
      success: false,
      message:
        "Title (min 3) and message (min 5) are required",
    });
  }

  const Notification = require("../models/Notification");
  const UserSettings = require("../models/UserSettings");
  const PushSubscription = require("../models/PushSubscription");
  const { getVapidPublicKey } = require("../utils/push");

  const users = await User.find({}, { _id: 1 }).lean();

  if (users.length === 0) {
    return res.status(200).json({
      success: true,
      notifiedUsers: 0,
      pushSent: 0,
    });
  }

  const stamp = new Date().toISOString();
  const userIds = users.map((u) => u._id);

  await Notification.insertMany(
    userIds.map((userId) => ({
      user: userId,
      title: title.slice(0, 120),
      message: message.slice(0, 500),
      type: "system",
      reminderType: `broadcast-${stamp}`,
    })),
    { ordered: false }
  );

  // Browser push to opted-in devices (best-effort)
  let pushSent = 0;
  try {
    if (getVapidPublicKey()) {
      const optedOut = await UserSettings.find({
        pushNotifications: false,
      })
        .select("userId")
        .lean();

      const optedOutIds = new Set(
        optedOut.map((s) => String(s.userId))
      );

      const subs = await PushSubscription.find({}).lean();
      const targets = subs.filter(
        (s) => !optedOutIds.has(String(s.user))
      );

      if (targets.length > 0) {
        const webpush = require("web-push");
        const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } =
          process.env;

        webpush.setVapidDetails(
          VAPID_SUBJECT || "mailto:admin@velora.app",
          VAPID_PUBLIC_KEY,
          VAPID_PRIVATE_KEY
        );

        const payload = JSON.stringify({
          title: title.slice(0, 120),
          body: message.slice(0, 200),
          url: "/dashboard",
        });

        const results = await Promise.allSettled(
          targets.map((sub) =>
            webpush.sendNotification(
              { endpoint: sub.endpoint, keys: sub.keys },
              payload
            )
          )
        );

        pushSent = results.filter(
          (r) => r.status === "fulfilled"
        ).length;

        // Drop dead endpoints
        const deadIds = [];
        results.forEach((r, i) => {
          const status = r.reason?.statusCode;
          if (
            r.status === "rejected" &&
            (status === 404 || status === 410)
          ) {
            deadIds.push(targets[i]._id);
          }
        });

        if (deadIds.length > 0) {
          await PushSubscription.deleteMany({
            _id: { $in: deadIds },
          }).catch(() => {});
        }
      }
    }
  } catch (err) {
    console.error("Broadcast push failed:", err.message || err);
  }

  res.status(200).json({
    success: true,
    notifiedUsers: userIds.length,
    pushSent,
  });
});

module.exports = {
  getAdminDashboard,
  getAllUsers,
  getUserDetails,
  deleteUser,
  getAllPayments,
  getRevenueAnalytics,
  getAllPlans,
  createPlan,
  updatePlan,
  deletePlan,
  broadcastNotification,
};