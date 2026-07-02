import User from "../models/user.model.js";
import Profile from "../models/profile.model.js";


const createProfile = async (req, res) => {
    try{
        const { firstName, lastName, proffesionalHeadLine, education, experience, skills, location } = req.body;

        if (!firstName || !lastName || !location) {
            return res.status(401).json({
                message: "One or more fields are missing"
            })
        }

        const profile = await Profile.create({
            userId: req.user._id,
            firstName,
            lastName,
            proffesionalHeadLine,
            education,
            experience,
            skills,
            location
        })

        if (!profile) {
            return res.status(401).json({
                message: "Profile creation failed"
            })
        }

        res.status(200).json({
            message: "Profile created successfully",
            profile
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error while creating profile",
            error: error.message
        })
    }
}


const getProfile = async (req, res) => {
    try {
        const profile = await Profile.findOne({
        userId: req.user._id
    })

    if(!profile){
        return res.status(404).json({
            message: "Profile not found"
        })
    }

    res.status(200).json({
        message: "Profile retrieved successfully",
        profile
    })
    } catch (error){
        return res.status(500).json({
            success: false,
            message: "Server error while retrieving profile",
            error: error.message
        })
    }
}

export { createProfile, getProfile };