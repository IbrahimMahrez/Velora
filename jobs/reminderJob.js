const cron = require("node-cron");

const Subscription = require("../models/Subscriptions");
const Notification = require("../models/Notification");

cron.schedule("0 9 * * *", async () => {

    const today = new Date();

    const subscriptions = await Subscription.find();

    for (const subscription of subscriptions) {

        const renewalDate = new Date(subscription.renewalDate);

        const diffDays = Math.ceil(
            (renewalDate - today) / (1000 * 60 * 60 * 24)
        );

        if (diffDays === 1) {

            await Notification.create({
                user: subscription.user,
                title: "Subscription Reminder",
                message: `${subscription.name} will renew tomorrow`,
                type: "subscription"
            });
            await sendEmail(
                    user.email,
                   "Bill Reminder",
                   "<h1>Your bill is due tomorrow</h1>");

        }
    }
});



const checkExpiredSubscriptions = require("../utils/checkExpiredSubscriptions");

cron.schedule("0 0 * * *", async () => {

    console.log("Checking subscriptions...");

    await checkExpiredSubscriptions();

});