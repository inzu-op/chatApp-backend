import express from 'express';
import mongoose from 'mongoose';
import User from '../../../models/User';

const router = express.Router();

// POST /api/users/remove-chat - Remove user from chat list
router.post('/', async (req, res) => {
  try {
    const { userId, targetUserId } = req.body;
    console.log('Removing chat user:', { userId, targetUserId });

    if (!userId || !targetUserId) {
      console.log('Missing required fields:', { userId, targetUserId });
      return res.status(400).json({ error: "Both user IDs are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(targetUserId)) {
      console.log('Invalid ObjectId format:', { userId, targetUserId });
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    // Convert string IDs to ObjectIds
    const currentUserId = new mongoose.Types.ObjectId(userId);
    const targetUserObjectId = new mongoose.Types.ObjectId(targetUserId);

    // Remove target user from current user's chatUsers
    const currentUser = await User.findByIdAndUpdate(
      currentUserId,
      { $pull: { chatUsers: { userId: targetUserObjectId } } },
      { new: true }
    ).populate('chatUsers.userId', 'name email');

    if (!currentUser) {
      console.log('Current user not found:', userId);
      return res.status(404).json({ error: "Current user not found" });
    }

    // Remove current user from target user's chatUsers (reciprocal removal)
    const targetUser = await User.findByIdAndUpdate(
      targetUserObjectId,
      { $pull: { chatUsers: { userId: currentUserId } } },
      { new: true }
    );

    if (!targetUser) {
      console.log('Target user not found:', targetUserId);
      // Continue anyway since the main operation succeeded
    }

    console.log('Successfully removed chat users');
    
    // Transform the data to match the expected format
    const chatUsers = currentUser.chatUsers.map((chatUser: any) => ({
      _id: chatUser.userId._id.toString(),
      id: chatUser.userId._id.toString(),
      name: chatUser.userId.name,
      email: chatUser.userId.email,
      addedAt: chatUser.addedAt,
      pinned: chatUser.pinned || false
    }));

    res.json({
      success: true,
      chatUsers
    });
  } catch (error) {
    console.error('Error in remove-chat API:', error);
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }
    res.status(500).json({ error: "Failed to remove user from chat" });
  }
});

export default router;
