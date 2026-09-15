const express = require("express");

const router = express.Router();

const {
    createPayment
} = require("../controllers/paymentController");

const {
    verifytoken
} = require("../middlewares/verifyToken");

router.post(
    "/create",
    verifytoken,
    createPayment
);



module.exports = router;