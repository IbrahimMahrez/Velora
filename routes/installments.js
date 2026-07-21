const express = require('express');
const Joi = require('joi');
const router = express.Router();
const Installments=require('../models/Installments');
const{
    getInstallmentAll,getInstallmentByID,createInstallment,updateInstallment,deleteInstallment,getInstallmentStatus
}=require('../controllers/installment_controllers');
const { verifytoken,verifyAuthorization}=require('../middlewares/verifyToken');



router.post('/',verifytoken,verifyAuthorization,createInstallment);
router.get('/',getInstallmentAll);
router.get('/:id',getInstallmentByID)
router.get('/status/:status',getInstallmentStatus);
router.put('/:id',verifytoken,verifyAuthorization,updateInstallment);
router.delete('/:id',verifytoken,verifyAuthorization,deleteInstallment)










module.exports=router;