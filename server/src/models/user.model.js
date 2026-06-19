import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        password: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ['admin', 'alumni', 'student'],
        },
        AccountStatus: {
            type: String,
            enum: ['unverified', 'verified', 'suspended'],
        },
        lastLogin: {
            type: Date,
        }
    },
    {
        timestamps: true
    }
)

const User = mongoose.model('User', userSchema);
export default User;