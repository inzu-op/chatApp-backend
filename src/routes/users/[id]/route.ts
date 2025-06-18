import express from 'express';
import mongoose from 'mongoose';
import User from '../../../models/User';

const router = express.Router();

// GET /api/users/:id - Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Fetching user with ID:', id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error('Invalid user ID format:', id);
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    const user = await User.findById(id, { password: 0 });
    
    if (!user) {
      console.error('User not found with ID:', id);
      return res.status(404).json({ error: 'User not found' });
    }

    // Transform the data to match the expected format
    const userData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email
    };

    console.log('Sending user data:', userData);
    res.json(userData);
  } catch (error) {
    console.error('Error in user API:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router; 