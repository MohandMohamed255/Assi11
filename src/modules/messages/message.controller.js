import { Router } from "express";
import * as MS from "./message.service.js"
import { authentication, optionalAuthentication } from "../../common/middleware/authentication.js";
import { Validation } from "../../common/middleware/validation.js";
import { multerLocal } from "../../common/middleware/multer.js";
import * as MV from "./message.validat.js"
import { Multer_Enum } from "../../common/enum/user.enum.js";


const messageRouter=Router();

messageRouter.post("/send",
    multerLocal({
        customPath:"messages",
        customType:Multer_Enum.image
    }).array("attachments",3),
    optionalAuthentication,
    Validation(MV.createMessageSchema),
    MS.createMessage)

messageRouter.get("/",authentication,MS.getMyMessages)
messageRouter.get("/sender",authentication,Validation(MV.getMessageSenderSchema),MS.getMessageSender)
messageRouter.post("/request-sender",authentication,Validation(MV.requestSchema),MS.sendRequest)
messageRouter.get("/requests",authentication,MS.getMyRequest)
messageRouter.patch("/requests/respond",authentication,Validation(MV.respondSchema),MS.respondRequest)





export default messageRouter
