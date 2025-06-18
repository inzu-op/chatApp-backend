import express from 'express';
import User from '../../../models/User';

const router = express.Router();

// GET /api/users/all - Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 });
    
    // Transform the data to match the expected format
    const transformedUsers = users.map((user: any) => ({
      _id: user._id.toString(),
      name: user.name,
      email: user.email
    }));

    res.json(transformedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router; 