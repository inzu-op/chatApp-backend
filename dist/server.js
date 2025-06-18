"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const mongoose_1 = __importDefault(require("mongoose"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*", // Allow all origins for development
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
});
// Middleware
app.use((0, cors_1.default)({
    origin: "*", // Allow all origins for development
    credentials: true
}));
app.use(express_1.default.json());
// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'ChatApp Backend API is running!' });
});
// Import routes
const route_1 = __importDefault(require("./routes/users/route"));
const route_2 = __importDefault(require("./routes/messages/route"));
const route_3 = __importDefault(require("./routes/auth/route"));
const route_4 = __importDefault(require("./routes/messages/clear/route"));
// Import user sub-routes
const route_5 = __importDefault(require("./routes/users/[id]/route"));
const route_6 = __importDefault(require("./routes/users/add-chat/route"));
const route_7 = __importDefault(require("./routes/users/all/route"));
const route_8 = __importDefault(require("./routes/users/chat-users/route"));
const route_9 = __importDefault(require("./routes/users/remove-chat/route"));
const route_10 = __importDefault(require("./routes/users/search/route"));
// Use routes
app.use('/api/auth', route_3.default);
app.use('/api/users', route_1.default);
app.use('/api/messages', route_2.default);
app.use('/api/messages/clear', route_4.default);
// Use user sub-routes
app.use('/api/users', route_5.default);
app.use('/api/users/add-chat', route_6.default);
app.use('/api/users/all', route_7.default);
app.use('/api/users/chat-users', route_8.default);
app.use('/api/users/remove-chat', route_9.default);
app.use('/api/users/search', route_10.default);
// Socket.io connection
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
    // Handle chat messages
    socket.on('send_message', (data) => {
        console.log('Message received:', data);
        socket.broadcast.emit('receive_message', data);
    });
    // Handle typing indicators
    socket.on('typing', (data) => {
        socket.broadcast.emit('user_typing', data);
    });
    // Handle join/leave chat rooms
    socket.on('join-chat', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined chat`);
    });
    socket.on('leave-chat', (userId) => {
        socket.leave(userId);
        console.log(`User ${userId} left chat`);
    });
});
// MongoDB connection
mongoose_1.default.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/chatapp')
    .then(() => {
    console.log('MongoDB connected!');
})
    .catch((err) => {
    console.error('MongoDB connection error:', err);
});
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
//# sourceMappingURL=server.js.map