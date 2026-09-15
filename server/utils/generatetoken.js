
const jwt=require("jsonwebtoken")
const dotenv = require('dotenv');
const user=require("../models/User")


function generateToken(user) {
    return jwt.sign(
        {
            _id: user._id,
            isAdmin: user.isAdmin
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1h"
        }
    );
}



module.exports=generateToken