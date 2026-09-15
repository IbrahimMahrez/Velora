const Joi = require("joi");

function validateBills(Bill) {
    const schema = Joi.object({
        title: Joi.string().min(3).required(),

        amount: Joi.number().min(5).required(),

        category: Joi.string()
            .valid(
                "Electricity",
                "Water",
                "Internet",
                "Gas",
                "Mobile",
                "Rent",
                "Other"
            )
            .default("Other"),

        billingCycle: Joi.string()
            .valid("monthly", "weekly", "yearly")
            .default("monthly"),

        status: Joi.string()
            .valid("pending", "paid", "overdue")
            .default("pending"),

        dueDate: Joi.date().required(),

        reminderEnabled: Joi.boolean(),

        notes: Joi.string().allow(""),
    });

    return schema.validate(Bill);
}

function validateUpdateBill(Bill) {
    const schema = Joi.object({
        title: Joi.string().min(3).required(),

        amount: Joi.number().min(5).required(),

        category: Joi.string().valid(
            "Electricity",
            "Water",
            "Internet",
            "Gas",
            "Mobile",
            "Rent",
            "Other"
        ),

        billingCycle: Joi.string().valid(
            "monthly",
            "weekly",
            "yearly"
        ),

        status: Joi.string().valid(
            "pending",
            "paid",
            "overdue"
        ),

        dueDate: Joi.date().required(),

        reminderEnabled: Joi.boolean(),

        notes: Joi.string().allow(""),
    });

    return schema.validate(Bill);
}

module.exports = {
    validateBills,
    validateUpdateBill
};