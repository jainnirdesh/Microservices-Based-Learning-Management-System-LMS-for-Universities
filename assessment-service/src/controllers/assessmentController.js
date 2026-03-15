const { validationResult } = require('express-validator');
const store = require('../data/assessmentStore');
const logger = require('../config/logger');

// ──────────────────────────────────────────────
//  ASSIGNMENT CONTROLLERS
// ──────────────────────────────────────────────

exports.createAssignment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const data = { ...req.body, facultyId: req.user.userId };
    const assignment = await store.createAssignment(data);
    logger.info(`Assignment created: ${assignment.title} by ${req.user.userId}`);
    res.status(201).json({ success: true, message: 'Assignment created', data: assignment });
  } catch (error) { next(error); }
};

exports.getAssignmentsByCourse = async (req, res, next) => {
  try {
    const query = { courseId: req.params.courseId };
    if (req.user.role === 'student') query.isPublished = true;
    const assignments = await store.listAssignments(query, { sort: { dueDate: 1 } });
    res.status(200).json({ success: true, data: assignments });
  } catch (error) { next(error); }
};

exports.getAssignmentById = async (req, res, next) => {
  try {
    const assignment = await store.getAssignmentById(req.params.id);
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });
    res.status(200).json({ success: true, data: assignment });
  } catch (error) { next(error); }
};

exports.updateAssignment = async (req, res, next) => {
  try {
    const assignment = await store.getAssignmentById(req.params.id);
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });
    if (req.user.role === 'faculty' && assignment.facultyId !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    const updated = await store.updateAssignment(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Assignment updated', data: updated });
  } catch (error) { next(error); }
};

exports.deleteAssignment = async (req, res, next) => {
  try {
    await store.deleteAssignment(req.params.id);
    await store.deleteSubmissions({ assessmentId: req.params.id, type: 'assignment' });
    res.status(200).json({ success: true, message: 'Assignment deleted' });
  } catch (error) { next(error); }
};

// ──────────────────────────────────────────────
//  QUIZ CONTROLLERS
// ──────────────────────────────────────────────

exports.createQuiz = async (req, res, next) => {
  try {
    const data = { ...req.body, facultyId: req.user.userId };
    const quiz = await store.createQuiz(data);
    logger.info(`Quiz created: ${quiz.title}`);
    res.status(201).json({ success: true, message: 'Quiz created', data: quiz });
  } catch (error) { next(error); }
};

