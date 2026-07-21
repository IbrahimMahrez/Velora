const asyncHandler = require("express-async-handler");

const UserPlan = require("../models/UserPlan");
const Plan = require("../models/Plan");
const User = require("../models/User");



const subscribe = asyncHandler(async (req,res)=>{


    const userId = req.user._id;

    const {planId} = req.body;



    const plan = await Plan.findById(planId);


    if(!plan){
        return res.status(404).json({
            message:"Plan not found"
        });
    }



    const currentPlan = await UserPlan.findOne({
        user:userId,
        status:"active"
    });


    if(currentPlan){

        currentPlan.status="expired";

        await currentPlan.save();

    }



   

    const endDate = new Date();

    endDate.setDate(
        endDate.getDate() + plan.duration
    );



    

    const userPlan = await UserPlan.create({

        user:userId,

        plan:plan._id,

        startDate:new Date(),

        endDate:endDate

    });




    await User.findByIdAndUpdate(
        userId,
        {
            currentPlan:plan._id
        }
    );



    res.status(201).json({

        message:"Subscribed successfully",

        subscription:userPlan

    });


});



module.exports={
    subscribe
};