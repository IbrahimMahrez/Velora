
const express = require('express');
const mongoose = require('mongoose');


const ExpensesSchema=new mongoose.Schema({
    title: String,
    amount: Number,
    category: {
        type: String,
        enum: [
            "Food",
            "Transport",
            "Shopping",
            "Entertainment",
            "Health",
            "Education",
            "Other"
        ]
    },
    date: Date,
    notes: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
})

module.exports = mongoose.model('Expenses', ExpensesSchema);