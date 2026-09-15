const asyncHandler = require("express-async-handler");

const Bill = require("../models/Bills");

const {
    validateBills,
    validateUpdateBill,
} = require("../validations/billsValidations");


// Create Bill

const createBill = asyncHandler(async (req, res) => {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const { error } = validateBills(req.body);

    if (error) {
        console.log("VALIDATION ERROR:", error.details[0].message);

        return res.status(400).json({
            message: error.details[0].message,
        });
    }

    const bill = await Bill.create({
        title: req.body.title,
        amount: req.body.amount,
        category: req.body.category,
        billingCycle: req.body.billingCycle,
        status: req.body.status,
        dueDate: req.body.dueDate,

        reminderEnabled:
            req.body.reminderEnabled !== undefined
                ? req.body.reminderEnabled === true ||
                  req.body.reminderEnabled === "true"
                : true,

        notes: req.body.notes || "",

        billImage: req.file ? req.file.path : null,

        user: req.user._id,
    });

    res.status(201).json({
        message: "Bill created successfully",
        bill,
    });
});

// Get All Bills


const getBillsAll = asyncHandler(async (req, res) => {
  console.log("🔥 GET BILLS CONTROLLER REACHED");

  try {
    console.log("USER:", req.user);

    const bills = await Bill.find({
      user: req.user._id,
    });

    console.log("🔥 BILLS:", bills);

    res.status(200).json({
      total: bills.length,
      bills,
    });
  } catch (error) {
    console.error("🔥 GET BILLS ERROR:", error);
    res.status(500).json({
      message: error.message,
    });
  }
});
// Get Bill By ID

const getBillByID = asyncHandler(async (req, res) => {
    const bill = await Bill.findOne({
        _id: req.params.id,
        user: req.user._id,
    });

    if (!bill) {
        return res.status(404).json({
            message: "Bill not found",
        });
    }

    res.status(200).json(bill);
});


// Update Bill

const updateBill = asyncHandler(async (req, res) => {
    const { error } = validateUpdateBill(req.body);

    if (error) {
        return res.status(400).json({
            message: error.details[0].message,
        });
    }

    const bill = await Bill.findOneAndUpdate(
        {
            _id: req.params.id,
            user: req.user._id,
        },
        {
            ...req.body,
            ...(req.file && { billImage: req.file.path }),
        },
       {
    returnDocument: "after",
}
    );

    if (!bill) {
        return res.status(404).json({
            message: "Bill not found",
        });
    }

    res.status(200).json({
        message: "Bill updated successfully",
        bill,
    });
});


// Delete Bill

const deleteBill = asyncHandler(async (req, res) => {
    const bill = await Bill.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id,
    });

    if (!bill) {
        return res.status(404).json({
            message: "Bill not found",
        });
    }

    res.status(200).json({
        message: "Bill deleted successfully",
    });
});


// Get Bills By Status

const getBillStatus = asyncHandler(async (req, res) => {
    const bills = await Bill.find({
        user: req.user._id,
        status: req.params.status,
    });

    res.status(200).json(bills);
});

module.exports = {
    createBill,
    getBillsAll,
    getBillByID,
    updateBill,
    deleteBill,
    getBillStatus,
};