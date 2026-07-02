import {createProfile, getProfile} from '../controllers/profile.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import { Router } from 'express';

const profileRouter = Router();

/**
 * @route POST /api/profile/create-profile
 */
profileRouter.post('/create-profile', authMiddleware, createProfile);

/**
 * @route GET /api/profile/get-profile
 */
profileRouter.get('/get-profile', authMiddleware, getProfile);

export default profileRouter;