import express from 'express';
import User from '../../../models/User';

const router = express.Router();

// GET /api/users/search - Search users by name
router.get('/', async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Search users by exact name match
    const users = await User.find({
      name: query
    }).select('-password');

    // Transform the data to match the expected format
    const transformedUsers = users.map((user: any) => ({
      _id: user._id.toString(),
      name: user.name,
      email: user.email
    }));

    res.json(transformedUsers);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

export default router; 