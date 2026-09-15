const express = require('express');
const Joi = require('joi');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Expenses=require('../models/Expenses');
const Budget = require('../models/Budget');
const { createNotification } = require('../services/notificationService');
const {validateExpenses,validateUpdateExpenses} = require('../validations/expensesValidate');

// Budget-check hook: never throws (must not break expense creation)
const checkBudgetAndNotify = async (userId, category) => {
  try {
    if (!userId || !category) return;
    const budget = await Budget.findOne({ user: userId, category });
    if (!budget || !budget.monthlyLimit) return;

    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    firstOfMonth.setHours(0, 0, 0, 0);
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const userObjectId =
      userId instanceof mongoose.Types.ObjectId
        ? userId
        : new mongoose.Types.ObjectId(userId.toString());

    const agg = await Expenses.aggregate([
      {
        $match: {
          user: userObjectId,
          category: category,
          date: { $gte: firstOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const spent = (agg[0] && agg[0].total) || 0;
    const percent = Math.round((spent / budget.monthlyLimit) * 100);

    if (percent >= 100) {
      await createNotification({
        userId,
        title: `Budget exceeded: ${category}`,
        message: `Budget exceeded: ${category} — ${percent}% of ${budget.monthlyLimit} EGP`,
        type: "expense",
        relatedId: budget._id,
        reminderType: "budget-100",
        reminderDate: monthKey,
      });
    } else if (percent >= 80) {
      await createNotification({
        userId,
        title: `Budget approaching: ${category}`,
        message: `Budget approaching: ${category} — ${percent}% of ${budget.monthlyLimit} EGP`,
        type: "expense",
        relatedId: budget._id,
        reminderType: "budget-80",
        reminderDate: monthKey,
      });
    }
  } catch (err) {
    console.error("Budget check hook failed:", err.message);
  }
};

const createExpenses = asyncHandler(async (req, res) => {
  const {error} = validateExpenses(req.body);
          if(error){
              return res.status(400).json({error:error.details[0].message});
          }
               const expenses=new Expenses({
                      title: req.body.title,
                      amount: req.body.amount,
                      category: req.body.category,
                          date:req.body.date,
                          notes:req.body.notes,
                            user: req.user._id
                  })
              await expenses.save()
              await checkBudgetAndNotify(req.user._id, expenses.category);
              res.status(201).json({
  message: "Expense created successfully",
  expense: expenses,
});

    
})

const getExpensesAll = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const startIndex = (page - 1) * limit;

  const expenses = await Expenses.find({
    user: req.user._id,
  })
    .sort({ date: -1 })
    .skip(startIndex)
    .limit(limit);

  const totalExpenses = await Expenses.countDocuments({
    user: req.user._id,
  });

  res.status(200).json({
    expenses,
    pagination: {
      currentPage: page,
      limit,
      totalExpenses,
      totalPages: Math.ceil(totalExpenses / limit),
    },
  });
});

const getExpensesByID = asyncHandler(async (req, res) => {
    const expenses = await Expenses.findById({ _id: req.params.id, user: req.user._id });
        if(expenses){
            res.json(expenses)
        }
        res.status(404).json({ message: "Expenses not found" });
});

const updateExpenses = asyncHandler(async (req, res) => {
    const { error } = validateUpdateExpenses(req.body);

    if (error) {
        return res.status(400).json({
            error: error.details[0].message
        });
    }

    const expenses = await Expenses.findOne({ _id: req.params.id, user: req.user._id });

    if (!expenses) {
  return res.status(404).json({
    message: "Expense not found",
  });
}

    expenses.title = req.body.title || expenses.title;
    expenses.amount = req.body.amount || expenses.amount;
    expenses.category = req.body.category || expenses.category;
    expenses.date = req.body.date || expenses.date;
    expenses.notes = req.body.notes || expenses.notes;

    await expenses.save();

    await checkBudgetAndNotify(req.user._id, expenses.category);

    res.status(200).json({
  message: "Expense updated successfully",
  expense: expenses,
});
});

const deleteExpenses = asyncHandler(async (req, res) => {
      const expenses=await Expenses.findByIdAndDelete({ _id: req.params.id, user: req.user._id })
        if(!expenses){
            res.status(404).json({ message: "Expenses not found" });
        }
        res.json({ message: "Expenses deleted successfully" });
})


module.exports= {getExpensesAll,createExpenses,getExpensesByID,updateExpenses,deleteExpenses}

