import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        },
        professionalHeadline: {
            type: String
        },
        education: [{
            institution: String,
            degree: String,
            fieldOfStudy: String,
            graduationYear: {
                type: Number,
                index: true
            }
        }],
        experience: [{
            company: {
                type: String,
                index: true
            },
            position: String,
            startDate: Date,
            endDate: Date,
            isCurrent: Boolean
        }],
        skills: [{
            type: String,
            index: true
        }],
        location: {
            address: { type: String },
            city: {
                type: String,
                index: true
            },
            state: {
                type: String,
                index: true
            },
            country: {
                type: String,
                default: 'India'
            },
            pincode: { type: String }
        },
        profilePicture: {
            type: String,
            default: null
        },
    },
    {
        timestamps: true
    }
)

const Profile = mongoose.model('Profile', profileSchema);
export default Profile;