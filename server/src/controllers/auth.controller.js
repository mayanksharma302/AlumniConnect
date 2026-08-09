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

const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await userModel.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const otp = generateOtp();
        const html = getOtpHtml(otp);
        const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

        await otps.create({
            user: user._id,
            email: user.email,
            otpHash
        });

        await sendEmail(user.email, "OTP Verification", `Your OTP code is ${otp}`, html);

        return res.status(200).json({
            message: "A fresh verification code has been sent."
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error while resending OTP",
            error: error.message
        });
    }
}

async function sendOtp(user) {
    const otp = generateOtp();
    const html = getOtpHtml(otp);

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    await otps.create({
        user: user._id,
        email: user.email,
        otpHash
    })

    await sendEmail(user.email, "OTP Verification", `Your OTP code is ${otp}`, html);
}

const registerUser = async (req, res) => {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
        res.status(401).json({
            message: "One or more fields are missing"
        })
    }

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

    sendOtp(user);

    res.status(201).json({
        message: "User registered successfully",
        user,
    });

}

const login = async (req, res) => {
    const { identifier, password } = req.body;

    if (!identifier && !password) {
        return res.status(400).json({
            message: "Email-Username & Password is required"
        })
    }

    const user = await userModel.findOne({
        $or: [
            {
                email: identifier.toLowerCase()
            },
            {
                username: identifier
            }
        ]
    })

    if (!user) {
        return res.status(401).json({
            message: "Invalid email-username or Password"
        })
    }

    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");

    const isPasswordValid = hashedPassword == user.password

    if (!isPasswordValid) {
        return res.status(401).json({
            message: "Invalid email-username or password"
        })
    }

    if (!user.emailVerified) {
        const isOtpPresent = await otps.findOne({
            user: user._id,
        })

        if (!isOtpPresent) {
            sendOtp(user)
        }

        console.log({
            email: user.email,
            message: "Email is not verified",
        });

        return res.status(400).json({
            message: "Email is not verified",
            user: user,
        })
    }

    const refreshToken = jwt.sign({
        id: user._id,
    }, config.JWT_SECRET, {
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
    }, config.JWT_SECRET, {
        expiresIn: "15min"
    })

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })
    res.status(200).json({
        message: "logged in successfully",
        user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
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
    const { otp, email } = req.query;

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    const otpDoc = await otps.findOne({
        email,
        otpHash
    })

    if (!otpDoc) {
        res.status(401).json({
            message: "Invalid OTP"
        })
    }

    const user = await userModel.findByIdAndUpdate(otpDoc.user, {
        emailVerified: true,
        AccountStatus: 'verified'
    })

    await otps.deleteMany({
        user: otpDoc.user
    })

    return res.status(200).json({
        message: "Email Verified Successfully",
        user: {
            username: user.username,
            email: user.email,
            emailVerified: user.emailVerified,
            AccountStatus: user.AccountStatus
        }
    })

}

const verifyMember = async (req, res) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can verify members.' });
        }

        const { userId } = req.params;
        const targetUser = await userModel.findById(userId);

        if (!targetUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        targetUser.AccountStatus = 'verified';
        targetUser.emailVerified = true;
        await targetUser.save();

        return res.status(200).json({
            message: 'Member verified successfully.',
            user: {
                _id: targetUser._id,
                username: targetUser.username,
                email: targetUser.email,
                AccountStatus: targetUser.AccountStatus,
                emailVerified: targetUser.emailVerified
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error while verifying member',
            error: error.message
        });
    }
};

export { registerUser, refreshToken, logout, logoutAll, login, verifyEmail, resendOtp, verifyMember };