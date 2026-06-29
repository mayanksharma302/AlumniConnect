import nodemailer from 'nodemailer';
import config from '../config/config.js';
import { text } from 'express';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'oauth2',
        user: config.GOOGLE_USER,
        clientId: config.GOOGLE_CLIENT,
        clientSecret: config.GOOGLE_CLIENT_SECRET,
        refreshToken: config.GOOGLE_REFRESH_TOKEN
    }
})

// Verify the connection credentials
transporter.verify((error, success) => {
    if (error) {
        console.error("Error connecting to email server:", error)
    } else {
        console.log("Email server is ready to send message")
    }
})

const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"Your Name": <${config.GOOGLE_USER}>`,
            to,
            subject,
            text,
            html
        });

        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

export {sendEmail};