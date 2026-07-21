const express = require('express');
const Joi = require('joi');
const asyncHandler = require('express-async-handler');
const Installment = require('../models/Installments');
const {validateInstallment, validateUpdateInstallment} = require("../validations/installmentValidations");




const createInstallment = asyncHandler(async (req, res) => {
    const {error} = validateInstallment(req.body);
          if(error){
              return res.status(400).json({error:error.details[0].message});
          }
             const downPayment = req.body.downPayment || 0;
             const paidMonths = req.body.paidMonths || 0;
             const remainingAmount =
                         req.body.totalPrice -
                                req.body.downPayment -
                                req.body.paidMonths * req.body.monthlyPayment;

         const installment = new Installment({
                productName: req.body.productName,
                totalPrice: req.body.totalPrice,
                downPayment: req.body.downPayment,
                monthlyPayment: req.body.monthlyPayment,
                totalMonths: req.body.totalMonths,
                paidMonths: req.body.paidMonths,
                remainingAmount: remainingAmount,
                startDate: req.body.startDate,
                nextPaymentDate: req.body.nextPaymentDate,
                status: req.body.status,
                notes: req.body.notes,
                user: req.user._id
    });

     await installment.save();

              res.json(installment,"created successfully installment")

})

const getInstallmentAll = asyncHandler(async (req, res) => {
      const page= parseInt(req.query.page)
        const limit= parseInt(req.query.limit)
        const startIndex=(page-1)*limit
        const installment=await Installment.find().skip(startIndex).limit(limit);
        res.json(installment)
    
})

const getInstallmentByID = asyncHandler(async (req, res) => {
    const installment = await Installment.findById(req.params.id)
            if(installment){
                res.json(installment,"get installment successfully")
            }
            res.json("not found any installment")
})

const updateInstallment = asyncHandler(async (req, res) => {
    
    const { error } = validateUpdateInstallment(req.body);

    if (error) {
        return res.status(400).json({
            error: error.details[0].message
        });
    }

    const installment = await Installment.findById(req.params.id);

    if (!installment) {
        return res.status(404).json({
            message: "Installment not found"
        });
    }

    installment.productName =
        req.body.productName || installment.productName;

    installment.totalPrice =
        req.body.totalPrice || installment.totalPrice;

    installment.downPayment =
        req.body.downPayment ?? installment.downPayment;

    installment.monthlyPayment =
        req.body.monthlyPayment || installment.monthlyPayment;

    installment.totalMonths =
        req.body.totalMonths || installment.totalMonths;

    installment.paidMonths =
        req.body.paidMonths ?? installment.paidMonths;

    installment.startDate =
        req.body.startDate || installment.startDate;

    installment.nextPaymentDate =
        req.body.nextPaymentDate || installment.nextPaymentDate;

    installment.status =
        req.body.status || installment.status;

    installment.notes =
        req.body.notes || installment.notes;

    installment.remainingAmount =
        installment.totalPrice -
        installment.downPayment -
        installment.paidMonths * installment.monthlyPayment;

    await installment.save();

    res.status(200).json({
        message: "Installment updated successfully",
        installment
    });
});


const deleteInstallment = asyncHandler(async (req, res) => {
    const installment = await Installment.findById(req.params.id);

    if (!installment) {
        return res.status(404).json({
            message: "Installment not found"
        });
    }

    await Installment.findByIdAndDelete(req.params.id);

    res.status(200).json({
        message: "Installment deleted successfully"
    });
});


const getInstallmentStatus = asyncHandler(async (req, res) => {
    const installments = await Installment.find({
        status: req.params.status
    });

    res.status(200).json(installments);
});





module.exports = {
    getInstallmentAll,getInstallmentByID,createInstallment,updateInstallment,deleteInstallment,getInstallmentStatus
}