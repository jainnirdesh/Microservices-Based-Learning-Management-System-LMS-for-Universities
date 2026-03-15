const mongoose = require('mongoose');

const analyticsSnapshotSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['student_progress', 'course_stats', 'system_overview', 'submission_stats'],
      required: true,
    },
    entityId: { type: String, required: true, comment: 'studentId, courseId, or "system"' },
    period: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'all_time'],
      default: 'all_time',
    },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
    recordedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

analyticsSnapshotSchema.index({ type: 1, entityId: 1 });
analyticsSnapshotSchema.index({ recordedAt: -1 });

const AnalyticsSnapshot = mongoose.model('AnalyticsSnapshot', analyticsSnapshotSchema);
module.exports = AnalyticsSnapshot;
