import mongoose from 'mongoose';

const eventrsvpSchema = new mongoose.Schema({
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    rsvpStatus: {
        type: String,
        enum: ['attending', 'not attending', 'maybe'],
        required: true
    }
})

eventrsvpSchema.index({ eventId: 1, userId: 1 }, { unique: true });

const EventRsvp = mongoose.model('EventRsvp', eventrsvpSchema);
export default EventRsvp;