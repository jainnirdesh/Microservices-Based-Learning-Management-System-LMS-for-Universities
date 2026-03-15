const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['assignment', 'quiz'],
      required: true,
    },
    assessmentId: {
      type: String,
      required: true,
      comment: 'Assignment or Quiz ID',
    },
    courseId: { type: String, required: true },
    studentId: { type: String, required: true },
    studentName: { type: String, default: '' },

    // For assignment submissions
    submittedText: { type: String, default: '' },
    attachments: [{ filename: String, url: String }],

    // For quiz submissions
    answers: [
      {
        questionId: String,
        selectedOption: String,
        isCorrect: Boolean,
        marksObtained: Number,
      },
    ],

    // Grading
    status: {
      type: String,
      enum: ['submitted', 'graded', 'late', 'resubmitted'],
      default: 'submitted',
    },
    marksObtained: { type: Number, default: null },
    totalMarks: { type: Number, default: 0 },
    grade: { type: String, default: null },
    feedback: { type: String, default: '' },
    gradedBy: { type: String, default: null },
    gradedAt: { type: Date, default: null },
    submittedAt: { type: Date, default: Date.now },
    isLate: { type: Boolean, default: false },
  },
  { timestamps: true }
);

submissionSchema.index({ assessmentId: 1, studentId: 1 });
submissionSchema.index({ courseId: 1 });
submissionSchema.index({ studentId: 1 });

const Submission = mongoose.model('Submission', submissionSchema);
module.exports = Submission;
