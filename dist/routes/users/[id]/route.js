"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../../../models/User"));
const router = express_1.default.Router();
// GET /api/users/:id - Get user by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Fetching user with ID:', id);
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            console.error('Invalid user ID format:', id);
            return res.status(400).json({ error: 'Invalid user ID format' });
        }
        const user = await User_1.default.findById(id, { password: 0 });
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
    }
    catch (error) {
        console.error('Error in user API:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});
exports.default = router;
//# sourceMappingURL=route.js.map