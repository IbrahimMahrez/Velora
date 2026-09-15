const express = require("express");

const router = express.Router();


const {
    createNotification,
    getAllNotifications,
    getNotificationById,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
} = require("../controllers/notificationController");


const {
    verifytoken,
} = require("../middlewares/verifyToken");


// ========================================
// Authentication
// ========================================

router.use(verifytoken);


// ========================================
// TEST NOTIFICATION
// IMPORTANT: MUST BE BEFORE /:id
// ========================================




// ========================================
// Normal Notifications
// ========================================

router.post(
    "/",
    createNotification
);


router.get(
    "/",
    getAllNotifications
);


router.get(
    "/:id",
    getNotificationById
);


router.patch(
    "/:id/read",
    markAsRead
);


router.patch(
    "/read-all",
    markAllAsRead
);


router.delete(
    "/:id",
    deleteNotification
);


router.delete(
    "/",
    deleteAllNotifications
);


module.exports = router;