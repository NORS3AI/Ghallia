"use strict";
/**
 * Authentication Routes
 * Handles user registration, login, and account management
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const uuid_1 = require("uuid");
const storage_1 = require("../data/storage");
const auth_1 = require("../middleware/auth");
exports.authRouter = (0, express_1.Router)();
const SALT_ROUNDS = 12;
// Validation helpers
function isValidUsername(username) {
    return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function isValidPassword(password) {
    return password.length >= 8;
}
/**
 * POST /api/auth/register
 * Register a new user account
 */
exports.authRouter.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are required' });
        }
        if (!isValidUsername(username)) {
            return res.status(400).json({ error: 'Username must be 3-20 characters, alphanumeric and underscores only' });
        }
        if (!isValidEmail(email)) {
            return res.status(400).json({ error: 'Invalid email address' });
        }
        if (!isValidPassword(password)) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }
        // Check if username or email already exists
        if (storage_1.userStore.getByUsername(username)) {
            return res.status(409).json({ error: 'Username already taken' });
        }
        if (storage_1.userStore.getByEmail(email)) {
            return res.status(409).json({ error: 'Email already registered' });
        }
        // Hash password
        const passwordHash = await bcrypt_1.default.hash(password, SALT_ROUNDS);
        // Create user
        const user = {
            id: (0, uuid_1.v4)(),
            username,
            email: email.toLowerCase(),
            passwordHash,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
        };
        storage_1.userStore.create(user);
        // Generate token
        const token = (0, auth_1.generateToken)({ userId: user.id, username: user.username });
        res.status(201).json({
            message: 'Account created successfully',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
            },
            token,
        });
    }
    catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Failed to create account' });
    }
});
/**
 * POST /api/auth/login
 * Login with username/email and password
 */
exports.authRouter.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }
        // Find user by username or email
        let user = storage_1.userStore.getByUsername(username);
        if (!user) {
            user = storage_1.userStore.getByEmail(username);
        }
        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        // Verify password
        const isValid = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        // Update last login
        storage_1.userStore.updateLastLogin(user.id);
        // Generate token
        const token = (0, auth_1.generateToken)({ userId: user.id, username: user.username });
        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
            },
            token,
        });
    }
    catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Failed to login' });
    }
});
/**
 * GET /api/auth/me
 * Get current user info (requires authentication)
 */
exports.authRouter.get('/me', auth_1.authMiddleware, (req, res) => {
    const user = storage_1.userStore.getById(req.user.userId);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.json({
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
        },
    });
});
/**
 * POST /api/auth/refresh
 * Refresh authentication token
 */
exports.authRouter.post('/refresh', auth_1.authMiddleware, (req, res) => {
    const token = (0, auth_1.generateToken)({
        userId: req.user.userId,
        username: req.user.username
    });
    res.json({ token });
});
//# sourceMappingURL=auth.js.map