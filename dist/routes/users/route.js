"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const router = express_1.default.Router();
// Import User model (we'll create this)
const User_1 = __importDefault(require("../../models/User"));
// GET /api/users - Get current user's chat users
router.get('/', async (req, res) => {
    try {
        // TODO: Add authentication middleware
        const userId = req.user?.id; // This will come from auth middleware
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        // Get the current user with populated chatUsers
        const currentUser = await User_1.default.findById(userId)
            .populate({
            path: 'chatUsers.userId',
            select: 'name email'
        });
        if (!currentUser) {
            return res.status(404).json({ error: "User not found" });
        }
        // Transform the chatUsers array to include pinned status
        const users = currentUser.chatUsers.map((chatUser) => ({
            _id: chatUser.userId._id,
            name: chatUser.userId.name,
            email: chatUser.userId.email,
            pinned: chatUser.pinned,
            addedAt: chatUser.addedAt
        }));
        // Sort users: pinned first, then by addedAt
        const sortedUsers = users.sort((a, b) => {
            if (a.pinned && !b.pinned)
                return -1;
            if (!a.pinned && b.pinned)
                return 1;
            return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
        });
        res.json(sortedUsers);
    }
    catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Failed to fetch users" });
    }
});
// POST /api/users - Create new user (signup)
router.post('/', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        // Check if user already exists
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // Create new user
        const user = await User_1.default.create({
            name,
            email,
            password: hashedPassword,
        });
        // Transform and return user without password
        const transformedUser = {
            id: user._id.toString(),
            name: user.name,
            email: user.email
        };
        res.status(201).json(transformedUser);
    }
    catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});
// GET /api/users/all - Get all users (for search)
router.get('/all', async (req, res) => {
    try {
        const users = await User_1.default.find({}).select("-password");
        res.json(users);
    }
    catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Failed to fetch users" });
    }
});
exports.default = router;
//# sourceMappingURL=route.js.map