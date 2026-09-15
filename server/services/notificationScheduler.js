const cron = require("node-cron");

const Bill = require("../models/Bills");
const Subscription = require("../models/Subscriptions");
const Installment = require("../models/installments");
const SavingGoal = require("../models/Goal");

const {
    createNotification,
} = require("./notificationService");

const {
    postDueSubscriptions,
} = require("./recurringExpenses");

const getDateKey = (date = new Date()) => {
    return date.toISOString().split("T")[0];
};

const getMonthKey = (date = new Date()) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const getDaysDifference = (date) => {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const target = new Date(date);

    target.setHours(0, 0, 0, 0);

    return Math.ceil(
        (target - today) / (1000 * 60 * 60 * 24)
    );
};


// ===============================
// BILLS
// ===============================

const checkBills = async () => {
    const bills = await Bill.find({
        reminderEnabled: true,
        status: {
            $in: ["pending", "overdue"],
        },
    });

    for (const bill of bills) {
        const days = getDaysDifference(bill.dueDate);

        let reminderType = null;
        let title = "";
        let message = "";

        if (days === 3) {
            reminderType = "3_days";
            title = "Bill Due Soon";

            message = `${bill.title} is due in 3 days. Amount: ${bill.amount} EGP.`;
        }

        if (days === 1) {
            reminderType = "1_day";
            title = "Bill Due Tomorrow";

            message = `${bill.title} is due tomorrow. Amount: ${bill.amount} EGP.`;
        }

        if (days === 0) {
            reminderType = "today";
            title = "Bill Due Today";

            message = `${bill.title} is due today. Amount: ${bill.amount} EGP.`;
        }

        if (days < 0) {
            reminderType = "overdue";
            title = "Overdue Bill";

            message = `${bill.title} is overdue. Amount: ${bill.amount} EGP.`;
        }

        if (!reminderType) continue;

        await createNotification({
            userId: bill.user,
            title,
            message,
            type: "bill",
            relatedId: bill._id,
            reminderType,
            reminderDate: getDateKey(),
            emailSubject: title,
            emailEnabledKey: "billReminders",
        });
    }
};


// ===============================
// SUBSCRIPTIONS
// ===============================

const checkSubscriptions = async () => {
    const subscriptions = await Subscription.find({});

    for (const subscription of subscriptions) {
        const days = getDaysDifference(
            subscription.renewalDate
        );

        let reminderType = null;
        let title = "";
        let message = "";

        if (days === 3) {
            reminderType = "3_days";
            title = "Subscription Renewal Soon";

            message = `${subscription.name} renews in 3 days. Price: ${subscription.price} EGP.`;
        }

        if (days === 1) {
            reminderType = "1_day";
            title = "Subscription Renews Tomorrow";

            message = `${subscription.name} renews tomorrow. Price: ${subscription.price} EGP.`;
        }

        if (days === 0) {
            reminderType = "today";
            title = "Subscription Renews Today";

            message = `${subscription.name} renews today. Price: ${subscription.price} EGP.`;
        }

        if (!reminderType) continue;

        await createNotification({
            userId: subscription.user,
            title,
            message,
            type: "subscription",
            relatedId: subscription._id,
            reminderType,
            reminderDate: getDateKey(),
            emailSubject: title,
            emailEnabledKey: "subscriptionReminders",
        });
    }
};


// ===============================
// UNUSED SUBSCRIPTIONS
// ===============================

const checkUnusedSubscriptions = async () => {
    const subscriptions = await Subscription.find({});

    const now = new Date();
    const monthKey = getMonthKey(now);

    for (const subscription of subscriptions) {
        try {
            const lastActive =
                subscription.lastUsedAt || subscription.createdAt;

            if (!lastActive) continue;

            const daysSinceUse = Math.floor(
                (now - new Date(lastActive)) / (1000 * 60 * 60 * 24)
            );

            if (daysSinceUse < 60) continue;

            await createNotification({
                userId: subscription.user,
                title: "Unused Subscription",
                message: `${subscription.name} hasn't been used for 60+ days — consider cancelling (${subscription.price} EGP/month)`,
                type: "subscription",
                relatedId: subscription._id,
                reminderType: "unused-sub",
                reminderDate: monthKey,
                emailSubject: "Unused Subscription",
                emailEnabledKey: "subscriptionReminders",
            });
        } catch (err) {
            console.error(
                "Unused subscription check failed:",
                err.message
            );
        }
    }
};


