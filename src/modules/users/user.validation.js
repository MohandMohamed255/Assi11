import joi from "joi"
import { authorization } from "../../common/middleware/authorization.js"
import { generalRule } from "../../common/utils/generalRules.js"


export const signupSchema = {
    body: joi.object({
        fName: joi.string().required().messages({
            "any.required": "You must enter your first name"
        }),
        lName: joi.string().required(),
        email: generalRule.email.required(),
        password: joi.string().required(),
        age: joi.number().min(18).max(55).integer().required(),
        gender: joi.string().valid("male", "female").required(),
        phone: joi.string().required()
    }).required(),

    file: generalRule.file.required()
}

export const signInSchema={
    body:joi.object({
        email:generalRule.email.required(),
        password:generalRule.password.required(),
    })
}
export const confirmEmailSchema={
    body:joi.object({
        email:generalRule.email.required(),
        otp:joi.string().pattern(/^[0-9]{4}$/).required(),
    })
}
export const refreshTokenSchema={
    headers:generalRule.refresh.required()
}

export const shareProfileSchema={
    params:joi.object({
        id:generalRule.id.required()
    }).required()
}
export const updateProfileSchema = {
    body: joi.object({
        fName: joi.string(),
        lName: joi.string(),
        age: joi.number().min(18).max(55).integer(),
        phone: joi.string()
    }).required(),
}
export const updatePasswordSchema = {
    body: joi.object({
        oldPassword: joi.string(),
        newPassword: joi.string(),
        cPassword: joi.string().valid(joi.ref("newPassword")),
    }).required(),
}