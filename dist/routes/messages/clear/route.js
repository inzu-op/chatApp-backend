"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const message_1 = __importDefault(require("../../../models/message"));
const router = express_1.default.Router();
// POST /api/messages/clear - Clear messages between two users
router.post('/', async (req, res) => {
    try {
        // await connectDB();
        const { userId, targetUserId } = req.body;
        if (!userId || !targetUserId) {
            return res.status(400).json({ error: "Both userId and targetUserId are required" });
        }
        await message_1.default.deleteMany({
            $or: [
                { sender: userId, receiver: targetUserId },
                { sender: targetUserId, receiver: userId }
            ]
        });
        return res.status(200).json({ success: true });
    }
    catch (error) {
        console.error("Error clearing messages:", error);
        return res.status(500).json({ error: "Failed to clear messages" });
    }
});
exports.default = router;
//# sourceMappingURL=route.js.map