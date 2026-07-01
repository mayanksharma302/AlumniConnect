import mongoose from "mongoose";

const otpModel = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    email: {
        type: String,
        required: true
    },
    otpHash: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})

const otps = mongoose.model("otps", otpModel)

export default otps;