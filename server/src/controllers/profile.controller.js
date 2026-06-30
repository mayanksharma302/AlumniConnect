import User from "../models/user.model";
import Profile from "../models/profile.model";


const createProfile = async (req, res) => {
    const { firstName, lastName, proffesionalHeadLine, education, experience, skills, location } = req.body;

    if (!firstName || !lastName || !location) {
        res.status(401).json({
            message: "One or more fields are missing"
        })
    }

    const profile = await Profile.create({
        user: User._id,
        firstName,
        lastName,
        proffesionalHeadLine,
        education,
        experience,
        skills,
        location
    })

    if (!profile) {
        res.status(401).json({
            message: "Profile creation failed"
        })
    }

    res.status(200).json({
        message: "Profile created successfully",
        profile
    })
}