import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
    {
        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        eventDate: {
            type: Date,
            required: true,
            index: true
        },
        location: {
            type: String,
            required: true,
        },
        isVirtual: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
)

const Event = mongoose.model('Event', eventSchema);
export default Event;

