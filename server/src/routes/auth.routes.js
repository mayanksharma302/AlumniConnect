import { Router } from "express";
import { registerUser, refreshToken, logout, logoutAll, login, verifyEmail } from "../controllers/auth.controller.js";

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
authRouter.post("/login",login)

/**
 * @route GET /api/auth/refresh-token
 * @desc Refresh the access token using the refresh token
 * @access Public
 */
authRouter.get("/refresh-token", refreshToken)

/**
 * @route GET /api/auth/logout
 */
authRouter.get("/logout",logout)

/**
 * @route GET /api/auth/logoutall
 */
authRouter.get("/logout-all", logoutAll)

export default authRouter;
