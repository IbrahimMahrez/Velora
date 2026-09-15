
const express = require('express');
const Joi = require('joi');
const mongoose = require('mongoose');



const billSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    amount: {
      type: Number,
      required: true
    },

    category: {
      type: String,
      enum: [
        "Electricity",
        "Water",
        "Internet",
        "Gas",
        "Mobile",
        "Rent",
        "Other"
      ],
      default: "Other"
    },

    dueDate: {
      type: Date,
      required: true
    },

    billingCycle: {
      type: String,
      enum: ["monthly", "weekly", "yearly"],
      default: "monthly"
    },

    status: {
      type: String,
      enum: ["pending", "paid", "overdue"],
      default: "pending"
    },

    reminderEnabled: {
      type: Boolean,
      default: true
    },

    notes: {
      type: String
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    billImage: {
    type: String
}
  },
  
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Bill", billSchema);