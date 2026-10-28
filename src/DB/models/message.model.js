
import mongoose from "mongoose";

export const requestSatusEnum={pending:"pending",accepted:"accepted",rejected:"rejected"}
const messageSchema=new mongoose.Schema({
    content:{
        type:String,
        required: function () {
            return this.attachments?.length ? false : true
        }
    },
    attachments:[String],
    receiverId:{                            
        type:mongoose.Types.ObjectId,
        ref:"User",
        required:true
    },
    senderId:{                            
        type:mongoose.Types.ObjectId,
        ref:"User",
        default:null
    },
    identityRequest:{
        type:String,
        enum:Object.values(requestSatusEnum),
        default:null
    }

},{timestamps:true})

const messageModel=mongoose.models.message || mongoose.model("message",messageSchema)
 
export default messageModel