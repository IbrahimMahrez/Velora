const express = require('express');
const Joi = require('joi');
const mongoose = require('mongoose');




const SubscriptionsSchema=new mongoose.Schema({
    name:{type:String,required:true,minlength:5,trim:true},
    price:{type:Number,required:true,trim:true},
    category:{type:String,enum:["Entertainment","Education","Sports","Health","Finance","Travel","Food","Music","Other"],default:"Other"},
    renewalCycle:{type:String,enum:["monthly","yearly","weekly"],default:"monthly"},
    renewalDate:{type:Date,required:true},
    user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
},{timestamps:true})
    


module.exports= mongoose.model("Subscriptions",SubscriptionsSchema);