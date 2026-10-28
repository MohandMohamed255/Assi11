import * as dbService from "../../DB/db.service.js";
import conversationModel from "../../DB/models/conversation.model.js";



export const getMyConversation = async (conversationId, userId) => {
    const conversation = await dbService.findOne({
        model: conversationModel,
        filter: {
            _id: conversationId,
            participants: userId,
            leftBy: { $ne: userId }
        }
    });
    if (!conversation) throw new Error("Conversation not found", { cause: 404 });
    return conversation;
};