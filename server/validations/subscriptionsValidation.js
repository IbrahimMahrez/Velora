const Joi = require("joi");

function validateSubscription(subscription) {
  const schema = Joi.object({
    name: Joi.string().min(5).required(),

    price: Joi.number().min(1).required(),

    category: Joi.string()
      .valid(
        "Entertainment",
        "Education",
        "Sports",
        "Health",
        "Finance",
        "Travel",
        "Food",
        "Music",
        "Other"
      )
      .required(),

    renewalCycle: Joi.string()
      .valid("monthly", "yearly", "weekly")
      .required(),

    renewalDate: Joi.date().required(),
  });

  return schema.validate(subscription);
}

function validateUpdateSubscription(subscription) {
  const schema = Joi.object({
    name: Joi.string().min(5).optional(),

    price: Joi.number().min(1).optional(),

    category: Joi.string()
      .valid(
        "Entertainment",
        "Education",
        "Sports",
        "Health",
        "Finance",
        "Travel",
        "Food",
        "Music",
        "Other"
      )
      .optional(),

    renewalCycle: Joi.string()
      .valid("monthly", "yearly", "weekly")
      .optional(),

    renewalDate: Joi.date().optional(),
  });

  return schema.validate(subscription);
}

module.exports = {
  validateSubscription,
  validateUpdateSubscription,
};