import mongoose from 'mongoose';

const mentorshipSchema = new mongoose.Schema(
    {
        mentorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        menteeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending'
        },
        message: {
            type: String,
            required: true,
            maxlength: 500
        }
    },
    {
        timestamps: true
    }
)

mentorshipSchema.index({ mentorId: 1, menteeId: 1 }, { unique: true });

const Mentorship = mongoose.model('Mentorship', mentorshipSchema);
export default Mentorship;
