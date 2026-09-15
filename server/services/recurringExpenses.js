const Subscription = require("../models/Subscriptions");
const Expense = require("../models/Expenses");

const {
    createNotification,
} = require("./notificationService");

// Map subscription categories onto the expense enum
const CATEGORY_MAP = {
    Entertainment: "Entertainment",
    Education: "Education",
    Health: "Health",
    Food: "Food",
    Sports: "Entertainment",
    Music: "Entertainment",
    Travel: "Transport",
    Finance: "Other",
    Other: "Other",
};

const dayKey = (date = new Date()) => {
    return date.toISOString().split("T")[0];
};

const advanceRenewal = (date, cycle) => {
    const d = new Date(date);
    if (cycle === "weekly") d.setDate(d.getDate() + 7);
    else if (cycle === "yearly") d.setFullYear(d.getFullYear() + 1);
    else d.setMonth(d.getMonth() + 1);
    return d;
};

// ======================================================
// POST DUE SUBSCRIPTIONS AS EXPENSES
// Runs daily: for every auto-post-enabled subscription whose
// renewalDate has passed and wasn't posted for that cycle,
// create the expense, advance the renewal date, and notify.
// Idempotent via lastPostedAt guard + notification dedup.
// ======================================================

const postDueSubscriptions = async () => {
    const now = new Date();

    const due = await Subscription.find({
        autoPostExpense: true,
        renewalDate: { $lte: now },
    });

    for (const sub of due) {
        try {
            // Skip if already posted for this cycle
            if (
                sub.lastPostedAt &&
                new Date(sub.lastPostedAt) >=
                    new Date(sub.renewalDate)
            ) {
                continue;
            }

            const expense = await Expense.create({
                user: sub.user,
                title: sub.name,
                amount: sub.price,
                category:
                    CATEGORY_MAP[sub.category] || "Other",
                date: now,
                notes: "Auto-posted from subscription renewal",
            });

            sub.lastPostedAt = now;
            sub.renewalDate = advanceRenewal(
                sub.renewalDate,
                sub.renewalCycle
            );
            await sub.save();

            await createNotification({
                userId: sub.user,
                title: "Subscription charged",
                message: `${sub.name} renewed — ${sub.price} EGP logged as expense.`,
                type: "subscription",
                relatedId: expense._id,
                reminderType: "auto-posted",
                reminderDate: dayKey(now),
            });
        } catch (err) {
            console.error(
                `Auto-post failed for subscription ${sub._id}:`,
                err.message || err
            );
        }
    }
};

module.exports = {
    postDueSubscriptions,
};
