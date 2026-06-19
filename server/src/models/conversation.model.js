import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
    {
        participants: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        }],
        lastMessagePreview: {
            type: String // Stored here so the inbox loads instantly
        },
        lastMessageAt: {
            type: Date,
            index: -1  // Sort by most recent conversations first
        }
    },
    {
        timestamps: true
    }
)

