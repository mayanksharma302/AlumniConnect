import { Router } from "express";
import {
    createEvent,
    getUpcomingEvents,
    deleteEvent,
    rsvpToEvent,
    getEventAttendees,
    getMyRsvps,
    getMyEvents
} from "../controllers/event.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const eventRouter = Router();

eventRouter.use(authMiddleware);

// --- Event Routes ---
eventRouter.post("/create", createEvent);
eventRouter.get("/upcoming", getUpcomingEvents);
eventRouter.delete("/:eventId", deleteEvent);

// --- RSVP Routes ---
eventRouter.post("/:eventId/rsvp", rsvpToEvent);
eventRouter.get("/:eventId/attendees", getEventAttendees);
eventRouter.get("/my-rsvps", getMyRsvps);
eventRouter.get("/my-events", getMyEvents);

export default eventRouter;