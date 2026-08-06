import { Router } from "express";
import {
    createJob,
    getAllJobs,
    getMyJobs,
    deleteJob
} from "../controllers/job.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const jobRouter = new Router()

jobRouter.use(authMiddleware)

// Get the main job board feed
jobRouter.get('/', getAllJobs)

// Get jobs managed by the logged-in user
jobRouter.get('/my-jobs', getMyJobs);

// Post a new job
jobRouter.post('/create', createJob);

// Delete a specific job
jobRouter.delete('/:jobId', deleteJob);

export default jobRouter;