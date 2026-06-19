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
        proffesionalHeadline: {
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
        location: [{
            type: String,
            index: true
        }],
        profilePicture: String,
    },
    {
        timestamps: true
    }
)

const Profile = mongoose.model('Profile', profileSchema);
export default Profile;