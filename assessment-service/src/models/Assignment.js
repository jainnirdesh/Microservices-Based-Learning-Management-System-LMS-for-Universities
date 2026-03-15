const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Assignment title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    courseId: {
      type: String,
      required: [true, 'Course ID is required'],
    },
    courseCode: { type: String, default: '' },
    facultyId: {
      type: String,
      required: [true, 'Faculty ID is required'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    totalMarks: {
      type: Number,
      required: [true, 'Total marks required'],
      min: 1,
    },
    instructions: { type: String, default: '' },
    attachments: [
      {
        filename: String,
        url: String,
      },
    ],
    allowLateSubmission: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
    submissionCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

assignmentSchema.index({ courseId: 1 });
assignmentSchema.index({ facultyId: 1 });
assignmentSchema.index({ dueDate: 1 });

const Assignment = mongoose.model('Assignment', assignmentSchema);
module.exports = Assignment;
