import express, { json } from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import config from "./config/config.js";
import authRouter from "./routes/auth.routes.js";
import profileRouter from "./routes/profile.routes.js";
import mentorshipRouter from "./routes/mentorship.routes.js";
import messageRouter from "./routes/message.route.js";
import jobRouter from "./routes/job.routes.js";
import eventRouter from "./routes/event.route.js";
import { app, server } from "./services/socket.service.js";

// Configuaration for cross origin resource sharing
app.use(cors({
    origin: config.CORS_ORIGIN,
    credentials: true,
}))
// Configuration for accepting cookies
app.use(cookieParser())
// Configuration for accepting the data from forms
app.use(express.json());
// Configuration for accepting the data from URL
app.use(express.urlencoded({ extended: true }));
// Configuration for to store assets in public folder
app.use(express.static("public"));
// Configuration for logging the requests
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);
app.use("/api/mentorship", mentorshipRouter)
app.use("/api/messages", messageRouter)
app.use("/api/jobs", jobRouter)
app.use("/api/events", eventRouter)

export { app };