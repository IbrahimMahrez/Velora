const asyncHandler = require("express-async-handler");
const SavingGoal = require("../models/Goal");


const createSavingGoal = asyncHandler(async (req, res) => {
    const savingGoal = new SavingGoal({
        title: req.body.title,
        targetAmount: req.body.targetAmount,
        currentAmount: req.body.currentAmount || 0,
        deadline: req.body.deadline,
        status: req.body.status || "active",
        user: req.user._id
    });

    await savingGoal.save();

    res.status(201).json({
        message: "Saving goal created successfully",
        savingGoal
    });
});


const getAllSavingGoals = asyncHandler(async (req, res) => {
    const savingGoals = await SavingGoal.find({
        user: req.user._id
    });

    res.status(200).json(savingGoals);
});


const getSavingGoalById = asyncHandler(async (req, res) => {
    const savingGoal = await SavingGoal.findById(req.params.id);

    if (!savingGoal) {
        return res.status(404).json({
            message: "Saving goal not found"
        });
    }

    res.status(200).json(savingGoal);
});

const updateSavingGoal = asyncHandler(async (req, res) => {
    const savingGoal = await SavingGoal.findById(req.params.id);

    if (!savingGoal) {
        return res.status(404).json({
            message: "Saving goal not found"
        });
    }

    savingGoal.title = req.body.title || savingGoal.title;
    savingGoal.targetAmount =
        req.body.targetAmount || savingGoal.targetAmount;
    savingGoal.currentAmount =
        req.body.currentAmount ?? savingGoal.currentAmount;
    savingGoal.deadline =
        req.body.deadline || savingGoal.deadline;

    if (
        savingGoal.currentAmount >=
        savingGoal.targetAmount
    ) {
        savingGoal.status = "completed";
    }

    await savingGoal.save();

    res.status(200).json({
        message: "Saving goal updated successfully",
        savingGoal
    });
});


const deleteSavingGoal = asyncHandler(async (req, res) => {
    const savingGoal = await SavingGoal.findById(req.params.id);

    if (!savingGoal) {
        return res.status(404).json({
            message: "Saving goal not found"
        });
    }

    await SavingGoal.findByIdAndDelete(req.params.id);

    res.status(200).json({
        message: "Saving goal deleted successfully"
    });
});

module.exports = {
    createSavingGoal,
    getAllSavingGoals,
    getSavingGoalById,
    updateSavingGoal,
    deleteSavingGoal
};