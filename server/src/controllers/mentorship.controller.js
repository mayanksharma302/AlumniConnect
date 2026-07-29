import User from "../models/user.model.js";
import Profile from "../models/profile.model.js";
import Mentorship from "../models/mentorship.model.js";

// Send mentorship request
const sendRequest = async (req, res) => {
    try {
        const { mentorId, message } = req.body;
        const menteeId = req.user._id;

        if (!mentorId || !message) {
            res.status(400).json({
                message: "Mentor ID and message are required"
            })
        }

        if (mentorId === menteeId) {
            res.status(400).json({
                message: "You cannot send a mentorship request to yourself"
            })
        }

        const request = await Mentorship.create({
            mentorId,
            menteeId,
            message
        });

        res.status(201).json({
            message: "Mentorship request sent successfully",
            request
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                message: "You have already sent a mentorship request to this mentor"
            })
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

// Mentor Inbox
const getReceivedRequests = async (req, res) => {
    try {
        const { status } = req.query;
        let query = { mentorId: req.user._id };

        if (status) query.status = status;

        const requests = await Mentorship.find(query)
            .populate('menteeId', 'email role')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Requests retrieved successfully",
            count: requests.length,
            requests
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

// Mentee Outbox
const getSentRequests = async (req, res) => {
    try {
        const { status } = req.query;
        let query = { menteeId: req.user._id };

        if (status) query.status = status;

        const requests = await Mentorship.find(query)
            .populate('mentorId', 'email role')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Requests retrieved successfully",
            count: requests.length,
            requests
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

// Update request status
const updateRequestStatus = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { status } = req.body;

        const validStatuses = ['pending', 'accepted', 'rejected'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid status value. Must be one of 'pending', 'accepted', or 'rejected'."
            });
        }

        const request = await Mentorship.findOneAndUpdate(
            {
                _id: requestId,
                mentorId: req.user._id
            },
            { $set: { status } },
            { returnDocument: 'after' }
        );

        if (!request) {
            return res.status(404).json({
                message: "Request not found"
            });
        }

        return res.status(200).json({
            message: `Mentorship request ${status} successfully`,
            request
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

export { sendRequest, getReceivedRequests, getSentRequests, updateRequestStatus }