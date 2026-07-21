const express = require('express');
const Joi = require('joi');
const mongoose = require('mongoose');





const UserSchema=new mongoose.Schema({
          name:{
            type:String,
            require:true,
            minlength:5,
            trim:true
          },

          email:{
            type:String,
            require:true,
            minlength:5,
            trim:true,
            unique:true
          },
          password:{
            type:String,
            require:true,
            minlength:5,
            trim:true
          },
           avatar:{
            type:String,
            require:true,
            minlength:5,
            trim:true
          },
          date:{
            type:Date,
            default:Date.now
          }
        ,
           plan:{
            type:String,
            require:true,
            minlength:5,
            trim:true
          },
          occupation:{
            type:String,
            require:true,
            minlength:5,
            trim:true
          },
           isVerified:{
            type:Boolean,
            default:false
          },
          role:{
            type:String,
            require:true,
            minlength:5,
            trim:true
          }
          ,isAdmin: {
        type: Boolean,
        default: false
    }  
})



module.exports=mongoose.model("User",UserSchema)
