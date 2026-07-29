import { Router } from "express";
import {
    sendMessage, 
    getConversations, 
    getMessages, 
    deleteMessage, 
    deleteConversation
} from "../controllers/message.controller.js"
import authMiddleware from "../middlewares/auth.middleware.js";

const messageRouter = new Router()

messageRouter.use(authMiddleware)

messageRouter.get('/conversations', getConversations);                      // 1. Inbox: Get all conversations
messageRouter.get('/:receiverId', getMessages);                             // 2. Chat History: Get all messages with a specific user
messageRouter.post('/send', sendMessage);                                   // 3. Send Message
messageRouter.delete('/:messageId', deleteMessage);                         // 4. Delete a single message
messageRouter.delete('/conversation/:conversationId', deleteConversation);  // 5. Delete an entire conversation

export default messageRouter;
