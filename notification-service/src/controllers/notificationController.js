const store = require('../data/notificationStore');
const logger = require('../config/logger');

// @desc  Create a new notification (internal or from other services)
// @route POST /api/notifications
exports.createNotification = async (req, res, next) => {
  try {
    const { recipientId, recipientRole, type, title, message, metadata, priority, senderName, senderId } = req.body;

    const notification = await store.createNotification({
      recipientId, recipientRole, type, title, message, metadata,
      priority: priority || 'medium',
      senderId: senderId || req.user?.userId || 'system',
      senderName: senderName || 'UniCore System',
    });

    logger.info(`Notification created: [${type}] → ${recipientId}`);
    res.status(201).json({ success: true, message: 'Notification sent', data: notification });
  } catch (error) { next(error); }
};

// @desc  Broadcast to a role or all
// @route POST /api/notifications/broadcast
exports.broadcastNotification = async (req, res, next) => {
  try {
    const { recipientRole = 'all', type, title, message, metadata, priority } = req.body;

    const notification = await store.createNotification({
      recipientId: 'all',
      recipientRole,
      type: type || 'general',
      title,
      message,
      metadata,
      priority: priority || 'medium',
      senderId: req.user.userId,
      senderName: 'Admin',
    });

    logger.info(`Broadcast notification: [${type}] to ${recipientRole}`);
    res.status(201).json({ success: true, message: 'Broadcast sent', data: notification });
  } catch (error) { next(error); }
};

// @desc  Get notifications for a user
// @route GET /api/notifications/my
exports.getMyNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unread } = req.query;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Match by recipientId OR broadcast to user's role OR broadcast to all
    const query = {
      $or: [
        { recipientId: userId },
        { recipientId: 'all', recipientRole: userRole },
        { recipientId: 'all', recipientRole: 'all' },
      ],
    };

    if (unread === 'true') query.isRead = false;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [notifications, total, unreadCount] = await Promise.all([
      store.listNotifications(query, { skip, limit: parseInt(limit), sort: { createdAt: -1 } }),
      store.countNotifications(query),
      store.countNotifications({ ...query, isRead: false }),
    ]);

    res.status(200).json({
      success: true,
      data: { notifications, unreadCount, pagination: { total, page: parseInt(page), limit: parseInt(limit) } },
    });
  } catch (error) { next(error); }
};

// @desc  Mark notification(s) as read
// @route PUT /api/notifications/mark-read
exports.markAsRead = async (req, res, next) => {
  try {
    const { notificationIds, all } = req.body;
    const userId = req.user.userId;

    if (all) {
      await store.updateNotifications(
        { recipientId: userId, isRead: false },
        { isRead: true, readAt: new Date().toISOString() }
      );
      return res.status(200).json({ success: true, message: 'All notifications marked as read' });
    }

    if (notificationIds && notificationIds.length > 0) {
      await store.updateNotifications(
        { _id: { $in: notificationIds }, recipientId: userId },
        { isRead: true, readAt: new Date().toISOString() }
      );
    }

    res.status(200).json({ success: true, message: 'Notifications marked as read' });
  } catch (error) { next(error); }
};

// @desc  Delete a notification
// @route DELETE /api/notifications/:id
exports.deleteNotification = async (req, res, next) => {
  try {
    await store.deleteNotification(req.params.id);
    res.status(200).json({ success: true, message: 'Notification deleted' });
  } catch (error) { next(error); }
};

// @desc  Get all notifications (admin)
// @route GET /api/notifications/all
exports.getAllNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [notifications, total] = await Promise.all([
      store.listNotifications({}, { skip, limit: parseInt(limit), sort: { createdAt: -1 } }),
      store.countNotifications(),
    ]);
    res.status(200).json({ success: true, data: { notifications, total } });
  } catch (error) { next(error); }
};
