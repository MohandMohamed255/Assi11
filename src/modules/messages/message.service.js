import jwt from 'jsonwebtoken'
import * as dbService from "../../DB/db.service.js";
import userModel from "../../DB/models/user.model.js";
import mongoose from "mongoose";
import messageModel, { requestSatusEnum } from '../../DB/models/message.model.js';
import { TIME_SERIES_REDUCERS } from 'redis';
import conversationModel from '../../DB/models/conversation.model.js';


// ======================= Create Message ==========================
export const createMessage=async(req,res,next)=>{
        const {content,receiverId}=req.body
        if(!content&&!req.files.length) throw new Error("Content is require")
            const userExist=await dbService.findById({
                model:userModel,
                id:receiverId
            })
        if (req.user && req.user._id.toString() === receiverId) {
               throw new Error("You can't send a message to yourself", { cause: 400 });
        }

        if(!userExist) throw new Error("user not exist")
        const urls = [];
        if(req?.files?.length){
            for(const file of req?.files){
                urls.push(file.path)
            }
        }

        const message=await dbService.create({
            model:messageModel,
            data:{
                content,
                attachments:urls,
                receiverId,
                senderId: req.user?._id || null
            }
        })
        return res.status(201).json({message:"Done", message})
    

// ======================= Create Message ==========================
}
// ======================= get all Message ==========================

export const getMyMessages = async (req, res, next) => {
    const messages = await messageModel
        .find({ receiverId: req.user._id })
        .populate({
            path: "senderId",
            select: "fName lName email -_id"
        })
        .sort({ createdAt: -1 })
        .lean();

    const data = messages.map(msg => ({
        _id: msg._id,
        content: msg.content,
        attachments: msg.attachments,
        createdAt: msg.createdAt,
        sender: msg.senderId
            ? {
                  name: `${msg.senderId.fName} ${msg.senderId.lName}`,
                  email: msg.senderId.email
              }
            : "anonymous"
    }));

    return res.status(200).json({ message: "Done", data });
};
// ======================= get specific Message ==========================

export const getMessageSender = async (req, res, next) => {
    const { messageId } = req.body;

    const message = await messageModel
        .findOne({ _id: messageId, receiverId: req.user._id })
        .populate({
            path: "senderId",
            select: "fName lName email -_id"
        })
        .lean();

    if (!message) throw new Error("Message not found", { cause: 404 });

    const sender = message.senderId
        ? {
              name: `${message.senderId.fName} ${message.senderId.lName}`,
              email: message.senderId.email
          }
        : "anonymous";

    return res.status(200).json({ message: "Done", data: { messageId: message._id, sender } });
};
// ======================= send Request ==========================
export const sendRequest=async(req,res,next)=>{
    const {messageId}=req.body;
    const message=await dbService.findOne({
        model:messageModel,
        filter:{
        _id:messageId,
        receiverId:req.user._id
        }
    })
    if(!message) throw new Error("Message not found",{cause:404});
    if(!message.senderId) throw new Error("This sender is not a registerd user")
    if(message.identityRequest) throw new Error(`request already  exsists with status ${message.identityRequest}`)   

message.identityRequest=requestSatusEnum.pending;
await message.save();
return res.status(201).json({message:"Request sent"})
    }
// ======================= get Requests ==========================
export const getMyRequest=async(req,res,next)=>{
    const messages=await dbService.findOne({
        model:messageModel,
        filter:{
        senderId:req.user._id,
        identityRequest: {$ne:null}
        }
    })
return res.status(201).json({message:"Done",messages})
    }
// ======================= respond Requests ==========================
export const respondRequest=async(req,res,next)=>{
    const {messageId,action}=req.body;
    const messages=await dbService.findOneAndUpdate({
        model:messageModel,
        filter:{
        _id:messageId,
        senderId:req.user._id,
        identityRequest: requestSatusEnum.pending
        },
        update:{
            identityRequest:action
        },
        options:{
            new:true
        }
    })
    if(!messages) throw new Error("Request not found or already answered",{cause:404})
        if (action === requestSatusEnum.accepted) {
        await dbService.create({
            model: conversationModel,
            data: {
                participants: [messages.senderId, messages.receiverId],
                messageId: messages._id 
            }
        });
    }
return res.status(201).json({message:`Request ${action}`})
    }