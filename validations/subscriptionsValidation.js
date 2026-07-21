const Joi = require("joi");




function validateSubscription(subscription) {
   const schema= Joi.object({
    name:Joi.string().min(5).required(),
    price:Joi.number().min(5).required(),
    category:Joi.string().min(5).required(),
    renewalCycle:Joi.string().min(5).required(),
    renewalDate:Joi.string().min(5).required()
})
return schema.validate(subscription)
}


function validateUpdateSubscription(subscription) {
    const schema= Joi.object({
        name:Joi.string().min(5).required(),
        price:Joi.number().min(5).required(),
        category:Joi.string().min(5).required(),
        renewalCycle:Joi.string().min(5).required(),
        renewalDate:Joi.string().min(5).required()
    })
   return schema.validate(subscription)
}



module.exports={validateSubscription,validateUpdateSubscription}