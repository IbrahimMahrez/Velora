const express = require('express');
const Joi = require('joi');
const asyncHandler = require('express-async-handler');
const Expenses=require('../models/Expenses');
const {validateExpenses,validateUpdateExpenses} = require('../validations/expensesValidate');

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
              res.json(expenses,"created successfully expenses")

    
})

const getExpensesAll = asyncHandler(async (req, res) => {
    const page= parseInt(req.query.page)
        const limit= parseInt(req.query.limit)
        const startIndex=(page-1)*limit
        const expenses=await Expenses.find().skip(startIndex).limit(limit);
        res.json(expenses)
})

const getExpensesByID = asyncHandler(async (req, res) => {
    const expenses = await Expenses.findById(req.params.id)
        if(expenses){
            res.json(expenses)
        }
        res.json("not found any expenses")
})

const updateExpenses = asyncHandler(async (req, res) => {
    const { error } = validateUpdateExpenses(req.body);

    if (error) {
        return res.status(400).json({
            error: error.details[0].message
        });
    }

    const expenses = await Expenses.findById(req.params.id);

    if (!expenses) {
        return res.status(404).json({
            message: "Expenses not found"
        });
    }

    expenses.title = req.body.title || expenses.title;
    expenses.amount = req.body.amount || expenses.amount;
    expenses.category = req.body.category || expenses.category;
    expenses.date = req.body.date || expenses.date;
    expenses.notes = req.body.notes || expenses.notes;

    await expenses.save();

    res.status(200).json({
        message: "Expenses updated successfully",
        expenses
    });
});

const deleteExpenses = asyncHandler(async (req, res) => {
      const expenses=await Expenses.findByIdAndDelete(req.params.id)
        if(!expenses){
            res.json("not found any expenses")
    
        }
        res.json("deleted successfully")
})


module.exports= {getExpensesAll,createExpenses,getExpensesByID,updateExpenses,deleteExpenses}

