const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/analyticsController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/admin/overview', authorize('admin'), ctrl.getAdminOverview);
router.get('/enrollment-trend', authorize('admin'), ctrl.getEnrollmentTrend);
router.get('/course-completion', authorize('admin', 'faculty'), ctrl.getCourseCompletion);
router.get('/grade-distribution', authorize('admin', 'faculty'), ctrl.getGradeDistribution);
router.get('/system-health', authorize('admin'), ctrl.getSystemHealth);
router.get('/faculty/:facultyId', authorize('admin', 'faculty'), ctrl.getFacultyAnalytics);
router.get('/student/:studentId', ctrl.getStudentAnalytics);

module.exports = router;
