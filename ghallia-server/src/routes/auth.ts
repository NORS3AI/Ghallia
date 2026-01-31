/**
 * Authentication Routes
 * Handles user registration, login, and account management
 */

import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { userStore, User } from '../data/storage';
import { generateToken, authMiddleware } from '../middleware/auth';

export const authRouter = Router();

const SALT_ROUNDS = 12;

// Validation helpers
function isValidUsername(username: string): boolean {
  return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

/**
 * POST /api/auth/register
 * Register a new user account
 */
authRouter.post('/register', async (req: Request, res: Response) => {
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
    if (userStore.getByUsername(username)) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    if (userStore.getByEmail(email)) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user: User = {
      id: uuidv4(),
      username,
      email: email.toLowerCase(),
      passwordHash,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    userStore.create(user);

    // Generate token
    const token = generateToken({ userId: user.id, username: user.username });

    res.status(201).json({
      message: 'Account created successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

/**
 * POST /api/auth/login
 * Login with username/email and password
 */
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user by username or email
    let user = userStore.getByUsername(username);
    if (!user) {
      user = userStore.getByEmail(username);
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Update last login
    userStore.updateLastLogin(user.id);

    // Generate token
    const token = generateToken({ userId: user.id, username: user.username });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Failed to login' });
  }
});

/**
 * GET /api/auth/me
 * Get current user info (requires authentication)
 */
authRouter.get('/me', authMiddleware, (req: Request, res: Response) => {
  const user = userStore.getById(req.user!.userId);

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
authRouter.post('/refresh', authMiddleware, (req: Request, res: Response) => {
  const token = generateToken({
    userId: req.user!.userId,
    username: req.user!.username
  });

  res.json({ token });
});
