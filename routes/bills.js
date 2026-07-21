const express = require("express");

const router = express.Router();

const upload = require("../middlewares/uploads");

const {
    verifytoken,
} = require("../middlewares/verifyToken");

const {
    getBillsAll,
    getBillByID,
    getBillStatus,
    createBill,
    updateBill,
    deleteBill,
} = require("../controllers/bills_controllers");

router.use(verifytoken);

router.get("/", getBillsAll);

router.get("/status/:status", getBillStatus);

router.get("/:id", getBillByID);

router.post(
    "/",
    upload.single("billImage"),
    createBill
);

router.put(
    "/:id",
    upload.single("billImage"),
    updateBill
);

router.delete("/:id", deleteBill);

module.exports = router;