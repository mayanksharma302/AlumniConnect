import { Router } from "express";
import {
    sendRequest,
    getReceivedRequests,
    getSentRequests,
    updateRequestStatus
} from "../controllers/mentorship.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const mentorshipRouter = new Router()

mentorshipRouter.use(authMiddleware)

// Send a new request (Student -> Alumni)
mentorshipRouter.post('/send', sendRequest)

// Inbox and Outbox Routes
mentorshipRouter.get('/recieved', getReceivedRequests)
mentorshipRouter.get('/sent', getSentRequests)

// Alumni updates the status (Accept/Decline)
mentorshipRouter.put('/status/:requestId', updateRequestStatus);

export default mentorshipRouter;
