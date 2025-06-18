import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: "*", 
  credentials: true
}));
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'ChatApp Backend API is running!' });
});

// Import routes
import userRoutes from './routes/users/route';
import messageRoutes from './routes/messages/route';
import authRoutes from './routes/auth/route';
import clearMessagesRoute from './routes/messages/clear/route';

// Import user sub-routes
import userByIdRoute from './routes/users/[id]/route';
import addChatRoute from './routes/users/add-chat/route';
import allUsersRoute from './routes/users/all/route';
import chatUsersRoute from './routes/users/chat-users/route';
import removeChatRoute from './routes/users/remove-chat/route';
import searchUsersRoute from './routes/users/search/route';

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/messages/clear', clearMessagesRoute);

// Use user sub-routes
app.use('/api/users', userByIdRoute);
app.use('/api/users/add-chat', addChatRoute);
app.use('/api/users/all', allUsersRoute);
app.use('/api/users/chat-users', chatUsersRoute);
app.use('/api/users/remove-chat', removeChatRoute);
app.use('/api/users/search', searchUsersRoute);

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
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/chatapp')
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