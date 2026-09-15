const express = require("express");
const router = express.Router();

const {
  getExpensesAll,
  createExpenses,
  getExpensesByID,
  updateExpenses,
  deleteExpenses,
} = require("../controllers/expenses_controllers");

const { verifytoken } = require("../middlewares/verifyToken");

router.get("/", verifytoken, getExpensesAll);

router.post("/", verifytoken, createExpenses);

router.get("/:id", verifytoken, getExpensesByID);

router.put("/:id", verifytoken, updateExpenses);

router.delete("/:id", verifytoken, deleteExpenses);

module.exports = router;