// ===============================
// INSTALLMENTS
// ===============================

const checkInstallments = async () => {
    const installments = await Installment.find({
        status: "active",
    });

    for (const installment of installments) {
        const days = getDaysDifference(
            installment.nextPaymentDate
        );

        let reminderType = null;
        let title = "";
        let message = "";

        if (days === 3) {
            reminderType = "3_days";
            title = "Installment Payment Soon";

            message = `${installment.productName} installment is due in 3 days. Monthly payment: ${installment.monthlyPayment} EGP.`;
        }

        if (days === 1) {
            reminderType = "1_day";
            title = "Installment Due Tomorrow";

            message = `${installment.productName} installment is due tomorrow. Monthly payment: ${installment.monthlyPayment} EGP.`;
        }

        if (days === 0) {
            reminderType = "today";
            title = "Installment Due Today";

            message = `${installment.productName} installment is due today. Monthly payment: ${installment.monthlyPayment} EGP.`;
        }

        if (days < 0) {
            reminderType = "overdue";
            title = "Overdue Installment";

            message = `${installment.productName} installment is overdue. Payment: ${installment.monthlyPayment} EGP.`;
        }

        if (!reminderType) continue;

        await createNotification({
            userId: installment.user,
            title,
            message,
            type: "installment",
            relatedId: installment._id,
            reminderType,
            reminderDate: getDateKey(),
            emailSubject: title,
            emailEnabledKey: "installmentReminders",
        });
    }
};


// ===============================
// SAVING GOALS
// ===============================

const checkGoals = async () => {
    const goals = await SavingGoal.find({
        status: "active",
    });

    for (const goal of goals) {
        const days = getDaysDifference(
            goal.deadline
        );

        const remaining =
            Math.max(
                goal.targetAmount - goal.currentAmount,
                0
            );

        let reminderType = null;
        let title = "";
        let message = "";

        // Goal deadline in 7 days
        if (days === 7) {
            reminderType = "7_days";
            title = "Saving Goal Deadline Soon";

            message = `${goal.title} deadline is in 7 days. You still need ${remaining} EGP to reach your goal.`;
        }

        // Goal deadline tomorrow
        if (days === 1) {
            reminderType = "1_day";
            title = "Saving Goal Deadline Tomorrow";

            message = `${goal.title} deadline is tomorrow. You still need ${remaining} EGP to reach your goal.`;
        }

        // Goal deadline today
        if (days === 0) {
            reminderType = "today";
            title = "Saving Goal Deadline Today";

            message = `${goal.title} deadline is today. You still need ${remaining} EGP to reach your goal.`;
        }

        if (!reminderType) continue;

        await createNotification({
            userId: goal.user,
            title,
            message,
            type: "goal",
            relatedId: goal._id,
            reminderType,
            reminderDate: getDateKey(),
            emailSubject: title,
            emailEnabledKey: "goalReminders",
        });
    }
};


// ===============================
// MAIN SCHEDULER
// ===============================

const startNotificationScheduler = () => {
    console.log("🔔 Notification scheduler started");

    // Every day at 9:00 AM
    cron.schedule(
        "0 9 * * *",
        async () => {
            console.log("🔔 Running notification scheduler...");

            try {
                await checkBills();
                await checkSubscriptions();
                await checkUnusedSubscriptions();
                await checkInstallments();
                await checkGoals();
                await postDueSubscriptions();

                console.log(
                    "✅ Notification scheduler completed"
                );
            } catch (error) {
                console.error(
                    "❌ Notification scheduler error:",
                    error
                );
            }
        },
        {
            timezone: "Africa/Cairo",
        }
    );
};

module.exports = {
    startNotificationScheduler,
    checkUnusedSubscriptions,
    runNotificationChecks: async () => {
        await checkBills();
        await checkSubscriptions();
        await checkUnusedSubscriptions();
        await checkInstallments();
        await checkGoals();
        await postDueSubscriptions();

        console.log("✅ Notification checks completed");
    },
};