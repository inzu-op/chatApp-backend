"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_1 = __importDefault(require("../../../models/User"));
const router = express_1.default.Router();
// GET /api/users/search - Search users by name
router.get('/', async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ error: 'Search query is required' });
        }
        // Search users by exact name match
        const users = await User_1.default.find({
            name: query
        }).select('-password');
        // Transform the data to match the expected format
        const transformedUsers = users.map((user) => ({
            id: user._id.toString(),
            name: user.name,
            email: user.email
        }));
        res.json(transformedUsers);
    }
    catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ error: 'Failed to search users' });
    }
});
exports.default = router;
//# sourceMappingURL=route.js.map