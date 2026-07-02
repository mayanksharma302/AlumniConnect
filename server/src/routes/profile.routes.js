import {createProfile, getProfile, setProfileImage} from '../controllers/profile.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';
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

/**
 * @route POST /api/profile/set-profile-image
 */
profileRouter.post('/set-profile-image', authMiddleware, upload.single('profileImage'), setProfileImage);

export default profileRouter;