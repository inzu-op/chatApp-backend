import express from 'express';
import mongoose from 'mongoose';
import User from '../../../models/User';

const router = express.Router();

// POST /api/users/add-chat - Add user to chat list
router.post('/', async (req, res) => {
  try {
    const { userId, targetUserId } = req.body;

    if (!userId || !targetUserId) {
      return res.status(400).json({ error: 'Both userId and targetUserId are required' });
    }

    // Validate both users exist
    const [currentUser, targetUser] = await Promise.all([
      User.findById(userId),
      User.findById(targetUserId)
    ]);

    if (!currentUser || !targetUser) {
      return res.status(404).json({ error: 'One or both users not found' });
    }

    // Check if user is trying to add themselves
    if (userId === targetUserId) {
      return res.status(400).json({ error: 'Cannot add yourself to chat' });
    }

    // Check if user is already in chat list
    const isAlreadyAdded = currentUser.chatUsers?.some(
      (chatUser: any) => chatUser.userId.toString() === targetUserId
    );

    if (isAlreadyAdded) {
      return res.status(400).json({ error: 'User is already in your chat list' });
    }

    // Add target user to current user's chat list
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          chatUsers: {
            userId: new mongoose.Types.ObjectId(targetUserId),
            addedAt: new Date()
          }
        }
      },
      { new: true }
    ).populate('chatUsers.userId', 'name email');

    if (!updatedUser) {
      return res.status(500).json({ error: 'Failed to update user' });
    }

    // Transform the data to match the expected format
    const chatUsers = updatedUser.chatUsers.map((chatUser: any) => ({
      id: chatUser.userId._id.toString(),
      name: chatUser.userId.name,
      email: chatUser.userId.email,
      addedAt: chatUser.addedAt
    }));

    res.json(chatUsers);
  } catch (error) {
    console.error('Error adding chat user:', error);
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    res.status(500).json({ error: 'Failed to add chat user' });
  }
});

export default router; 