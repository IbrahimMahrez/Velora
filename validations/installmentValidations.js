const Joi = require("joi");

function validateInstallment(installment) {
    const schema = Joi.object({
        productName: Joi.string().min(3).required(),

        totalPrice: Joi.number().required(),

        downPayment: Joi.number().min(0),

        monthlyPayment: Joi.number().required(),

        totalMonths: Joi.number().integer().min(1).required(),

        paidMonths: Joi.number().integer().min(0),

        remainingAmount: Joi.number(),

        startDate: Joi.date().required(),

        nextPaymentDate: Joi.date().required(),

        status: Joi.string()
            .valid("active", "completed", "overdue"),

        notes: Joi.string().allow("", null),
    });

    return schema.validate(installment);
}

function validateUpdateInstallment(installment) {
    const schema = Joi.object({
        productName: Joi.string().min(3),

        totalPrice: Joi.number(),

        downPayment: Joi.number().min(0),

        monthlyPayment: Joi.number(),

        totalMonths: Joi.number().integer().min(1),

        paidMonths: Joi.number().integer().min(0),

        remainingAmount: Joi.number(),

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