const express = require('express');
const { z } = require('zod');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User } = require('../models');
const { authenticate } = require('../middleware/auth');
const env = require('../config/env');

const router = express.Router();

const signupSchema = z.object({
  name: z.string().min(1, 'Name is required').max(80, 'Name cannot exceed 80 characters').trim(),
  email: z.string().email('Please enter a valid email address').trim().toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100)
});

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address').trim().toLowerCase(),
  password: z.string().min(1, 'Password is required')
});

/**
 * POST /api/auth/signup
 * Public registration for Citizens ONLY.
 * Collector and Admin roles can NEVER be created through public signup.
 */
router.post('/signup', async (req, res, next) => {
  try {
    // Fail-closed check if someone attempts to bypass in production
    if (env.NODE_ENV === 'production') {
      // In production, user signup goes through Cognito Hosted UI / User Pool
      return res.status(501).json({ error: 'Public API signup is handled by Amazon Cognito User Pool in production' });
    }

    const parseResult = signupSchema.safeParse(req.body);
    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || 'Invalid registration details';
      return res.status(400).json({ error: firstError });
    }

    const { name, email, password } = parseResult.data;

    // Check if user already exists (case-insensitive)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email address already exists' });
    }

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, 10);
    const cognitoSub = `local-citizen-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

    // STRICT ROLE ENFORCEMENT: Public signup is ALWAYS role: 'citizen'.
    // Any role parameter in req.body is completely ignored.
    const user = await User.create({
      cognitoSub,
      name,
      email,
      passwordHash,
      role: 'citizen',
      servicePincodes: [],
      rewardCoins: 0
    });

    const token = `dev-token-${user._id}`;

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        rewardCoins: user.rewardCoins,
        servicePincodes: user.servicePincodes
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/login
 * Authenticates user credentials and returns verified user identity & session token.
 */
router.post('/login', async (req, res, next) => {
  try {
    if (env.NODE_ENV === 'production') {
      return res.status(501).json({ error: 'Authentication is handled by Amazon Cognito User Pool in production' });
    }

    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || 'Invalid login details';
      return res.status(400).json({ error: firstError });
    }

    const { email, password } = parseResult.data;

    // Query user by lowercase email and include passwordHash
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password with bcrypt
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = `dev-token-${user._id}`;

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        servicePincodes: user.servicePincodes,
        rewardCoins: user.rewardCoins
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/me
 * Retrieves verified server-side identity of the authenticated session.
 */
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = req.user;
    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email || (req.auth && req.auth.sub ? `${user.role}@example.org` : ''),
        role: user.role,
        servicePincodes: user.servicePincodes || [],
        rewardCoins: user.rewardCoins || 0
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
