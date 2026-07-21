const asyncHandler = require("express-async-handler");

const Notification = require("../models/Notification");

const createNotification = asyncHandler(async (req, res) => {
    const notification = await Notification.create({
        title: req.body.title,
        message: req.body.message,
        type: req.body.type,
        user: req.user.id
    });

    res.status(201).json(notification);
});

const getAllNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({
        user: req.user.id
    }).sort({ createdAt: -1 });

    res.status(200).json(notifications);
});


const getNotificationById = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
        return res.status(404).json({
            message: "Notification not found"
        });
    }

    res.status(200).json(notification);
});


const markAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
        return res.status(404).json({
            message: "Notification not found"
        });
    }

    notification.isRead = true;

    await notification.save();

    res.status(200).json({
        message: "Notification marked as read",
        notification
    });
});

const deleteNotification = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
        return res.status(404).json({
            message: "Notification not found"
        });
    }

    await notification.deleteOne();

    res.status(200).json({
        message: "Notification deleted successfully"
    });
});

const deleteAllNotifications = asyncHandler(async (req, res) => {
    await Notification.deleteMany({
        user: req.user.id
    });

    res.status(200).json({
        message: "All notifications deleted successfully"
    });
});


module.exports = {
    createNotification,
    getAllNotifications,
    getNotificationById,
    markAsRead,
    deleteNotification,
    deleteAllNotifications
};