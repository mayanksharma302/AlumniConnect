import User from "../models/user.model.js";
import Profile from "../models/profile.model.js";
import uploadOnCloudinary from "../services/cloudinary.service.js";

const createProfile = async (req, res) => {
    try {
        const { firstName, lastName, proffesionalHeadLine, education, experience, skills, location } = req.body;

        if (!firstName || !lastName || !location?.city || !location?.state) {
            return res.status(400).json({
                message: "First name, last name, city, and state are required"
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

        if (!profile) {
            return res.status(404).json({
                message: "Profile not found"
            })
        }

        res.status(200).json({
            message: "Profile retrieved successfully",
            profile
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error while retrieving profile",
            error: error.message
        })
    }
}

const getProfileByUserId = async (req, res) => {
    try {
        // Find profile by the ID passed in the URL (e.g., /api/profile/user/12345)
        const profile = await Profile.findOne({ userId: req.params.userId })
            .populate('userId', 'email role'); // Optionally pull in their email/role from the User collection

        if (!profile) {
            return res.status(404).json({
                message: "Profile not found"
            });
        }

        return res.status(200).json({
            message: "Profile retrieved successfully",
            profile
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error while retrieving user profile",
            error: error.message
        });
    }
}

const getAlumniDirectory = async (req, res) => {
    try {
        const { search, skills, location, page = 1, limit = 10 } = req.query;
        let query = {};

        // Flexible Regex Searching
        if (skills) {
            query.skills = { $regex: skills, $options: 'i' }; // Case-insensitive
        }
        if (location) {
            // This allows a user to type "Gujarat" and it will check both city and state fields
            query.$or = [
                { 'location.city': { $regex: location, $options: 'i' } },
                { 'location.state': { $regex: location, $options: 'i' } }
            ];
        }
        // If you want a general search bar for names or headlines
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { proffesionalHeadLine: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const profiles = await Profile.find(query)
            .populate('userId', 'email role')
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Profile.countDocuments(query);

        return res.status(200).json({
            success: true,
            count: profiles.length,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            profiles
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching directory',
            error: error.message
        });
    }
}

const setProfileImage = async (req, res) => {
    try {
        const profileImagePath = req.file?.path

        if (!profileImagePath) {
            return res.status(400).json({
                message: "Profile image is required"
            })
        }

        const profileImage = await uploadOnCloudinary(profileImagePath)

        if (!profileImage.url) {
            return res.status(400).json({
                message: "Error while uploading profile image"
            })
        }

        const profile = await Profile.findOneAndUpdate(
            { userId: req.user?._id },
            {
                $set: {
                    profilePicture: profileImage.url
                }
            },
            { returnDocument: 'after' }
        );

        return res.status(200).json({
            message: "Profile image updated successfully",
            profile
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error while updating profile image",
            error: error.message
        })
    }
}

const updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, proffesionalHeadLine, education, experience, skills, location } = req.body;

        // Dynamic update object targeting the specific array index
        let updateFields = {};
        if (firstName) updateFields.firstName = firstName;
        if (lastName) updateFields.lastName = lastName;
        if (proffesionalHeadLine) updateFields.proffesionalHeadLine = proffesionalHeadLine;
        if (location) {
            if (location.address) updateFields['location.address'] = location.address;
            if (location.city) updateFields['location.city'] = location.city;
            if (location.state) updateFields['location.state'] = location.state;
            if (location.country) updateFields['location.country'] = location.country;
            if (location.pincode) updateFields['location.pincode'] = location.pincode;
        }

        // Passing the dynamic object to $set
        const profile = await Profile.findOneAndUpdate(
            { userId: req.user._id },
            { $set: updateFields },
            { returnDocument: 'after' }
        );

        if (!profile) {
            return res.status(404).json({
                message: "Profile not found"
            })
        }

        return res.status(200).json({
            message: "Profile updated successfully",
            profile
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error while updating profile",
            error: error.message
        })
    }
}

const addEducation = async (req, res) => {
    try {
        const { institution, degree, fieldOfStudy, graduationYear } = req.body;

        if (!institution || !degree) {
            return res.status(400).json({
                message: "Institution and degree are required"
            });
        }

        const profile = await Profile.findOneAndUpdate(
            { userId: req.user._id },
            {
                $push: {
                    education: { institution, degree, fieldOfStudy, graduationYear }
                }
            },
            { returnDocument: 'after' }
        );

        if (!profile) return res.status(404).json({
            message: "Profile not found"
        });

        return res.status(200).json({
            message: "Education added successfully",
            profile
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
}

const updateEducation = async (req, res) => {
    try {
        const { eduId } = req.params; // Passed in the URL: /api/profile/education/:eduId
        const { institution, degree, fieldOfStudy, graduationYear } = req.body;

        // Dynamic update object targeting the specific array index
        let updateFields = {};
        if (institution) updateFields['education.$.institution'] = institution;
        if (degree) updateFields['education.$.degree'] = degree;
        if (fieldOfStudy) updateFields['education.$.fieldOfStudy'] = fieldOfStudy;
        if (graduationYear) updateFields['education.$.graduationYear'] = graduationYear;

        // Passing the dynamic object to $set
        const profile = await Profile.findOneAndUpdate(
            {
                userId: req.user._id,
                'education._id': eduId
            },
            {
                $set: updateFields
            },
            { returnDocument: 'after' }
        );

        if (!profile) return res.status(404).json({
            message: "Profile or Education entry not found"
        });

        return res.status(200).json({
            message: "Education updated successfully",
            profile
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
}

const deleteEducation = async (req, res) => {
    try {
        const { eduId } = req.params;

        const profile = await Profile.findOneAndUpdate(
            { userId: req.user._id },
            {
                $pull: {
                    education: { _id: eduId } // Plucks out the object where _id matches
                }
            },
            { returnDocument: 'after' }
        );

        if (!profile) return res.status(404).json({
            message: "Profile or education entry not found"
        });

        return res.status(200).json({
            message: "Education removed successfully",
            profile
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
}

const addExperience = async (req, res) => {
    try {
        const { company, position, startDate, endDate, isCurrent } = req.body;

        if (!company || !position || !startDate) {
            return res.status(400).json({
                message: "Company, position, and start date are required"
            });
        }

        const profile = await Profile.findOneAndUpdate(
            { userId: req.user._id },
            {
                $push: {
                    experience: { company, position, startDate, endDate, isCurrent }
                }
            },
            { returnDocument: 'after' }
        )

        if (!profile) return res.status(404).json({
            message: "Profile not found"
        })

        return res.status(200).json({
            message: "Exprience added successfully",
            profile
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        })
    }
}

const updateExperience = async (req, res) => {
    try {
        const { expId } = req.params; // Passed in the URL: /api/profile/experience/:expId
        const { company, position, startDate, endDate, isCurrent } = req.body;

        // Dynamic update object targeting the specific array index
        let updateFields = {};
        if (company) updateFields['experience.$.company'] = company;
        if (position) updateFields['experience.$.position'] = position;
        if (startDate) updateFields['experience.$.startDate'] = startDate;
        if (endDate) updateFields['experience.$.endDate'] = endDate;
        if (isCurrent !== undefined) updateFields['experience.$.isCurrent'] = isCurrent;

        // Passing the dynamic object to $set
        const profile = await Profile.findOneAndUpdate(
            {
                userId: req.user._id,
                'experience._id': expId
            },
            {
                $set: updateFields
            },
            { returnDocument: 'after' }
        )

        if (!profile) return res.status(404).json({
            message: "Profile or Experience entry not found"
        })

        return res.status(200).json({
            message: "Experience updated successfully",
            profile
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        })
    }
}

const deleteExperience = async (req, res) => {
    try {
        const { expId } = req.params;

        const profile = await Profile.findOneAndUpdate(
            { userId: req.user._id },
            {
                $pull: {
                    experience: { _id: expId } // Plucks out the object where _id matches
                }
            },
            { returnDocument: 'after' }
        )

        if (!profile) return res.status(404).json({
            message: "Profile or Experience entry not found"
        })

        return res.status(200).json({
            message: "Experience removed successfully",
            profile
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        })
    }
}

const addSkill = async (req, res) => {
    try {
        const { skill } = req.body;

        const profile = await Profile.findOneAndUpdate(
            { userId: req.user._id },
            { $addToSet: { skills: skill } }, // $addToSet ensures skills isn't added twice
            { returnDocument: 'after' }
        );

        return res.status(200).json({ message: "Skill added", profile });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        })
    }
}


const removeSkill = async (req, res) => {
    try {
        const { skill } = req.params; // Passed in URL: /api/profile/skills/React

        const profile = await Profile.findOneAndUpdate(
            { userId: req.user._id },
            { $pull: { skills: skill } }, // Plucks the exact string out of the array
            { returnDocument: 'after' }
        );

        return res.status(200).json({ message: "Skill removed", profile });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        })
    }
}

export { createProfile, getProfile, setProfileImage, updateProfile, addEducation, updateEducation, deleteEducation, addExperience, updateExperience, deleteExperience, addSkill, removeSkill, getProfileByUserId, getAlumniDirectory };