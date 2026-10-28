import joi from "joi";
import { generalRule } from "../../common/utils/generalRules.js";

export const conversationIdSchema = {
    params: joi.object({
        conversationId: generalRule.id.required()
    }).required()
};

export const sendChatMessageSchema = {
    params: joi.object({
        conversationId: generalRule.id.required()
    }).required(),
    body: joi.object({
        content: joi.string().trim().min(1).required()
    }).required()
};