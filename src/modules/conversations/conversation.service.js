import * as dbService from "../../DB/db.service.js";
import chatMessageModel from "../../DB/models/chatMessage.model.js";
import conversationModel from "../../DB/models/conversation.model.js";
import userModel from "../../DB/models/user.model.js";
import mongoose from "mongoose";
import messageModel, { requestSatusEnum } from '../../DB/models/message.model.js';
import { getMyConversation } from "./conversation.helper.js";

// ============ عرض محادثاتي ومين الأطراف ============
export const getMyConversations = async (req, res, next) => {
    const conversations = await conversationModel
        .find({ participants: req.user._id, leftBy: { $ne: req.user._id } })
        .populate({ path: "participants", select: "fName lName email" })
        .sort({ updatedAt: -1 })
        .lean();
 if (!conversations.length) {
    throw new Error("No conversations found", { cause: 404 });
}

    const data = conversations.map(c => ({
        _id: c._id,
        messageId: c.messageId,
        participants: c.participants.map(p => ({
            _id: p._id,
            name: `${p.fName} ${p.lName}`,
            email: p.email
        })),
        createdAt: c.createdAt
    }));

    return res.status(200).json({ message: "Done", data });
};


// ============ إرسال رسالة جوه المحادثة ============
export const sendChatMessage = async (req, res, next) => {
    const { conversationId } = req.params;
    const { content } = req.body;

    const conversation = await getMyConversation(conversationId, req.user._id);

    // لو الطرف التاني خرج، مفيش فايدة من الإرسال
    if (conversation.leftBy.length) {
        throw new Error("The other user left the conversation", { cause: 400 });
    }

    const chatMessage = await dbService.create({
        model: chatMessageModel,
        data: {
            conversationId,
            senderId: req.user._id,
            content
        }
    });
const created = Array.isArray(chatMessage) ? chatMessage[0] : chatMessage;

return res.status(201).json({ message: "Done", data: {content:created.content} });
};

// ============ عرض رسايل المحادثة ============
export const getChatMessages = async (req, res, next) => {
    const { conversationId } = req.params;

    await getMyConversation(conversationId, req.user._id);

    const messages = await chatMessageModel
        .find({ conversationId })
        .sort({ createdAt: 1 })
        .select("senderId content createdAt")
        .lean();

    return res.status(200).json({ message: "Done", data: messages });
};

// ============ الخروج من المحادثة ============
export const leaveConversation = async (req, res, next) => {
    const { conversationId } = req.params;

    const conversation = await getMyConversation(conversationId, req.user._id);

    conversation.leftBy.push(req.user._id);

    // لو الاتنين خرجوا: امسح المحادثة وكل رسايلها
    if (conversation.leftBy.length === conversation.participants.length) {
        await chatMessageModel.deleteMany({ conversationId });
        await conversationModel.deleteOne({ _id: conversationId });
        return res.status(200).json({ message: "Both users left, conversation deleted" });
    }

    await conversation.save();
    return res.status(200).json({ message: "You left the conversation" });
};