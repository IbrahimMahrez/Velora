const asyncHandler = require("express-async-handler");
const Joi = require("joi");
const bcrypt = require("bcrypt");

const User = require("../models/User");
const UserSettings = require("../models/UserSettings");

// ==========================================
// GET SETTINGS
// ==========================================

const getSettings = asyncHandler(async (req, res) => {
    let settings = await UserSettings.findOne({
        userId: req.user._id,
    });

    // لو أول مرة يدخل Settings
    if (!settings) {
        settings = await UserSettings.create({
            userId: req.user._id,
        });
    }

    res.status(200).json({
        success: true,
        settings,
    });
});

// ==========================================
// UPDATE SETTINGS
// ==========================================

const updateSettings = asyncHandler(async (req, res) => {
    const schema = Joi.object({
        language: Joi.string().valid("English", "Arabic"),
        currency: Joi.string().valid("EGP", "USD", "EUR"),
        monthStart: Joi.number().valid(1, 15),

        emailNotifications: Joi.boolean(),
        billReminders: Joi.boolean(),
        subscriptionReminders: Joi.boolean(),
        installmentReminders: Joi.boolean(),
        goalReminders: Joi.boolean(),

        theme: Joi.string().valid("dark", "light"),

        accentColor: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/),
    }).min(1);

    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message,
        });
    }

    const settings = await UserSettings.findOneAndUpdate(
        {
            userId: req.user._id,
        },
        {
            $set: req.body,
        },
        {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true,
        }
    );

    res.status(200).json({
        success: true,
        message: "Settings updated successfully",
        settings,
    });
});

// ==========================================
// CHANGE PASSWORD
// ==========================================

const changePassword = asyncHandler(async (req, res) => {
    const schema = Joi.object({
        currentPassword: Joi.string().min(6).required(),
        newPassword: Joi.string().min(6).required(),
        confirmPassword: Joi.string()
            .valid(Joi.ref("newPassword"))
            .required()
            .messages({
                "any.only": "Passwords do not match",
            }),
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message,
        });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
    }

    // Check current password
    const isMatch = await bcrypt.compare(
        currentPassword,
        user.password
    );

    if (!isMatch) {
        return res.status(400).json({
            success: false,
            message: "Current password is incorrect",
        });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(
        newPassword,
        salt
    );

    await user.save();

    res.status(200).json({
        success: true,
        message: "Password updated successfully",
    });
});

// ==========================================
// DELETE ACCOUNT
// ==========================================

const deleteAccount = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Models
    const User = require("../models/User");
    const UserSettings = require("../models/UserSettings");
    const Expenses = require("../models/Expenses");
    const Bill = require("../models/Bills");
    const Subscriptions = require("../models/Subscriptions");
    const Installment = require("../models/installments");
    const SavingGoal = require("../models/Goal");
    const Notification = require("../models/Notification");
    const Payment = require("../models/Payment");
    const UserPlan = require("../models/UserPlan");

    // Make sure user exists
    const user = await User.findById(userId);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
    }

    // Delete all user-related data
    await Promise.all([
        Expenses.deleteMany({ user: userId }),
        Bill.deleteMany({ user: userId }),
        Subscriptions.deleteMany({ user: userId }),
        Installment.deleteMany({ user: userId }),
        SavingGoal.deleteMany({ user: userId }),
        Notification.deleteMany({ user: userId }),
        Payment.deleteMany({ user: userId }),
        UserPlan.deleteMany({ user: userId }),
        UserSettings.deleteOne({ userId: userId }),
    ]);

    // Finally delete the user
    await User.deleteOne({ _id: userId });

    res.status(200).json({
        success: true,
        message: "Account and all related data deleted successfully",
    });
});

module.exports = {
    getSettings,
    updateSettings,
    changePassword,
    deleteAccount,
};