const asyncHandler = require("express-async-handler");

const UserPlan = require("../models/UserPlan");

const premiumOnly = asyncHandler(async (req, res, next) => {

    const userPlan = await UserPlan.findOne({
        user: req.user._id,
        status: "active"
    }).populate("plan");


    if (!userPlan) {
        return res.status(403).json({
            message: "No active subscription"
        });
    }


    if (
        userPlan.plan.name === "premium" ||
        userPlan.plan.name === "family"
    ) {
        next();
    } else {
        return res.status(403).json({
            message: "Premium subscription required"
        });
    }

});

module.exports = premiumOnly;