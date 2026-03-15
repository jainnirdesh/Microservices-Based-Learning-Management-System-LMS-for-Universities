const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const users = require('../data/users');
const logger = require('../config/logger');

const generateTokens = (userId, role) => {
  const accessToken = jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
};

// @desc  Register a new user
// @route POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, role, department } = req.body;

    const existingUser = await users.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    // Only allow admin to create admin accounts
    const assignedRole = role === 'admin' ? 'student' : (role || 'student');

    const user = await users.createUser({ name, email, password, role: assignedRole, department });
    const { accessToken, refreshToken } = generateTokens(user._id, user.role);
    const updatedUser = await users.updateById(user._id, {
      refreshToken,
      lastLogin: new Date().toISOString(),
    });

    logger.info(`New user registered: ${email} [${assignedRole}]`);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: updatedUser,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Login user
// @route POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await users.findByEmail(email, { includeSecrets: true });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    const isMatch = await users.comparePassword(user, password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens(user._id, user.role);
    const updatedUser = await users.updateById(user._id, {
      refreshToken,
      lastLogin: new Date().toISOString(),
    });

    logger.info(`User logged in: ${email}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: updatedUser,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Refresh access token
// @route POST /api/auth/refresh-token
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await users.getById(decoded.userId, { includeSecrets: true });

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    const tokens = generateTokens(user._id, user.role);
    await users.updateById(user._id, { refreshToken: tokens.refreshToken });

    res.status(200).json({ success: true, data: tokens });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }
    next(error);
  }
};

// @desc  Logout user
// @route POST /api/auth/logout
exports.logout = async (req, res, next) => {
  try {
    const user = await users.getById(req.user.userId);
    if (user) {
      await users.updateById(user._id, { refreshToken: null });
    }
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc  Get current user profile (via token)
// @route GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await users.getById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};
