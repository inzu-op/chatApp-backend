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

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Set up Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// Make io available globally
declare global {
  // eslint-disable-next-line no-var
  var io: Server;
}
global.io = io;

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
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

// Use user sub-routes - specific routes first, then dynamic routes
app.use('/api/users/add-chat', addChatRoute);
app.use('/api/users/all', allUsersRoute);
app.use('/api/users/chat-users', chatUsersRoute);
app.use('/api/users/remove-chat', removeChatRoute);
app.use('/api/users/search', searchUsersRoute);
app.use('/api/users', userByIdRoute); // Dynamic route last

// Socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  const userId = socket.handshake.query.userId as string;

  if (userId) {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);

    // Broadcast user online status
    socket.broadcast.emit('user-status-change', {
      userId: userId,
      isOnline: true,
    });
  }

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    if (userId) {
      // Broadcast user offline status
      socket.broadcast.emit('user-status-change', {
        userId: userId,
        isOnline: false,
      });
    }
  });

  // Typing indicators
  socket.on('typing', (data) => {
    console.log('Typing indicator:', data);
    socket.to(data.receiverId).emit('typing', {
      userId: data.userId,
      receiverId: data.receiverId,
    });
  });

  // Join/leave chat rooms
  socket.on('join-chat', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined chat room`);
  });

  socket.on('leave-chat', (userId) => {
    socket.leave(userId);
    console.log(`User ${userId} left chat room`);
  });

  // Chat user updates
  socket.on('chat-users-updated', (data) => {
    console.log('Chat users updated for user:', data.userId);
    socket.to(data.userId).emit('chat-users-updated', data);
  });

  // User status updates
  socket.on('user-status-change', (data) => {
    console.log('User status change:', data);
    socket.broadcast.emit('user-status-change', data);
  });
});

// MongoDB connection and server start
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || '';

if (!MONGO_URI) {
  console.error('MONGO_URI is not defined in environment variables.');
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected!');
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
