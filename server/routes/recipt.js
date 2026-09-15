
const express = require("express");

const router = express.Router();
const {createBill}=require("../controllers/receiptcontrollers")




router.post(
    "/",
    verifyToken,
    upload.single("billImage"),
    createBill
);



module.exports= router