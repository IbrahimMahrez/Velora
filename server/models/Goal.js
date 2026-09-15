const mongoose = require("mongoose");

const savingGoalSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            minlength: 3
        },

        targetAmount: {
            type: Number,
            required: true,
            min: 0
        },

        currentAmount: {
            type: Number,
            default: 0,
            min: 0
        },

        contributions: [
            {
                amount: {
                    type: Number,
                    required: true,
                    min: 1,
                },
                date: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],

        deadline: {
            type: Date,
            required: true
        },

        status: {
            type: String,
            enum: ["active", "completed", "cancelled"],
            default: "active"
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

const SavingGoal = mongoose.model(
    "SavingGoal",
    savingGoalSchema
);

module.exports = SavingGoal;