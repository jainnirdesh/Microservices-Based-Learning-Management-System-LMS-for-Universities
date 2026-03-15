const express = require('express');
const router = express.Router();
const {
  getAllUsers, getUserById, updateProfile, updateUser, deleteUser, getUserStats
} = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/stats', authorize('admin'), getUserStats);
router.get('/', authorize('admin'), getAllUsers);
router.get('/:id', getUserById);
router.put('/profile', updateProfile);
router.put('/:id', authorize('admin'), updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;
