
const cron = require("node-cron");

const Bill = require("../models/Bills");
const Subscription = require("../models/Subscriptions");
const Installment = require("../models/installments");
const Goal = require("../models/Goal");

const Notification = require("../models/Notification");

const { createNotification } = require("../services/notificationService");


// ==========================================
// Helpers
// ==========================================

const startOfDay = (date) => {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
};

const endOfDay = (date) => {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
};

const getTomorrowRange = () => {
    const tomorrow = new Date();

    tomorrow.setDate(tomorrow.getDate() + 1);

    return {
        start: startOfDay(tomorrow),
        end: endOfDay(tomorrow),
    };
};

const getDaysFromNowRange = (days) => {
    const date = new Date();

    date.setDate(date.getDate() + days);

    return {
        start: startOfDay(date),
        end: endOfDay(date),
    };
};


// ==========================================
// Prevent duplicate notifications
// ==========================================

const notificationAlreadyExists = async ({
    userId,
    type,
    title,
    message,
}) => {
    const today = startOfDay(new Date());

    const notification = await Notification.findOne({
        user: userId,
        type,
        title,
        message,
        createdAt: {
            $gte: today,
        },
    });

    return !!notification;
};


// ==========================================
// BILL REMINDERS
// ==========================================

const checkBills = async () => {
    console.log("Checking bills...");

    const { start, end } = getTomorrowRange();

    const bills = await Bill.find({
        dueDate: {
            $gte: start,
            $lte: end,
        },

        status: {
            $ne: "paid",
        },

        reminderEnabled: true,
    });

    for (const bill of bills) {

        const title = "Bill Reminder";

        const message =
            `${bill.title} is due tomorrow. Amount: ${bill.amount} EGP.`;

        const exists = await notificationAlreadyExists({
            userId: bill.user,
            type: "bill",
            title,
            message,
        });

        if (exists) {
            continue;
        }

        await createNotification({
            userId: bill.user,
            title,
            message,
            type: "bill",
            emailSubject: "Velora - Bill Reminder",
            emailEnabledKey: "billReminders",
        });

        console.log(`Bill reminder created: ${bill.title}`);
    }
};


// ==========================================
// SUBSCRIPTION REMINDERS
// ==========================================

const checkSubscriptions = async () => {
    console.log("Checking subscriptions...");

    const { start, end } = getTomorrowRange();

    const subscriptions = await Subscription.find({
        renewalDate: {
            $gte: start,
            $lte: end,
        },
    });

    for (const subscription of subscriptions) {

        const title = "Subscription Reminder";

        const message =
            `${subscription.name} will renew tomorrow. Amount: ${subscription.price} EGP.`;

        const exists = await notificationAlreadyExists({
            userId: subscription.user,
            type: "subscription",
            title,
            message,
        });

        if (exists) {
            continue;
        }

        await createNotification({
            userId: subscription.user,
            title,
            message,
            type: "subscription",
            emailSubject: "Velora - Subscription Reminder",
            emailEnabledKey: "subscriptionReminders",
        });

        console.log(
            `Subscription reminder created: ${subscription.name}`
        );
    }
};


// ==========================================
// INSTALLMENT REMINDERS
// ==========================================

const checkInstallments = async () => {
    console.log("Checking installments...");

    const { start, end } = getTomorrowRange();

    const installments = await Installment.find({
        nextPaymentDate: {
            $gte: start,
            $lte: end,
        },

        status: {
            $ne: "completed",
        },
    });

    for (const installment of installments) {

        const title = "Installment Reminder";

        const message =
            `${installment.productName} installment payment is due tomorrow. Amount: ${installment.monthlyPayment} EGP.`;

        const exists = await notificationAlreadyExists({
            userId: installment.user,
            type: "installment",
            title,
            message,
        });

        if (exists) {
            continue;
        }

        await createNotification({
            userId: installment.user,
            title,
            message,
            type: "installment",
            emailSubject: "Velora - Installment Reminder",
            emailEnabledKey: "installmentReminders",
        });

        console.log(
            `Installment reminder created: ${installment.productName}`
        );
    }
};


// ==========================================
// GOAL REMINDERS
// ==========================================

const checkGoals = async () => {
    console.log("Checking goals...");

    const { start, end } = getDaysFromNowRange(7);

    const goals = await Goal.find({
        deadline: {
            $gte: start,
            $lte: end,
        },

        status: "active",
    });

    for (const goal of goals) {

        const title = "Goal Reminder";

        const message =
            `${goal.title} deadline is in 7 days. Current progress: ${goal.currentAmount} / ${goal.targetAmount} EGP.`;

        const exists = await notificationAlreadyExists({
            userId: goal.user,
            type: "goal",
            title,
            message,
        });

        if (exists) {
            continue;
        }

        await createNotification({
            userId: goal.user,
            title,
            message,
            type: "goal",
            emailSubject: "Velora - Goal Reminder",
            emailEnabledKey: "goalReminders",
        });

        console.log(
            `Goal reminder created: ${goal.title}`
        );
    }
};


// ==========================================
// Main Reminder Job
// ==========================================

const runReminderJob = async () => {

    try {

        console.log("----------------------------------");
        console.log("Velora Reminder Job Started");
        console.log(new Date().toLocaleString());
        console.log("----------------------------------");

        await checkBills();

        await checkSubscriptions();

        await checkInstallments();

        await checkGoals();

        console.log("----------------------------------");
        console.log("Velora Reminder Job Finished");
        console.log("----------------------------------");

    } catch (error) {

        console.error(
            "Reminder Job Error:",
            error
        );

    }
};


// ==========================================
// Run every day at 09:00 AM
// ==========================================

cron.schedule("0 9 * * *", async () => {

    await runReminderJob();

});


// Export for manual testing
module.exports = {
    runReminderJob,
};
