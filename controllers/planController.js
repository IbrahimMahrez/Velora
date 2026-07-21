const asyncHandler = require("express-async-handler");
const Plan = require("../models//Plan");


// @desc Get All Plans
// @route GET /api/plans
// @access Public

const getPlans = asyncHandler(async (req,res)=>{

    const plans = await Plan.find({
        isActive:true
    });


    res.status(200).json({
        count: plans.length,
        plans
    });

});


module.exports = {
    getPlans
};