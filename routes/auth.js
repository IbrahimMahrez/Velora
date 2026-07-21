const express = require('express');
const Joi = require('joi');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { registerUser ,loginUser,logoutUser,getResetPasswordView,sendForgetpassLink,resetPassword,getForgetPasswordview} = require('../controllers/auth_controlles');




router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', logoutUser);
router.get("/forgetpassword", getForgetPasswordview);

router.post("/forgetpassword", sendForgetpassLink);

router.get(
    "/reset-password/:userId/:token",
    getResetPasswordView
);

router.post(
    "/reset-password/:userId/:token",
    resetPassword
);











   module.exports = router;