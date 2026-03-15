const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/notificationController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/my', ctrl.getMyNotifications);
router.put('/mark-read', ctrl.markAsRead);
router.post('/broadcast', authorize('admin', 'faculty'), ctrl.broadcastNotification);
router.get('/all', authorize('admin'), ctrl.getAllNotifications);
router.post('/', ctrl.createNotification);
router.delete('/:id', ctrl.deleteNotification);

module.exports = router;
