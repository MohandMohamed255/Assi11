import joi from "joi"
import { generalRule } from "../../common/utils/generalRules.js"



export const createMessageSchema= {
    body: joi.object({
        content:joi.string().min(1),
        receiverId:generalRule.id.required(),
        
    }).required(),

    file: generalRule.file
}
export const getMessageSenderSchema = {
    body: joi.object({
        messageId: generalRule.id.required()
    }).required()
};
export const requestSchema={
    body:joi.object({messageId:generalRule.id.required()}).required()
}
export const respondSchema={
    body:joi.object({
        messageId:generalRule.id.required(),
        action:joi.string().valid("accepted","rejected").required()
    }).required()
}