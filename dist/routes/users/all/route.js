"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_1 = __importDefault(require("../../../models/User"));
const router = express_1.default.Router();
// GET /api/users/all - Get all users
router.get('/', async (req, res) => {
    try {
        const users = await User_1.default.find({}, { password: 0 });
        // Transform the data to match the expected format
        const transformedUsers = users.map((user) => ({
            id: user._id.toString(),
            name: user.name,
            email: user.email
        }));
        res.json(transformedUsers);
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});
exports.default = router;
//# sourceMappingURL=route.js.map