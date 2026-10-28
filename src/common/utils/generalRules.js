import joi from "joi"
import { Types } from "mongoose"

export const generalRule={
    id:joi.string().custom((value,helper)=>{
        return Types.ObjectId.isValid(value) ? value:helper.message("inValid id")
    }),
    email: joi.string().email({minDomainSegments:2,maxDomainSegments:2}),
    password: joi.string(),
    file:joi.object({
            fieldname: joi.string().valid("attachment").required(),
            originalname: joi.string().required(),
            encoding: joi.string().required(),
            mimetype: joi.string().valid("image/png").required(),
            destination: joi.string().required(),
            filename: joi.string().required(),
            path: joi.string().required(),
            size: joi.number().required()
        }).messages({
            "any.required": "attachment is required"
        }),
        refresh:joi.object({
                authorization:joi.string().required(),
                connection:joi.string(),
                "accept-encoding":joi.string(),
                accept:joi.string(),
                "user-agent":joi.string(),
                "content-length":joi.string(),
                "postman-token":joi.string(),
                "cache-control":joi.string(),
                host:joi.string(),
            })
}

export const fileRule={
    
}

export const refreshTokenRule={
    headers:joi.object({
        authorization:joi.string().required(),
        connection:joi.string().required(),
        "accept-encoding":joi.string().required(),
        accept:joi.string().required(),
        "user-agent":joi.string().required(),
        "content-length":joi.string().required(),
        "postman-token":joi.string().required(),
        "cache-control":joi.string().required(),
        host:joi.string().required(),
    })
}