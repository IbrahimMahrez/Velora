const asyncHandler = require("express-async-handler");

const Subscriptions = require("../models/Subscriptions");

const {
  validateSubscription,
  validateUpdateSubscription,
} = require("../validations/subscriptionsValidation");

// GET ALL SUBSCRIPTIONS
const getSubscription = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const skip = (page - 1) * limit;

  const subscriptions = await Subscriptions.find({
    user: req.user._id,
  })
    .sort({ renewalDate: 1 })
    .skip(skip)
    .limit(limit);

  const totalSubscriptions = await Subscriptions.countDocuments({
    user: req.user._id,
  });

  res.status(200).json({
    subscriptions,
    pagination: {
      currentPage: page,
      limit,
      totalSubscriptions,
      totalPages: Math.ceil(totalSubscriptions / limit),
    },
  });
});

// GET SUBSCRIPTION BY ID
const getSubscriptionById = asyncHandler(async (req, res) => {
  const subscription = await Subscriptions.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!subscription) {
    return res.status(404).json({
      message: "Subscription not found",
    });
  }

  res.status(200).json({
    subscription,
  });
});

// CREATE SUBSCRIPTION
const createSubscription = asyncHandler(async (req, res) => {
  const { error } = validateSubscription(req.body);

  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }

  const subscription = new Subscriptions({
    name: req.body.name,
    price: req.body.price,
    category: req.body.category,
    renewalCycle: req.body.renewalCycle,
    renewalDate: req.body.renewalDate,

    // IMPORTANT
    user: req.user._id,
  });

  await subscription.save();

  res.status(201).json({
    message: "Subscription created successfully",
    subscription,
  });
});

// UPDATE SUBSCRIPTION
const updateSubscription = asyncHandler(async (req, res) => {
  const { error } = validateUpdateSubscription(req.body);

  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }

  const subscription = await Subscriptions.findOneAndUpdate(
    {
      _id: req.params.id,
      user: req.user._id,
    },
    {
      $set: req.body,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!subscription) {
    return res.status(404).json({
      message: "Subscription not found",
    });
  }

  res.status(200).json({
    message: "Subscription updated successfully",
    subscription,
  });
});

// DELETE SUBSCRIPTION
const deleteSubscription = asyncHandler(async (req, res) => {
  const subscription = await Subscriptions.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!subscription) {
    return res.status(404).json({
      message: "Subscription not found",
    });
  }

  res.status(200).json({
    message: "Subscription deleted successfully",
    subscription,
  });
});

// MARK SUBSCRIPTION AS USED
const markSubscriptionUsed = asyncHandler(async (req, res) => {
  const subscription = await Subscriptions.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!subscription) {
    return res.status(404).json({
      success: false,
      message: "Subscription not found",
    });
  }

  subscription.lastUsedAt = new Date();
  await subscription.save();

  res.status(200).json({
    success: true,
    subscription,
  });
});

// TOGGLE AUTO-POST EXPENSE
const toggleAutoPost = asyncHandler(async (req, res) => {
  const subscription = await Subscriptions.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!subscription) {
    return res.status(404).json({
      success: false,
      message: "Subscription not found",
    });
  }

  subscription.autoPostExpense =
    typeof req.body?.autoPostExpense === "boolean"
      ? req.body.autoPostExpense
      : !subscription.autoPostExpense;

  await subscription.save();

  res.status(200).json({
    success: true,
    subscription,
  });
});

module.exports = {
  getSubscription,
  createSubscription,
  deleteSubscription,
  updateSubscription,
  getSubscriptionById,
  markSubscriptionUsed,
  toggleAutoPost,
};