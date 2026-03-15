const { validationResult } = require('express-validator');
const users = require('../data/users');
const logger = require('../config/logger');

// @desc  Get all users (admin only)
// @route GET /api/users
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20, search } = req.query;
    const query = {};

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [userList, total] = await Promise.all([
      users.listUsers(query, { skip, limit: parseInt(limit), sort: { createdAt: -1 } }),
      users.countUsers(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        users: userList,
        pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get user by ID
// @route GET /api/users/:id
exports.getUserById = async (req, res, next) => {
  try {
    const user = await users.getById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc  Update own profile
// @route PUT /api/users/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const allowedFields = ['name', 'bio', 'department', 'profilePicture'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await users.updateById(req.user.userId, updates);

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    logger.info(`Profile updated: ${user.email}`);
    res.status(200).json({ success: true, message: 'Profile updated', data: user });
  } catch (error) {
    next(error);
  }
};

// @desc  Admin: update any user
// @route PUT /api/users/:id
exports.updateUser = async (req, res, next) => {
  try {
    const { name, role, isActive, department } = req.body;
    const user = await users.updateById(req.params.id, { name, role, isActive, department });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, message: 'User updated', data: user });
  } catch (error) {
    next(error);
  }
};

// @desc  Admin: delete user
// @route DELETE /api/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await users.deleteById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    logger.info(`User deleted: ${user.email}`);
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc  Get user stats (admin)
// @route GET /api/users/stats
exports.getUserStats = async (req, res, next) => {
  try {
    const [total, students, faculty, admins] = await Promise.all([
      users.countUsers(),
      users.countUsers({ role: 'student' }),
      users.countUsers({ role: 'faculty' }),
      users.countUsers({ role: 'admin' }),
    ]);

    const recentUsers = await users.listUsers({}, { limit: 5, sort: { createdAt: -1 } });

    res.status(200).json({
      success: true,
      data: { total, students, faculty, admins, recentUsers },
    });
  } catch (error) {
    next(error);
  }
};
