import { Server } from 'socket.io';
import http from 'http';
import express from 'express';
import config from '../config/config.js'; // Import your config if needed for CORS

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: config.CORS_ORIGIN,
        methods: ["GET", "POST"]
    }
});

// This object keeps track of who is online. 
// Format: { "mongodb_user_id": "socket_io_connection_id" }
const userSocketMap = {};

const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId];
};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    const userId = socket.handshake.query.userId;
    if (userId !== "undefined") {
        userSocketMap[userId] = socket.id;
    }

    // Instantly tell everyone who is online
    io.emit('getOnlineUsers', Object.keys(userSocketMap));

    // Handle typing indicators (Fire and Forget)
    socket.on('typing', ({ senderId, receiverId }) => {
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('userTyping', { senderId });
        }
    });

    socket.on('stopTyping', ({ senderId, receiverId }) => {
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('userStoppedTyping', { senderId });
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        delete userSocketMap[userId];
        io.emit('getOnlineUsers', Object.keys(userSocketMap));
    });
});

export { app, io, server, getReceiverSocketId };