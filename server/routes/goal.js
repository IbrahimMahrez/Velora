
const express = require('express');
const Joi = require('joi');
const router = express.Router();

const{createSavingGoal,getAllSavingGoals,getSavingGoalById,updateSavingGoal,deleteSavingGoal,contributeToGoal}=require('../controllers/goal_controllers');
const { verifytoken,verifyAuthorization}=require('../middlewares/verifyToken');




router.get("/", verifytoken, getAllSavingGoals);

router.get("/:id", verifytoken, getSavingGoalById);

router.post("/", verifytoken, createSavingGoal);

router.put("/:id", verifytoken,updateSavingGoal);

router.delete("/:id", verifytoken, deleteSavingGoal);

router.patch("/:id/contribute", verifytoken, contributeToGoal);




module.exports = router;