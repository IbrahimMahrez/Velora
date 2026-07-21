const asyncHandler = require("express-async-handler");

const Expense = require("../models/Expenses");
const Bill = require("../models/Bills");
const Subscription = require("../models/Subscriptions");
const Installment = require("../models/installments");
const Goal = require("../models/Goal");
const UserPlan = require("../models/UserPlan");

const { sumPipeline } = require("../utils/aggregateUtils");

const getDashboard = asyncHandler(async (req, res) => {

    const userId = req.user._id;

    const [
        totalExpenses,
        totalBills,
        pendingBills,
        totalBillsAmount,
        totalSubscriptions,
        monthlySubscriptionsCost,
        activeInstallments,
        remainingInstallments,
        totalGoals,
        completedGoals,
        recentExpenses,
        upcomingBills,
        upcomingInstallments,
        currentPlan
    ] = await Promise.all([

        // Expenses
        Expense.aggregate(
            sumPipeline(userId, "amount")
        ),

        // Bills
        Bill.countDocuments({
            user: userId
        }),

        Bill.countDocuments({
            user: userId,
            status: "pending"
        }),

        Bill.aggregate(
            sumPipeline(userId, "amount")
        ),

        // Subscriptions
        Subscription.countDocuments({
            user: userId
        }),

        Subscription.aggregate(
            sumPipeline(userId, "price")
        ),

        // Installments
        Installment.countDocuments({
            user: userId,
            status: "active"
        }),

        Installment.aggregate(
            sumPipeline(userId, "remainingAmount")
        ),

        // Goals
        Goal.countDocuments({
            user: userId
        }),

        Goal.countDocuments({
            user: userId,
            status: "completed"
        }),

        // Recent expenses
        Expense.find({
            user: userId
        })
            .sort({ createdAt: -1 })
            .limit(5),

        // Upcoming bills
        Bill.find({
            user: userId,
            status: "pending"
        })
            .sort({ dueDate: 1 })
            .limit(5),

        // Upcoming installments
        Installment.find({
            user: userId,
            status: "active"
        })
            .sort({ nextPaymentDate: 1 })
            .limit(5),

        // Current Plan
        UserPlan.findOne({
            user: userId,
            status: "active"
        }).populate("plan")

    ]);

    res.status(200).json({

        expenses: {
            totalExpenses: totalExpenses[0]?.total || 0
        },

        subscriptions: {
            totalSubscriptions,
            monthlySubscriptionsCost:
                monthlySubscriptionsCost[0]?.total || 0
        },

        bills: {
            totalBills,
            pendingBills,
            totalBillsAmount:
                totalBillsAmount[0]?.total || 0
        },

        installments: {
            activeInstallments,
            remainingAmount:
                remainingInstallments[0]?.total || 0
        },

        goals: {
            totalGoals,
            completedGoals
        },

        userPlan: currentPlan
            ? {
                name: currentPlan.plan.name,
                price: currentPlan.plan.price,
                status: currentPlan.status,
                startDate: currentPlan.startDate,
                endDate: currentPlan.endDate
            }
            : null,

        recentExpenses,

        upcomingBills,

        upcomingInstallments

    });

});

module.exports = {
    getDashboard
};