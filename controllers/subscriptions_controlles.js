const express = require('express');
const Joi = require('joi');
const asyncHandler = require('express-async-handler');
const generateToken = require('../utils/generatetoken');
const Subscriptions=require('../models/Subscriptions');
const { validateSubscription ,validateUpdateSubscription} = require('../validations/subscriptionsValidation');


const getSubscription=asyncHandler(async(req,res)=>{
    const page=parseInt(req.query.page) || 1;
    const limit=parseInt(req.query.limit) || 5;
    const skip=(page-1)*limit;
    const subscription= await Subscriptions.find().skip(skip).limit(limit)
    res.json(subscription)
    })



const getSubscriptionById=asyncHandler(async(req,res)=>{
    const subscription= await Subscriptions.findById(req.params.id)
    if(subscription){
       res.json(subscription)
    }
    res.status(404).json("not found it!")
})



const updateSubscription=asyncHandler(async(req,res)=>{
    const subscription= await Subscriptions.findByIdAndUpdate(req.params.id,{ $set: req.body }, { new: true, runValidators: true })
    if(!subscription){
        res.status(404).json("not found it!")
    }
    const {error} = validateUpdateSubscription(req.body);
    if(error){
        return res.status(400).json("error to update")
    }
    
    await subscription.save()
    res.json("update done",subscription)
})






const createSubscription = asyncHandler(async (req, res) => {
    const {error} = validateSubscription(req.body);
        if(error){
            return res.status(400).json({error:error.details[0].message});
        }
        const subscription = new Subscriptions({
          name:req.body.name,
          price:req.body.price,
          category:req.body.category,
          renewalCycle:req.body.renewalCycle,
          renewalDate:req.body.renewalDate
          
        })
        await subscription.save();
        res.json(subscription,"created successfully")
    
})


const deleteSubscription = asyncHandler(async (req, res) => {
    const subscription = await Subscriptions.findByIdAndDelete(req.params.id);
    if(!subscription){
        return res.status(400).json("subscription not found")

    }
    res.json("deleted successfully",subscription)
})




module.exports= {
    getSubscription,
    createSubscription,
    deleteSubscription,
    updateSubscription,
    getSubscriptionById
}