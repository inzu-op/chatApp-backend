"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const socket_io_1 = require("socket.io");
exports.config = {
    api: {
        bodyParser: false,
    },
};
const ioHandler = (req, res) => {
    if (!res.socket.server.io) {
        console.log('Initializing Socket.IO server...');
        const io = new socket_io_1.Server(res.socket.server, {
            path: '/api/socket',
            addTrailingSlash: false,
            cors: {
                origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
                methods: ['GET', 'POST'],
                credentials: true,
            },
            transports: ['polling', 'websocket'],
            pingTimeout: 60000,
            pingInterval: 25000,
        });
        io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);
            socket.on('join-chat', (userId) => {
                socket.join(userId);
                console.log(`User ${userId} joined chat`);
            });
            socket.on('leave-chat', (userId) => {
                socket.leave(userId);
                console.log(`User ${userId} left chat`);
            });
            socket.on('send-message', (data) => {
                const { senderId, receiverId, text, timestamp } = data;
                io.to(receiverId).emit('new-message', {
                    senderId,
                    receiverId,
                    text,
                    timestamp,
                });
            });
            socket.on('typing', (data) => {
                const { userId, receiverId } = data;
                io.to(receiverId).emit('typing', { userId });
            });
            socket.on('disconnect', (reason) => {
                console.log('Client disconnected:', socket.id, reason);
            });
            socket.on('error', (error) => {
                console.error('Socket error:', error);
            });
        });
        res.socket.server.io = io;
    }
    else {
        console.log('Socket.IO server already running');
    }
    res.end();
};
exports.default = ioHandler;
//# sourceMappingURL=socket.js.map