import { Router } from "express";
import { authentication } from "../../common/middleware/authentication.js";
import { Validation } from "../../common/middleware/validation.js";
import * as CS from "./conversation.service.js";
import * as CV from "./conversation.validation.js";

const convRouter=Router()

convRouter.get("/",authentication,CS.getMyConversations);
convRouter.post("/:conversationId/messages",authentication,Validation(CV.sendChatMessageSchema),CS.sendChatMessage)





export default convRouter