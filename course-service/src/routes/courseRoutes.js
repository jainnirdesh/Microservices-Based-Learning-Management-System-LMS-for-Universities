const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createCourse, getAllCourses, getCourseById, updateCourse, deleteCourse,
  addContent, enrollStudent, getCourseEnrollments, getStudentEnrollments, getCourseStats,
} = require('../controllers/courseController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

const courseValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('code').trim().notEmpty().withMessage('Course code is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('credits').isInt({ min: 1, max: 10 }).withMessage('Credits must be 1–10'),
  body('semester').isInt({ min: 1, max: 8 }).withMessage('Semester must be 1–8'),
];

router.get('/stats', authorize('admin'), getCourseStats);
router.get('/student/:studentId/enrolled', getStudentEnrollments);

router.route('/')
  .get(getAllCourses)
  .post(authorize('admin', 'faculty'), courseValidation, createCourse);

router.route('/:id')
  .get(getCourseById)
  .put(authorize('admin', 'faculty'), updateCourse)
  .delete(authorize('admin'), deleteCourse);

router.post('/:id/content', authorize('admin', 'faculty'), addContent);
router.post('/:id/enroll', authorize('admin', 'faculty'), enrollStudent);
router.get('/:id/enrollments', authorize('admin', 'faculty'), getCourseEnrollments);

module.exports = router;
