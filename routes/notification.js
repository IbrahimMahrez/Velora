const express = require("express");

const router = express.Router();

const { verifytoken,verifyAuthorization,verifyAuthorizationadmin}=require('../middlewares/verifyToken');

const {
    createNotification,
    getAllNotifications,
    getNotificationById,
    markAsRead,
    deleteNotification,
    deleteAllNotifications
} = require("../controllers/notificationController");


router.use(verifytoken);

router.post("/", verifyAuthorizationadmin,createNotification);

router.get("/", verifyAuthorization,getAllNotifications);

router.get("/:id", verifyAuthorization,getNotificationById);

router.patch("/:id/read", verifyAuthorization,markAsRead);

router.delete("/:id", verifyAuthorization,deleteNotification);

router.delete("/", verifyAuthorization,deleteAllNotifications);

module.exports = router;