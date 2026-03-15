const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
    },
    studentName: { type: String, default: '' },
    studentEmail: { type: String, default: '' },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course ID is required'],
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'dropped', 'pending'],
      default: 'active',
    },
    enrolledAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    grade: { type: String, default: null },
    gradePoints: { type: Number, default: null },
    attendancePercentage: { type: Number, default: 0 },
  },
  { timestamps: true }
);

enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });
enrollmentSchema.index({ courseId: 1 });

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
module.exports = Enrollment;
