import express from 'express';
import User from '../../../models/User';

const router = express.Router();

// GET /api/users/chat-users - Get user's chat users
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;

    console.log('Received request for userId:', userId);

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Find the current user and populate their chat users
    const user = await User.findById(userId).populate('chatUsers.userId', 'name email');
    
    if (!user) {
      console.log('User not found for ID:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Found user:', user.name, 'with chat users:', user.chatUsers);

    // Transform the data to match the expected format
    const chatUsers = user.chatUsers.map((chatUser: any) => {
      const userData = {
        _id: chatUser.userId._id.toString(),
        name: chatUser.userId.name,
        email: chatUser.userId.email,
        addedAt: chatUser.addedAt
      };
      console.log('Transformed user data:', userData);
      return userData;
    });

    console.log('Sending chat users:', chatUsers);
    res.json(chatUsers);
  } catch (error) {
    console.error('Error in chat-users API:', error);
    res.status(500).json({ error: 'Failed to fetch chat users' });
  }
});

export default router; 