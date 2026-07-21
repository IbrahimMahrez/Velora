const mongoose = require("mongoose");


const PlanSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true,
        enum:[
            "free",
            "premium",
            "family"
        ]
    },


    price:{
        type:Number,
        required:true,
        default:0
    },


    duration:{
        type:Number,
        default:30
    },


    features:[
        {
            type:String
        }
    ],


    isActive:{
        type:Boolean,
        default:true
    }

},
{
    timestamps:true
});


module.exports = mongoose.model("Plan", PlanSchema);