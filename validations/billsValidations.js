const Joi = require("joi");




function validateBills(Bill) {
   const schema= Joi.object({
     title:Joi.string().min(5).required(),
     amount:Joi.number().min(5).required(),
     category:Joi.string().min(5),
     billingCycle:Joi.string().min(5),
     status:Joi.string().min(5),
     dueDate:Joi.date().min(5)

})
return schema.validate(Bill)
}


function validateUpdateBill(Bill) {
    const schema= Joi.object({
      title:Joi.string().min(5).required(),
     amount:Joi.number().min(5).required(),
     category:Joi.string().min(5),
     billingCycle:Joi.string().min(5),
     status:Joi.string(),
     dueDate:Joi.date().min(5)
    })
   return schema.validate(Bill)
}



module.exports={validateBills,validateUpdateBill}