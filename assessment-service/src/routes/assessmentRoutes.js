const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/assessmentController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// Stats
router.get('/stats', authorize('admin'), ctrl.getAssessmentStats);

// Assignments
router.post('/assignments', authorize('admin', 'faculty'), ctrl.createAssignment);
router.get('/assignments/course/:courseId', ctrl.getAssignmentsByCourse);
router.get('/assignments/:id', ctrl.getAssignmentById);
router.put('/assignments/:id', authorize('admin', 'faculty'), ctrl.updateAssignment);
router.delete('/assignments/:id', authorize('admin', 'faculty'), ctrl.deleteAssignment);
router.post('/assignments/:id/submit', authorize('student'), ctrl.submitAssignment);

// Quizzes
router.post('/quizzes', authorize('admin', 'faculty'), ctrl.createQuiz);
router.get('/quizzes/course/:courseId', ctrl.getQuizzesByCourse);
router.get('/quizzes/:id', ctrl.getQuizById);
router.post('/quizzes/:id/submit', authorize('student'), ctrl.submitQuiz);

// Submissions
router.get('/submissions/assessment/:assessmentId', authorize('admin', 'faculty'), ctrl.getSubmissionsByAssessment);
router.get('/submissions/student/:studentId', ctrl.getStudentSubmissions);
router.put('/submissions/:id/grade', authorize('admin', 'faculty'), ctrl.gradeSubmission);

module.exports = router;
