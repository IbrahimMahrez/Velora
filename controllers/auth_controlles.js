const express = require('express');
const Joi = require('joi');
const asyncHandler = require('express-async-handler');
const { validateRegisterUser, validateLoginUser } = require('../validations/uservalidations');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const generateToken = require('../utils/generatetoken');
const nodemailer=require("nodemailer")



//register user
const registerUser = asyncHandler(async (req, res) => {

    const { error } = validateRegisterUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user=await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send('User already exists');

    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);

    user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
    })
    await user.save();
    const token=generateToken(user)
    res.status(201).json({message: 'User registered successfully',token});
})

//login user
const loginUser= asyncHandler(async (req, res) => {
    const { error } = validateLoginUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send('Invalid email or password');

     const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) return res.status(400).send('Invalid email or password');

    const token=generateToken(user)
    res.status(200).json({message: 'User logged in successfully',token});

})

//logout user
const logoutUser= asyncHandler(async (req, res) => {
    res.status(200).json({message: 'User logged out successfully'});
})

//  get forget password MVC   
const getForgetPasswordview= asyncHandler(async (req, res) => {
      res.render("forgetpassword");
})
//link send to email
const sendForgetpassLink = asyncHandler(async (req, res) => {
    const user = await User.findOne({
        email: req.body.email,
    });

    if (!user) {
        return res.status(404).json({
            message: "User not found",
        });
    }

    const secret = process.env.JWT_SECRET + user.password;

    const token = jwt.sign(
        {
            id: user._id,
            email: user.email,
        },
        secret,
        {
            expiresIn: "10m",
        }
    );

    const link = `http://localhost:7000/auth/reset-password/${user._id}/${token}`;
      const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_APP,
    },
     tls: {
        rejectUnauthorized: false,
    },
});


const mailOptions = {
    from: process.env.USER_EMAIL,
    to: user.email,
    subject: "Reset Password",
    html: `
        <div>
            <h4>Click on the link below to reset your password:</h4>

            <a href="${link}">
                Reset Password
            </a>
        </div>
    `,
};

try {
    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent: " + info.response);

    return res.render("link-send");
} catch (err) {
    console.log(err);

    return res.status(500).json({
        message: "Failed to send email",
    });
}
});


 const getResetPasswordView = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.userId);

    if (!user) {
        return res.status(404).json({
            message: "User not found",
        });
    }

    const secret = process.env.JWT_SECRET + user.password;

    try {
        jwt.verify(req.params.token, secret);

        res.render("reset-password", {
            email: user.email,
            userId: user._id,
            token: req.params.token,
        });
    } catch (error) {
        return res.status(400).json({
            message: "Invalid or expired token",
        });
    }
});

// POST /password/reset-password/:userId/:token
 const resetPassword = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.userId);

    if (!user) {
        return res.status(404).json({
            message: "User not found",
        });
    }

    const secret = process.env.JWT_SECRET + user.password;

    try {
        jwt.verify(req.params.token, secret);

        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(
            req.body.password,
            salt
        );

        user.password = hashedPassword;

        await user.save();

        res.render("success-password");
    } catch (error) {
        return res.status(400).json({
            message: "Invalid or expired token",
        });
    }
});






module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getForgetPasswordview,
    sendForgetpassLink,
    resetPassword,
    getResetPasswordView
}