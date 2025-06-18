"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
// Import Message model
const message_1 = __importDefault(require("../../models/message"));
// POST /api/messages - Send a new message
router.post('/', async (req, res) => {
    try {
        const { text, receiverId, senderId } = req.body;
        // Validate required fields
        if (!text || !receiverId || !senderId) {
            return res.status(400).json({
                error: 'Missing required fields: text, receiverId, or senderId'
            });
        }
        // Validate text length
        if (text.trim().length === 0) {
            return res.status(400).json({
                error: 'Message text cannot be empty'
            });
        }
        // Create new message
        const message = await message_1.default.create({
            sender: senderId,
            receiver: receiverId,
            text: text.trim(),
            timestamp: new Date(),
            read: false
        });
        res.status(201).json(message);
    }
    catch (error) {
        console.error('Error creating message:', error);
        res.status(500).json({ error: 'Failed to create message' });
    }
});
// GET /api/messages - Get messages between two users
router.get('/', async (req, res) => {
    try {
        const { userId, currentUserId } = req.query;
        // Validate required parameters
        if (!userId || !currentUserId) {
            return res.status(400).json({
                error: 'Missing required parameters: userId or currentUserId'
            });
        }
        // Find messages where either user is sender or receiver
        const messages = await message_1.default.find({
            $or: [
                { sender: currentUserId, receiver: userId },
                { sender: userId, receiver: currentUserId }
            ]
        })
            .sort({ timestamp: 1 })
            .populate('sender', 'name email')
            .populate('receiver', 'name email');
        // Mark messages as read
        await message_1.default.updateMany({
            sender: userId,
            receiver: currentUserId,
            read: false
        }, { read: true });
        res.json(messages);
    }
    catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});
exports.default = router;
//# sourceMappingURL=route.js.map