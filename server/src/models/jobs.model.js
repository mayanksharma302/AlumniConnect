import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
    {
        postedBy: {
            type: mongoose.Schema.types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        company: {
            type: String,
            required: true,
            index: true
        },
        jobTitle: {
            type: String,
            required: true,
            index: true
        },
        jobDescription: {
            type: String,
            required: true
        },
        requirements: {
            type: String,
            required: true
        },
        applyLink: {
            type: String,
            required: true
        },
        isActive: {
            type: Boolean,
            default: true
        },
        expiresAt: {
            type: Date,
            required: true,
            index: { expires: 0 } // This will automatically delete the document when the expiration time is reached
        }
    },
    {
        timestamps: true
    }
)

const Job = mongoose.model('Job', jobSchema);
export default Job;