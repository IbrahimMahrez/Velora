const express = require('express');
const Joi = require('joi');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { Subscription } = require('../models/Subscriptions');
const { getSubscription, getSubscriptionById, createSubscription ,updateSubscription,deleteSubscription } = require('../controllers/subscriptions_controlles');
const {verifytoken,verifyAuthorization,verifyAuthorizationadmin} = require('../middlewares/verifyToken');



router.get('/',verifyAuthorizationadmin,verifytoken,getSubscription)
router.get('/:id',verifyAuthorization,verifytoken,getSubscriptionById)
router.post('/',verifyAuthorization,verifytoken,createSubscription)
router.put('/:id',verifyAuthorization,verifytoken,updateSubscription)
router.delete('/:id',verifyAuthorization,verifytoken,deleteSubscription)




module.exports = router;