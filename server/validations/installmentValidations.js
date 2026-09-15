const Joi = require("joi");

function validateInstallment(installment) {
    const schema = Joi.object({
        productName: Joi.string().min(3).required(),

        totalPrice: Joi.number().min(0).required(),

        downPayment: Joi.number().min(0).default(0),

        monthlyPayment: Joi.number().min(0).required(),

        totalMonths: Joi.number()
            .integer()
            .min(1)
            .required(),

        paidMonths: Joi.number()
            .integer()
            .min(0)
            .default(0),

        startDate: Joi.date().required(),

        nextPaymentDate: Joi.date().required(),

        status: Joi.string()
            .valid("active", "completed", "overdue")
            .default("active"),

        notes: Joi.string()
            .allow("", null)
            .default(""),
    });

    return schema.validate(installment);
}


function validateUpdateInstallment(installment) {
    const schema = Joi.object({
        productName: Joi.string().min(3),

        totalPrice: Joi.number().min(0),

        downPayment: Joi.number().min(0),

        monthlyPayment: Joi.number().min(0),

        totalMonths: Joi.number()
            .integer()
            .min(1),

        paidMonths: Joi.number()
            .integer()
            .min(0),

        startDate: Joi.date(),

        nextPaymentDate: Joi.date(),

        status: Joi.string()
            .valid("active", "completed", "overdue"),

        notes: Joi.string().allow("", null),
    });

    return schema.validate(installment);
}


module.exports = {
    validateInstallment,
    validateUpdateInstallment,
};
