import { Router } from "express";
import {
    registerUser,
    refreshToken,
    logout,
    logoutAll,
    login,
    verifyEmail,
    resendOtp,
    verifyMember
} from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const authRouter = Router();

/**
 * @route POST /api/auth/register
 */
authRouter.post("/register", registerUser);

/**
 * @route GET /api/auth/verify-email
 */
authRouter.get("/verify-email", verifyEmail)

/**
 * @route POST /api/auth/login
 */
authRouter.post("/login", login)

/**
 * @route POST /api/auth/sendOtp
 */
authRouter.post("/sendOtp", resendOtp)

/**
 * @route GET /api/auth/refresh-token
 * @desc Refresh the access token using the refresh token
 * @access Public
 */
authRouter.get("/refresh-token", refreshToken)

/**
 * @route GET /api/auth/logout
 */
authRouter.get("/logout", logout)

/**
 * @route GET /api/auth/logoutall
 */
authRouter.get("/logout-all", logoutAll)

/**
 * @route POST /api/auth/verify-member/:userId
 */
authRouter.post("/verify-member/:userId", authMiddleware, verifyMember)

export default authRouter;
