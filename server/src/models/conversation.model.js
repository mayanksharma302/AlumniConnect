import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
    {
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            }
        ],
        // This is a UI optimization. It allows us to quickly show the 
        // "preview" snippet in the inbox without doing complex database joins.
        lastMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message'
        }
    },
    { timestamps: true }
);

// Index the participants array so querying a user's inbox is lightning fast
conversationSchema.index({ participants: 1 });

const Conversation = mongoose.model('Conversation', conversationSchema);
export default Conversation;