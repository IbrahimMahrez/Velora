const express = require('express');
const Joi = require('joi');
const router = express.Router();
const Expenses=require('../models/Expenses');
const {getExpensesAll,createExpenses,getExpensesByID,updateExpenses,deleteExpenses}=require('../controllers/expenses_controllers');
const { verifytoken,verifyAuthorization}=require('../middlewares/verifyToken');


router.get('/',verifytoken,verifyAuthorization,getExpensesAll);
router.post('/',verifytoken,verifyAuthorization,createExpenses);
router.get('/:id',verifytoken,verifyAuthorization,getExpensesByID);
router.put('/:id',verifytoken,verifyAuthorization,updateExpenses);
router.delete('/:id',verifytoken,verifyAuthorization,deleteExpenses);


module.exports=router;