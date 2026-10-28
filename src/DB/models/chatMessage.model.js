import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Types.ObjectId,
        ref: "conversation",
        required: true
    },
    senderId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    }
}, { timestamps: true });

const chatMessageModel = mongoose.models.chatMessage || mongoose.model("chatMessage", chatMessageSchema);
export default chatMessageModel;