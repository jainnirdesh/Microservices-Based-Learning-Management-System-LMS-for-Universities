const { validationResult } = require('express-validator');
const store = require('../data/courseStore');
const logger = require('../config/logger');

// @desc  Create a new course
// @route POST /api/courses
exports.createCourse = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Faculty can only create course for themselves
    if (req.user.role === 'faculty') {
      req.body.facultyId = req.user.userId;
    }

    const course = await store.createCourse(req.body);
    logger.info(`Course created: ${course.code} by user ${req.user.userId}`);

    res.status(201).json({ success: true, message: 'Course created', data: course });
  } catch (error) {
    next(error);
  }
};

// @desc  Get all courses
// @route GET /api/courses
exports.getAllCourses = async (req, res, next) => {
  try {
    const { department, semester, status, page = 1, limit = 20, search, facultyId } = req.query;
    const query = {};

    if (department) query.department = department;
    if (semester) query.semester = parseInt(semester);
    if (status) query.status = status;
    if (facultyId) query.facultyId = facultyId;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }

    // Faculty only sees their own courses
    if (req.user.role === 'faculty') {
      query.facultyId = req.user.userId;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [courses, total] = await Promise.all([
      store.listCourses(query, { skip, limit: parseInt(limit), sort: { createdAt: -1 } }),
      store.countCourses(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        courses,
        pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get course by ID
// @route GET /api/courses/:id
exports.getCourseById = async (req, res, next) => {
  try {
    const course = await store.getCourseById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.status(200).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

// @desc  Update course
// @route PUT /api/courses/:id
exports.updateCourse = async (req, res, next) => {
  try {
    let course = await store.getCourseById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    // Only assigned faculty or admin can update
    if (req.user.role === 'faculty' && course.facultyId !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    course = await store.updateCourse(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Course updated', data: course });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete course
// @route DELETE /api/courses/:id
exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await store.deleteCourse(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    await store.deleteEnrollments({ courseId: req.params.id });
    res.status(200).json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc  Add content to course
// @route POST /api/courses/:id/content
exports.addContent = async (req, res, next) => {
  try {
    const course = await store.getCourseById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    if (req.user.role === 'faculty' && course.facultyId !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const content = [...(course.content || []), req.body];
    const updated = await store.updateCourse(req.params.id, { content });
    res.status(201).json({ success: true, message: 'Content added', data: updated.content });
  } catch (error) {
    next(error);
  }
};

// @desc  Enroll student in course
// @route POST /api/courses/:id/enroll
exports.enrollStudent = async (req, res, next) => {
  try {
    const { studentId, studentName, studentEmail } = req.body;
    const course = await store.getCourseById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    if (course.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Course is not active' });
    }

    if (course.enrolledCount >= course.maxStudents) {
      return res.status(400).json({ success: false, message: 'Course is full' });
    }

    const existing = await store.getEnrollment({ studentId, courseId: course._id });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Student already enrolled' });
    }

    const enrollment = await store.createEnrollment({ studentId, studentName, studentEmail, courseId: course._id });
    await store.updateCourse(course._id, { enrolledCount: (course.enrolledCount || 0) + 1 });

    logger.info(`Student ${studentId} enrolled in course ${course.code}`);
    res.status(201).json({ success: true, message: 'Enrollment successful', data: enrollment });
  } catch (error) {
    next(error);
  }
};

// @desc  Get enrollments for a course
// @route GET /api/courses/:id/enrollments
exports.getCourseEnrollments = async (req, res, next) => {
  try {
    const enrollments = await store.listEnrollments({ courseId: req.params.id });
    res.status(200).json({ success: true, data: enrollments });
  } catch (error) {
    next(error);
  }
};

// @desc  Get courses a student is enrolled in
// @route GET /api/courses/student/:studentId/enrolled
exports.getStudentEnrollments = async (req, res, next) => {
  try {
    const studentId = req.params.studentId || req.user.userId;
    const enrollments = await store.listEnrollments({ studentId, status: 'active' });
    const courseIds = [...new Set(enrollments.map((enrollment) => enrollment.courseId))];
    const courses = await Promise.all(courseIds.map((courseId) => store.getCourseById(courseId)));
    const courseMap = new Map(courses.filter(Boolean).map((course) => [course._id, course]));
    const hydrated = enrollments.map((enrollment) => ({
      ...enrollment,
      courseId: courseMap.get(enrollment.courseId) || null,
    }));
    res.status(200).json({ success: true, data: hydrated });
  } catch (error) {
    next(error);
  }
};

// @desc  Get course statistics
// @route GET /api/courses/stats
exports.getCourseStats = async (req, res, next) => {
  try {
    const [total, active, draft, archived] = await Promise.all([
      store.countCourses(),
      store.countCourses({ status: 'active' }),
      store.countCourses({ status: 'draft' }),
      store.countCourses({ status: 'archived' }),
    ]);
    const totalEnrollments = await store.countEnrollments({ status: 'active' });

    res.status(200).json({
      success: true,
      data: { total, active, draft, archived, totalEnrollments },
    });
  } catch (error) {
    next(error);
  }
};
