import express from "express";
import { Request, Response } from "express";
import Message from "../../../models/message";

const router = express.Router();

// POST /api/messages/clear - Clear messages between two users
router.post('/', async (req: Request, res: Response) => {
  try {
    // await connectDB();

    const { userId, targetUserId } = req.body;

    if (!userId || !targetUserId) {
      return res.status(400).json({ error: "Both userId and targetUserId are required" });
    }

    await Message.deleteMany({
      $or: [
        { sender: userId, receiver: targetUserId },
        { sender: targetUserId, receiver: userId }
      ]
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error clearing messages:", error);
    return res.status(500).json({ error: "Failed to clear messages" });
  }
});

export default router;
