import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../services/socket.service.js";

// Send Message
const sendMessage = async (req, res) => {
    try {
        const { receiverId, text } = req.body;
        const senderId = req.user._id;

        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId]
            })
        }

        const newMessage = await Message.create({
            conversationId: conversation._id,
            senderId: senderId,
            text: text
        })

        conversation.lastMessage = newMessage._id;
        await conversation.save()

        // REAL-TIME MAGIC: Check if the receiver is online
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            // Push the message directly to their specific open pipe
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        return res.status(200).json({
            success: true,
            message: "Message sent successfully",
            data: newMessage
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

// 2. Get Inbox (All Conversations for the logged-in user)
const getConversations = async (req, res) => {
    try {
        const userId = req.user._id;

        const conversation = await Conversation.find({
            participants: userId
        })
            .populate('participants', 'firstName lastName profilePicture')
            .populate('lastMessage')
            .sort({ updatedAt: -1 });

        return res.status(200).json({
            success: true,
            count: conversation.length,
            data: conversation
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

// 3. Get Chat History (Messages with a specific user)
const getMessages = async (req, res) => {
    try {
        const { receiverId } = req.params // The person we are chatting with
        const senderId = req.user._id

        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        });

        // If they've never chatted, return an empty array (no history yet)
        if (!conversation) {
            return res.status(200).json({
                success: true,
                data: []
            })
        }

        // Find all messages linked to this room and sort oldest to newest (like WhatsApp)
        const messages = await Message.find({
            conversationId: conversation._id
        }).sort({ createdAt: 1 })

        return res.status(200).json({
            success: true,
            data: messages
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

// 4. Delete a single message
const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user._id;

        const message = await Message.findById(messageId)

        if (!message) {
            return res.status(404).json({
                success: false,
                message: "Message not found"
            })
        }

        if (message.senderId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized to delete this message"
            })
        }

        const conversationId = message.conversationId;
        await Message.findByIdAndDelete(messageId);

        const conversation = await Conversation.findById(conversationId)
        if (conversation && conversation.lastMessage?.toString() === messageId.toString()) {
            const newLastMessage = await Message.findOne({
                conversationId
            }).sort({ createdAt: -1 })
            conversation.lastMessage = newLastMessage ? newLastMessage._id : null;
            await conversation.save();
        }

        return res.status(200).json({ 
            success: true, 
            message: "Message deleted successfully" 
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

// 5. Delete an entire conversation
const deleteConversation = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user._id;

        const conversation = await Conversation.findById(conversationId)

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found"
            })
        }

        if (!conversation.participants.includes(userId)) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized to delete this message"
            })
        }

        await Message.deleteMany({ conversationId })
        await Conversation.findByIdAndDelete(conversationId)

        return res.status(200).json({
            success: true,
            message: "Conversation and all messages deleted successfully"
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

export { sendMessage, getConversations, getMessages, deleteMessage, deleteConversation }