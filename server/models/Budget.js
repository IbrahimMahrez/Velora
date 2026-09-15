const mongoose = require("mongoose");

const BudgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      enum: [
        "Food",
        "Transport",
        "Shopping",
        "Entertainment",
        "Health",
        "Education",
        "Other",
      ],
      required: true,
    },
    monthlyLimit: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

BudgetSchema.index({ user: 1, category: 1 }, { unique: true });

module.exports =
  mongoose.models.Budget || mongoose.model("Budget", BudgetSchema);
