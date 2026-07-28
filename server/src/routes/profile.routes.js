import {
    createProfile,
    getProfile,
    setProfileImage,
    updateProfile,
    addEducation,
    updateEducation,
    deleteEducation,
    addExperience,
    updateExperience,
    deleteExperience,
    addSkill,
    removeSkill,
    getProfileByUserId,
    getAlumniDirectory
} from '../controllers/profile.controller.js';
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

/**
 * @route PUT /api/profile/update-profile
 */
profileRouter.put('/update-profile', authMiddleware, updateProfile);

/**
 * @route POST /api/profile/add-education
 */
profileRouter.post('/add-education', authMiddleware, addEducation);

/**
 * @route PUT /api/profile/update-education/:eduId
 */
profileRouter.put('/update-education/:eduId', authMiddleware, updateEducation);

/**
 * @route DELETE /api/profile/delete-education/:eduId
 */
profileRouter.delete('/delete-education/:eduId', authMiddleware, deleteEducation);

/**
 * @route POST /api/profile/add-experience
 */
profileRouter.post('/add-experience', authMiddleware, addExperience);

/**
 * @route PUT /api/profile/update-experience/:expId
 */
profileRouter.put('/update-experience/:expId', authMiddleware, updateExperience);

/**
 * @route DELETE /api/profile/delete-experience/:expId
 */
profileRouter.delete('/delete-experience/:expId', authMiddleware, deleteExperience);

/**
 * @route POST /api/profile/add-skill
 */
profileRouter.post('/add-skill', authMiddleware, addSkill);

/**
 * @route DELETE /api/profile/remove-skill/:skill
 */
profileRouter.delete('/remove-skill/:skill', authMiddleware, removeSkill);

/**
 * @route GET /api/profile/get-profile/:userId
 */
profileRouter.get('/get-profile/:userId', authMiddleware, getProfileByUserId);

/**
 * @route GET /api/profile/alumni-directory
 */
profileRouter.get('/alumni-directory', authMiddleware, getAlumniDirectory);

export default profileRouter;