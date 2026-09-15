const mongoose = require("mongoose");


const UserPlanSchema = new mongoose.Schema({

    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },


    plan:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Plan",
        required:true
    },


    startDate:{
        type:Date,
        default:Date.now
    },


    endDate:{
        type:Date
    },


    status:{
        type:String,
        enum:[
            "active",
            "expired",
            "cancelled"
        ],
        default:"active"
    }

},
{
    timestamps:true
});


module.exports = mongoose.model("UserPlan", UserPlanSchema);