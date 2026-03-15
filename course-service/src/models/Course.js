const mongoose = require('mongoose');

const contentItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['video', 'document', 'link', 'text'], required: true },
  url: { type: String },
  content: { type: String },
  order: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: false },
}, { timestamps: true });

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    code: {
      type: String,
      required: [true, 'Course code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    department: { type: String, required: true },
    credits: { type: Number, required: true, min: 1, max: 10 },
    semester: { type: Number, required: true, min: 1, max: 8 },
    thumbnail: { type: String, default: null },
    facultyId: {
      type: String, // stored as string (cross-service reference)
      required: [true, 'Faculty assignment is required'],
    },
    facultyName: { type: String, default: '' },
    status: {
      type: String,
      enum: ['draft', 'active', 'archived'],
      default: 'draft',
    },
    maxStudents: { type: Number, default: 60 },
    enrolledCount: { type: Number, default: 0 },
    content: [contentItemSchema],
    tags: [{ type: String, trim: true }],
    syllabus: { type: String, default: '' },
    schedule: {
      days: [{ type: String, enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] }],
      time: { type: String, default: '' },
      room: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

courseSchema.index({ code: 1 });
courseSchema.index({ facultyId: 1 });
courseSchema.index({ department: 1, semester: 1 });
courseSchema.index({ status: 1 });

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
