const express = require("express");
const router = express.Router();

const { verifytoken } = require("../middlewares/verifyToken");

const {
    getInstallmentAll,
    getInstallmentByID,
    createInstallment,
    updateInstallment,
    deleteInstallment,
    getInstallmentStatus,
} = require("../controllers/installment_controllers");


// Protect all installment routes
router.use(verifytoken);


// Get all installments
router.get("/", getInstallmentAll);

// Get installments by status
router.get("/status/:status", getInstallmentStatus);

// Get installment by ID
router.get("/:id", getInstallmentByID);

// Create installment
router.post("/", createInstallment);

// Update installment
router.put("/:id", updateInstallment);

// Delete installment
router.delete("/:id", deleteInstallment);


module.exports = router;