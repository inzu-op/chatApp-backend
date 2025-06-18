"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.login = exports.signup = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
// JWT Secret - should come from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
// Hash password
const hashPassword = async (password) => {
    return await bcryptjs_1.default.hash(password, 10);
};
// Verify password
const verifyPassword = async (password, hashedPassword) => {
    return await bcryptjs_1.default.compare(password, hashedPassword);
};
// Generate JWT token
const generateToken = (userId) => {
    return jsonwebtoken_1.default.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
};
// Signup handler
const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters" });
        }
        // Check if user already exists
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists with this email" });
        }
        const hashedPassword = await hashPassword(password);
        const user = await User_1.default.create({
            name,
            email,
            password: hashedPassword,
        });
        const token = generateToken(user._id.toString());
        // Set cookie
        res.cookie('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        // Return user data (without password)
        const userResponse = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            token
        };
        res.status(201).json(userResponse);
    }
    catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ error: "Something went wrong. Please try again." });
    }
};
exports.signup = signup;
// Login handler
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }
        const user = await User_1.default.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        const isValidPassword = await verifyPassword(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        const token = generateToken(user._id.toString());
        // Set cookie
        res.cookie('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        // Return user data (without password)
        const userResponse = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            token
        };
        res.json(userResponse);
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Something went wrong. Please try again." });
    }
};
exports.login = login;
// Logout handler
const logout = async (req, res) => {
    try {
        // Clear the auth cookie
        res.clearCookie('auth-token');
        res.json({ message: "Logged out successfully" });
    }
    catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
};
exports.logout = logout;
//# sourceMappingURL=auth.js.map