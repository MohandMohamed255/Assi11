import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
    participants: {
        type: [{ type: mongoose.Types.ObjectId, ref: "User" }],
        required: true
    },
    messageId: {
        type: mongoose.Types.ObjectId,
        ref: "message",
        required: true,
        unique: true         
    },
    leftBy: [{ type: mongoose.Types.ObjectId, ref: "User" }]
}, { timestamps: true });

const conversationModel = mongoose.models.conversation || mongoose.model("conversation", conversationSchema);
export default conversationModel;