const asyncHandler = require("express-async-handler");
const Installment = require("../models/installments");

const {
    validateInstallment,
    validateUpdateInstallment,
} = require("../validations/installmentValidations");


// =========================
// CREATE INSTALLMENT
// =========================
const createInstallment = asyncHandler(async (req, res) => {
    const { error } = validateInstallment(req.body);

    if (error) {
        return res.status(400).json({
            message: error.details[0].message,
        });
    }

    const downPayment = Number(req.body.downPayment) || 0;
    const paidMonths = Number(req.body.paidMonths) || 0;

    const remainingAmount =
        Number(req.body.totalPrice) -
        downPayment -
        paidMonths * Number(req.body.monthlyPayment);

    const installment = await Installment.create({
        productName: req.body.productName,
        totalPrice: req.body.totalPrice,
        downPayment,
        monthlyPayment: req.body.monthlyPayment,
        totalMonths: req.body.totalMonths,
        paidMonths,
        remainingAmount: Math.max(remainingAmount, 0),
        startDate: req.body.startDate,
        nextPaymentDate: req.body.nextPaymentDate,
        status: req.body.status || "active",
        notes: req.body.notes || "",
        user: req.user._id,
    });

    res.status(201).json({
        message: "Installment created successfully",
        installment,
    });
});


// =========================
// GET ALL INSTALLMENTS
// =========================
const getInstallmentAll = asyncHandler(async (req, res) => {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 10, 1);

    const startIndex = (page - 1) * limit;

    const installments = await Installment.find({
        user: req.user._id,
    })
        .sort({ createdAt: -1 })
        .skip(startIndex)
        .limit(limit);

    const total = await Installment.countDocuments({
        user: req.user._id,
    });

    res.status(200).json({
        installments,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    });
});


// =========================
// GET INSTALLMENT BY ID
// =========================
const getInstallmentByID = asyncHandler(async (req, res) => {
    const installment = await Installment.findOne({
        _id: req.params.id,
        user: req.user._id,
    });

    if (!installment) {
        return res.status(404).json({
            message: "Installment not found",
        });
    }

    res.status(200).json({
        installment,
    });
});


// =========================
// UPDATE INSTALLMENT
// =========================
const updateInstallment = asyncHandler(async (req, res) => {
    const { error } = validateUpdateInstallment(req.body);

    if (error) {
        return res.status(400).json({
            message: error.details[0].message,
        });
    }

    const installment = await Installment.findOne({
        _id: req.params.id,
        user: req.user._id,
    });

    if (!installment) {
        return res.status(404).json({
            message: "Installment not found",
        });
    }


    // Update only provided fields
    if (req.body.productName !== undefined) {
        installment.productName = req.body.productName;
    }

    if (req.body.totalPrice !== undefined) {
        installment.totalPrice = req.body.totalPrice;
    }

    if (req.body.downPayment !== undefined) {
        installment.downPayment = req.body.downPayment;
    }

    if (req.body.monthlyPayment !== undefined) {
        installment.monthlyPayment = req.body.monthlyPayment;
    }

    if (req.body.totalMonths !== undefined) {
        installment.totalMonths = req.body.totalMonths;
    }

    if (req.body.paidMonths !== undefined) {
        installment.paidMonths = req.body.paidMonths;
    }

    if (req.body.startDate !== undefined) {
        installment.startDate = req.body.startDate;
    }

    if (req.body.nextPaymentDate !== undefined) {
        installment.nextPaymentDate = req.body.nextPaymentDate;
    }

    if (req.body.status !== undefined) {
        installment.status = req.body.status;
    }

    if (req.body.notes !== undefined) {
        installment.notes = req.body.notes;
    }


    // Recalculate remaining amount
    installment.remainingAmount =
        Number(installment.totalPrice) -
        Number(installment.downPayment || 0) -
        Number(installment.paidMonths || 0) *
        Number(installment.monthlyPayment);

    installment.remainingAmount = Math.max(
        installment.remainingAmount,
        0
    );


    await installment.save();

    res.status(200).json({
        message: "Installment updated successfully",
        installment,
    });
});


// =========================
// DELETE INSTALLMENT
// =========================
const deleteInstallment = asyncHandler(async (req, res) => {
    const installment = await Installment.findOne({
        _id: req.params.id,
        user: req.user._id,
    });

    if (!installment) {
        return res.status(404).json({
            message: "Installment not found",
        });
    }

    await Installment.findByIdAndDelete(req.params.id);

    res.status(200).json({
        message: "Installment deleted successfully",
    });
});


// =========================
// GET INSTALLMENTS BY STATUS
// =========================
const getInstallmentStatus = asyncHandler(async (req, res) => {
    const installments = await Installment.find({
        status: req.params.status,
        user: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
        installments,
    });
});


module.exports = {
    getInstallmentAll,
    getInstallmentByID,
    createInstallment,
    updateInstallment,
    deleteInstallment,
    getInstallmentStatus,
};