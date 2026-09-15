const asyncHandler = require("express-async-handler");

const Notification = require("../models/Notification");

const {
    createNotification: createNotificationService,
} = require("../services/notificationService");


// ========================================
// Create Normal Notification
// ========================================

const createNotification = asyncHandler(async (req, res) => {
    const notification = await Notification.create({
        title: req.body.title,
        message: req.body.message,
        type: req.body.type,
        user: req.user.id,
    });

    res.status(201).json({
        success: true,
        notification,
    });
});


// ========================================
// Get All Notifications
// ========================================

const getAllNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({
        user: req.user.id,
    }).sort({ createdAt: -1 });

    const unreadCount = notifications.filter(
        (notification) => !notification.isRead
    ).length;

    res.status(200).json({
        success: true,
        notifications,
        unreadCount,
    });
});


// ========================================
// Get Notification By ID
// ========================================

const getNotificationById = asyncHandler(async (req, res) => {
    const notification = await Notification.findOne({
        _id: req.params.id,
        user: req.user.id,
    });

    if (!notification) {
        return res.status(404).json({
            success: false,
            message: "Notification not found",
        });
    }

    res.status(200).json({
        success: true,
        notification,
    });
});


// ========================================
// Mark Notification As Read
// ========================================

const markAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findOneAndUpdate(
        {
            _id: req.params.id,
            user: req.user.id,
        },
        {
            isRead: true,
        },
        {
            new: true,
        }
    );

    if (!notification) {
        return res.status(404).json({
            success: false,
            message: "Notification not found",
        });
    }

    res.status(200).json({
        success: true,
        notification,
    });
});


// ========================================
// Mark All As Read
// ========================================

const markAllAsRead = asyncHandler(async (req, res) => {
    const result = await Notification.updateMany(
        {
            user: req.user.id,
            isRead: false,
        },
        {
            $set: { isRead: true },
        }
    );

    res.status(200).json({
        success: true,
        message: "All notifications marked as read",
        updated: result.modifiedCount ?? 0,
    });
});


// ========================================
// Delete Notification
// ========================================

const deleteNotification = asyncHandler(async (req, res) => {
    const notification = await Notification.findOneAndDelete({
        _id: req.params.id,
        user: req.user.id,
    });

    if (!notification) {
        return res.status(404).json({
            success: false,
            message: "Notification not found",
        });
    }

    res.status(200).json({
        success: true,
        message: "Notification deleted successfully",
    });
});


// ========================================
// Delete All Notifications
// ========================================

const deleteAllNotifications = asyncHandler(async (req, res) => {
    await Notification.deleteMany({
        user: req.user.id,
    });

    res.status(200).json({
        success: true,
        message: "All notifications deleted successfully",
    });
});


// ========================================
// Test Notification + Email
// ========================================



module.exports = {
    createNotification,
    getAllNotifications,
    getNotificationById,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,

};