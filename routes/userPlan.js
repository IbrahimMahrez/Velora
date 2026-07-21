const express=require("express");

const router=express.Router();


const {
    subscribe
}=require("../controllers/userPlanController");
const {verifytoken,verifyAuthorization,verifyAuthorizationadmin} = require('../middlewares/verifyToken');
const premiumOnly=require("../middlewares/premiumOnly");



router.post(
    "/subscribe",
    verifytoken,
    subscribe
);
router.get(
    "/ai-insights",
    verifytoken,
    premiumOnly,
    (req, res) => {

        res.status(200).json({
            message: "Welcome to AI Insights  coming soon🔥"
        });

    }
);



module.exports=router;