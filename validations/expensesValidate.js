const Joi = require("joi");




function validateExpenses(Expenses) {
   const schema= Joi.object({
    title:Joi.string().min(3).required(),
    amount:Joi.number().min(1).required(),
    category:Joi.string().min(3),
    date:Joi.date(),
    notes:Joi.string().min(5)
  

})
return schema.validate(Expenses)
}


function validateUpdateExpenses(Expenses) {
    const schema= Joi.object({
     title:Joi.string().min(3).required(),
    amount:Joi.number().min(1).required(),
    category:Joi.string().min(3),
    date:Joi.date(),
    notes:Joi.string().min(5)
    })
   return schema.validate(Expenses)
}



module.exports={validateExpenses,validateUpdateExpenses}