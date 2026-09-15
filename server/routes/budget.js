const express = require("express");
const router = express.Router();

const {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
} = require("../controllers/budgetController");

const { verifytoken } = require("../middlewares/verifyToken");

router.get("/", verifytoken, getBudgets);
router.post("/", verifytoken, createBudget);
router.put("/:id", verifytoken, updateBudget);
router.delete("/:id", verifytoken, deleteBudget);

module.exports = router;
