const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: String,
      required: true,
      comment: 'User ID or "all" for broadcast',
    },
    recipientRole: {
      type: String,
      enum: ['admin', 'faculty', 'student', 'all'],
      default: 'all',
    },
    senderId: { type: String, default: 'system' },
    senderName: { type: String, default: 'UniCore System' },
    type: {
      type: String,
      enum: [
        'assignment_created', 'assignment_due', 'quiz_created',
        'quiz_starting', 'course_announcement', 'grade_posted',
        'enrollment_confirmed', 'system_alert', 'general',
      ],
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
    },
    metadata: {
      courseId: String,
      courseCode: String,
      assessmentId: String,
      link: String,
    },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
  },
  { timestamps: true }
);

notificationSchema.index({ recipientId: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
