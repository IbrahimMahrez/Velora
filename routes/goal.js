
const express = require('express');
const Joi = require('joi');
const router = express.Router();

const{createSavingGoal,getAllSavingGoals,getSavingGoalById,updateSavingGoal,deleteSavingGoal}=require('../controllers/goal_controllers');
const { verifytoken,verifyAuthorization}=require('../middlewares/verifyToken');




router.get("/", verifytoken, verifyAuthorization,getAllSavingGoals);

router.get("/:id", verifytoken, verifyAuthorization,getSavingGoalById);

router.post("/", verifytoken, verifyAuthorization,createSavingGoal);

router.put("/:id", verifytoken, verifyAuthorization,updateSavingGoal);

router.delete("/:id", verifytoken, verifyAuthorization,deleteSavingGoal);




module.exports = router;