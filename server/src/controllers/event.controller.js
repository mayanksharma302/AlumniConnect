import Event from "../models/event.model.js";
import EventRsvp from "../models/eventrsvps.model.js";

// 1. Create a new Event
const createEvent = async (req, res) => {
    try {
        if (req.user.role !== 'alumni') {
            return res.status(403).json({
                success: false,
                message: "Access Denied: Only alumni can host events."
            });
        }

        const { title, description, eventDate, location, isVirtual } = req.body;
        const organizer = req.user._id;

        if (!title || !description || !eventDate || !location) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        const newEvent = await Event.create({
            organizer,
            title,
            description,
            eventDate,
            location,
            isVirtual
        });

        return res.status(201).json({
            success: true,
            message: 'Event created successfully',
            data: newEvent
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

// 2. Get Upcoming Events (For the Dashboard)
const getUpcomingEvents = async (req, res) => {
    try {
        const events = await Event.find({ eventDate: { $gte: new Date() } })
            .populate('organizer', 'firstName lastName profilePicture')
            .sort({ eventDate: 1 });

        return res.status(200).json({
            success: true,
            count: events.length,
            events: events
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

// 3. Delete an Event
const deleteEvent = async (req, res) => {
    try {
        if (req.user.role !== 'alumni') {
            return res.status(403).json({
                success: false,
                message: "Access Denied: Only alumni can delete events."
            });
        }

        const { eventId } = req.params;
        const userID = req.user._id;

        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        if (event.organizer.toString() !== userID.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to delete this event'
            });
        }

        await EventRsvp.deleteMany({ eventId });
        await Event.findByIdAndDelete(eventId);

        return res.status(200).json({
            success: true,
            message: 'Event and all associated RSVPs deleted successfully'
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

// 4. RSVP to an Event (Create or Update)
const rsvpToEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { rsvpStatus } = req.body;
        const userId = req.user._id;

        const validStatuses = ['attending', 'not attending', 'maybe'];
        if (!validStatuses.includes(rsvpStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid RSVP status'
            });
        }

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        if (event.organizer.toString() === userId.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Organizers cannot RSVP to their own events'
            });
        }
        // UPSERT: If RSVP exists, update it; otherwise, create a new one
        const rsvp = await EventRsvp.findOneAndUpdate(
            { eventId, userId },
            { rsvpStatus },
            { returnDocument: 'after', upsert: true }
        );

        return res.status(200).json({
            success: true,
            message: 'RSVP status updated successfully',
            rsvp: rsvp
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

// 5. Get attendees for a specific event
const getEventAttendees = async (req, res) => {
    try {
        if (req.user.role !== 'alumni') {
            return res.status(403).json({
                success: false,
                message: "Access Denied: Only alumni can Get attendees for a specific event"
            });
        }
        const { eventId } = req.params;

        const attendees = await EventRsvp.find({ eventId, rsvpStatus: 'attending' })
            .populate('userId', 'firstName lastName profilePicture');

        return res.status(200).json({
            success: true,
            count: attendees.length,
            attendees: attendees
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

// 6. Get events the logged-in user is attending
const getMyRsvps = async (req, res) => {
    try {
        const userId = req.user._id;

        const myRsvps = await EventRsvp.find({ userId })
            .populate('eventId')
            .sort({ createdAt: 1 });

        return res.status(200).json({
            success: true,
            count: myRsvps.length,
            data: myRsvps
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

const getMyEvents = async (req, res) => {
    try {
        if (req.user.role !== 'alumni') {
            return res.status(403).json({
                success: false,
                message: "Access Denied: Only alumni can get their events."
            });
        }
        const userId = req.user._id;

        // Fetch all events where this user is the organizer
        const myEvents = await Event.find({ organizer: userId })
            .sort({ eventDate: -1 }); // Sort by newest event date first

        return res.status(200).json({
            success: true,
            count: myEvents.length,
            data: myEvents
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error fetching your events", error: error.message });
    }
};

export {
    createEvent,
    getUpcomingEvents,
    deleteEvent,
    rsvpToEvent,
    getEventAttendees,
    getMyRsvps,
    getMyEvents
}