exports.getQuizzesByCourse = async (req, res, next) => {
  try {
    const query = { courseId: req.params.courseId };
    // Students don't see answers
    if (req.user.role === 'student') query.isPublished = true;
    const quizzes = await store.listQuizzes(query, { sort: { startTime: 1 } });

    // Strip correct answers for students
    const data = req.user.role === 'student'
      ? quizzes.map(q => {
          const obj = { ...q };
          obj.questions = obj.questions.map(({ correctOption, explanation, ...rest }) => rest);
          return obj;
        })
      : quizzes;

    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.getQuizById = async (req, res, next) => {
  try {
    const quiz = await store.getQuizById(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    const data = req.user.role === 'student'
      ? (() => {
          const obj = { ...quiz };
          obj.questions = obj.questions.map(({ correctOption, explanation, ...rest }) => rest);
          return obj;
        })()
      : quiz;

    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

// ──────────────────────────────────────────────
//  SUBMISSION CONTROLLERS
// ──────────────────────────────────────────────

exports.submitAssignment = async (req, res, next) => {
  try {
    const assignment = await store.getAssignmentById(req.params.id);
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });

    const existing = await store.getSubmission({
      assessmentId: req.params.id, studentId: req.user.userId, type: 'assignment',
    });
    if (existing && !assignment.allowLateSubmission) {
      return res.status(409).json({ success: false, message: 'Already submitted' });
    }

    const isLate = new Date() > new Date(assignment.dueDate);
    const submission = await store.createSubmission({
      type: 'assignment',
      assessmentId: req.params.id,
      courseId: assignment.courseId,
      studentId: req.user.userId,
      studentName: req.body.studentName || '',
      submittedText: req.body.submittedText,
      attachments: req.body.attachments || [],
      totalMarks: assignment.totalMarks,
      isLate,
      status: isLate ? 'late' : 'submitted',
    });

    await store.updateAssignment(assignment._id, {
      submissionCount: (assignment.submissionCount || 0) + 1,
    });

    logger.info(`Assignment submitted by ${req.user.userId} for ${assignment.title}`);
    res.status(201).json({ success: true, message: 'Assignment submitted', data: submission });
  } catch (error) { next(error); }
};

exports.submitQuiz = async (req, res, next) => {
  try {
    const quiz = await store.getQuizById(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    const now = new Date();
    if (now < new Date(quiz.startTime)) return res.status(400).json({ success: false, message: 'Quiz has not started' });
    if (now > new Date(quiz.endTime)) return res.status(400).json({ success: false, message: 'Quiz deadline passed' });

    const existing = await store.getSubmission({ assessmentId: req.params.id, studentId: req.user.userId, type: 'quiz' });
    if (existing && !quiz.allowMultipleAttempts) {
      return res.status(409).json({ success: false, message: 'Quiz already attempted' });
    }

    // Auto-grade quiz
    const { answers = [] } = req.body;
    let marksObtained = 0;
    const gradedAnswers = answers.map((ans) => {
      const question = quiz.questions.find((item) => item._id === ans.questionId);
      if (!question) return ans;
      const isCorrect = question.correctOption === ans.selectedOption;
      const marks = isCorrect ? question.marks : 0;
      marksObtained += marks;
      return { ...ans, isCorrect, marksObtained: marks };
    });

    const percentage = quiz.totalMarks > 0 ? (marksObtained / quiz.totalMarks) * 100 : 0;
    const grade = percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : percentage >= 50 ? 'D' : 'F';

    const submission = await store.createSubmission({
      type: 'quiz',
      assessmentId: req.params.id,
      courseId: quiz.courseId,
      studentId: req.user.userId,
      studentName: req.body.studentName || '',
      answers: gradedAnswers,
      totalMarks: quiz.totalMarks,
      marksObtained,
      grade,
      status: 'graded',
      gradedAt: new Date(),
    });

    await store.updateQuiz(quiz._id, { attemptCount: (quiz.attemptCount || 0) + 1 });

    res.status(201).json({ success: true, message: 'Quiz submitted and graded', data: submission });
  } catch (error) { next(error); }
};

exports.gradeSubmission = async (req, res, next) => {
  try {
    const { marksObtained, feedback, grade } = req.body;
    const submission = await store.updateSubmission(req.params.id, {
      marksObtained,
      feedback,
      grade,
      status: 'graded',
      gradedBy: req.user.userId,
      gradedAt: new Date().toISOString(),
    });
    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });
    res.status(200).json({ success: true, message: 'Submission graded', data: submission });
  } catch (error) { next(error); }
};

exports.getSubmissionsByAssessment = async (req, res, next) => {
  try {
    const submissions = await store.listSubmissions({ assessmentId: req.params.assessmentId });
    res.status(200).json({ success: true, data: submissions });
  } catch (error) { next(error); }
};

exports.getStudentSubmissions = async (req, res, next) => {
  try {
    const studentId = req.params.studentId || req.user.userId;
    const { courseId, type } = req.query;
    const query = { studentId };
    if (courseId) query.courseId = courseId;
    if (type) query.type = type;
    const submissions = await store.listSubmissions(query, { sort: { createdAt: -1 } });
    res.status(200).json({ success: true, data: submissions });
  } catch (error) { next(error); }
};

exports.getAssessmentStats = async (req, res, next) => {
  try {
    const [totalAssignments, totalQuizzes, totalSubmissions, gradedSubmissions] = await Promise.all([
      store.countAssignments(),
      store.countQuizzes(),
      store.countSubmissions(),
      store.countSubmissions({ status: 'graded' }),
    ]);
    const pendingGrading = await store.countSubmissions({ type: 'assignment', status: 'submitted' });
    res.status(200).json({
      success: true,
      data: { totalAssignments, totalQuizzes, totalSubmissions, gradedSubmissions, pendingGrading },
    });
  } catch (error) { next(error); }
};
