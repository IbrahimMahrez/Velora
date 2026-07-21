const Joi = require("joi");

function validateRegisterUser(user) {
    const schema = Joi.object({
        name: Joi.string().min(3).required(),

        email: Joi.string().email().required(),

        password: Joi.string().min(6).required(),

        avatar: Joi.string().min(5),

        plan: Joi.string().min(5).required(),

        occupation: Joi.string().min(5).required(),

        role: Joi.string().min(5).required(),

        isVerified: Joi.boolean(),

        isAdmin: Joi.boolean()
    });

    return schema.validate(user);
}

function validateLoginUser(user) {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required()
    });

    return schema.validate(user);
}

function validateUpdateUser(user) {
    const schema = Joi.object({
        name: Joi.string().min(3),

        email: Joi.string().email(),

        password: Joi.string().min(6),

        avatar: Joi.string().min(5),

        plan: Joi.string().min(5),

        occupation: Joi.string().min(5),

        role: Joi.string().min(5),

        isVerified: Joi.boolean(),

        isAdmin: Joi.boolean()
    });

    return schema.validate(user);
}

module.exports.validateRegisterUser = validateRegisterUser;
module.exports.validateLoginUser = validateLoginUser;
module.exports.validateUpdateUser = validateUpdateUser;