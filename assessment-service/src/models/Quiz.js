const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [
    {
      label: { type: String, required: true }, // A, B, C, D
      text: { type: String, required: true },
    },
  ],
  correctOption: { type: String, required: true }, // label of correct answer
  marks: { type: Number, default: 1 },
  explanation: { type: String, default: '' },
});

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true,
    },
    courseId: { type: String, required: true },
    courseCode: { type: String, default: '' },
    facultyId: { type: String, required: true },
    questions: [questionSchema],
    totalMarks: { type: Number, default: 0 },
    duration: { type: Number, required: true, comment: 'In minutes' },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    instructions: { type: String, default: '' },
    isPublished: { type: Boolean, default: false },
    allowMultipleAttempts: { type: Boolean, default: false },
    shuffleQuestions: { type: Boolean, default: true },
    attemptCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

quizSchema.pre('save', function (next) {
  if (this.questions && this.questions.length > 0) {
    this.totalMarks = this.questions.reduce((sum, q) => sum + (q.marks || 1), 0);
  }
  next();
});

quizSchema.index({ courseId: 1 });
quizSchema.index({ facultyId: 1 });

const Quiz = mongoose.model('Quiz', quizSchema);
module.exports = Quiz;
