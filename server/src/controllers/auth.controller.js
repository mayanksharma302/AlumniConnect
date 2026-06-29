import userModel from "../models/user.model.js";
import sessionModel from "../models/session.model.js";
import otps from "../models/otp.model.js";
import config from "../config/config.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import Session from "../models/session.model.js";
import { sendEmail } from "../services/email.service.js";
import { generateOtp, getOtpHtml } from "../utils/utils.js";


const registerUser = async (req, res) => {
    const { username, email, password, role } = req.body;

    const isAlreadyRegistered = await userModel.findOne({
        $or: [
            { username },
            { email }
        ]
    })

    if (isAlreadyRegistered) {
        res.status(400).json({
            message: "Username or email already exists"
        });
    }

    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");

    const user = await userModel.create({
        username,
        email,
        password: hashedPassword,
        role,
        AccountStatus: "unverified"
    })

    const otp = generateOtp();
    const html = getOtpHtml(otp);

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    await otps.create({
        user: user._id,
        email,
        otpHash
    })

    await sendEmail(email,"OTP Verification", `Your OTP code is ${otp}`, html);

    res.status(201).json({
        message: "User registered successfully",
        user,
    });

}

const login = async (req, res) => {
    const {email, password} = req.body;

    if(!email && !password){
        res.status(400).json({
            message: "Email & Password is requires"
        })
    }

    const user = await userModel.findOne({
        email
    })

    if(!user){
        res.status(401).json({
            message: "Invalid email or Password"
        })
    }

    if(!user.emailVerified){
        return res.status(401).json({
            message: "Email is not verified"
        })
    }

    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");

    const isPasswordValid = hashedPassword == user.password

    if(!isPasswordValid){
        res.status(401).json({
            message: "Invalid email or password"
        })
    }

    const refreshToken = jwt.sign({
        id: user._id,
    }, config.JWT_SECRET,{
        expiresIn: "7d"
    })

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    const session = await sessionModel.create({
        user: user._id,
        refreshTokenHash,
        ip: req.ip,
        userAgent: req.headers["user-agent"]
    })

    const accessToken = jwt.sign({
        user: user._id,
        sessionId: session._id
    },config.JWT_SECRET,{
        expiresIn: "15min"
    })

    res.cookie("refreshToken",refreshToken,{
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })
    res.status(200).json({
        message: "logged in successfully",
        user: {
            username: user.username,
            email: user.email
        },
        accessToken
    })
}

const refreshToken = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({
            message: "Refresh token not found"
        })
    }

    const decoded = jwt.verify(refreshToken, config.JWT_SECRET);

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    const session = await Session.findOne({
        refreshTokenHash,
        revoked: false
    })

    if (!session) {
        return res.status(401).json({
            message: "Invalid refresh token"
        })
    }

    const accessToken = jwt.sign({
        id: decoded.id,
    }, config.JWT_SECRET, {
        expiresIn: "15m"
    })

    const newRefreshToken = jwt.sign({
        id: decoded.id
    }, config.JWT_SECRET, {
        expiresIn: "7d"
    })

    const newRefreshTokenHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex");

    session.refreshTokenHash = newRefreshTokenHash
    await session.save();

    res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    res.status(200).json({
        message: "Access Token refreshed succesfully",
        accessToken
    })

}

const logout = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(400).json({
            message: "Refresh token not found"
        })
    }

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    const session = await Session.findOne({
        refreshTokenHash,
        revoked: false
    })

    if (!session) {
        return status(400).json({
            message: "Invalid Refresh token"
        })
    }

    session.revoked = true;
    await session.save();

    res.clearCookie("refreshToken")

    res.status(200).json({
        message: "Logged out successfully"
    })
}

const logoutAll = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        res.status(400).json({
            message: "Refresh token not found"
        })
    }

    const decoded = jwt.verify(refreshToken, config.JWT_SECRET)

    await sessionModel.updateMany({
        user: decoded._id,
        revoked: false
    }, {
        revoked: true
    })

    res.clearCookie("refreshToken")
    res.status(200).json({
        message: "Loggged out from all device successfully"
    })
}

const verifyEmail = async (req, res) => {
    const { otp, email} = req.body;

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    const otpDoc = await otps.findOne({
        email,
        otpHash
    })

    if(!otpDoc){
        res.status(401).json({
            message: "Invalid OTP"
        })
    }

    const user = await userModel.findByIdAndUpdate(otpDoc.user,{
        emailVerified: true
    })

    await otps.deleteMany({
        user: otpDoc.user
    })

    return res.status(200).json({
        message: "Email Verified Successfully",
        user: {
            username: user.username,
            email: user.email,
            emailVerified: user.emailVerified
        }
    })

}



export { registerUser, refreshToken, logout, logoutAll, login, verifyEmail };