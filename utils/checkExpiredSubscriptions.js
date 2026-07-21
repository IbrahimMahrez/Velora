const UserPlan = require("../models/UserPlan");

const checkExpiredSubscriptions = async () => {
    try {

        await UserPlan.updateMany(
            {
                status: "active",
                endDate: { $lt: new Date() }
            },
            {
                $set: {
                    status: "expired"
                }
            }
        );

        console.log("Subscriptions updated");

    } catch (error) {

        console.log(error);

    }
};

module.exports = checkExpiredSubscriptions;