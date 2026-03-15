const { createCollectionStore } = require('../../../shared/supabaseDocumentStore');

const withId = (item) => ({
  _id: item.id,
  ...item,
});

const courseStore = createCollectionStore('courses', {
  thumbnail: null,
  facultyName: '',
  status: 'draft',
  maxStudents: 60,
  enrolledCount: 0,
  content: [],
  tags: [],
  syllabus: '',
  schedule: { days: [], time: '', room: '' },
});

const enrollmentStore = createCollectionStore('enrollments', {
  studentName: '',
  studentEmail: '',
  status: 'active',
  enrolledAt: null,
  completedAt: null,
  progress: 0,
  grade: null,
  gradePoints: null,
  attendancePercentage: 0,
});

const normalizeCourse = (course) => (course ? withId(course) : null);
const normalizeEnrollment = (enrollment) => (enrollment ? withId(enrollment) : null);

module.exports = {
  async createCourse(data) {
    const course = await courseStore.create({
      ...data,
      code: (data.code || '').trim().toUpperCase(),
      content: Array.isArray(data.content) ? data.content : [],
    });
    return normalizeCourse(course);
  },

  async getCourseById(id) {
    return normalizeCourse(await courseStore.getById(id));
  },

  async listCourses(query = {}, options = {}) {
    const courses = await courseStore.list(query, options);
    return courses.map(normalizeCourse);
  },

  async countCourses(query = {}) {
    return courseStore.count(query);
  },

  async updateCourse(id, updates) {
    if (updates.code) {
      updates.code = updates.code.trim().toUpperCase();
    }
    return normalizeCourse(await courseStore.update(id, updates));
  },

  async deleteCourse(id) {
    return normalizeCourse(await courseStore.delete(id));
  },

  async createEnrollment(data) {
    const enrollment = await enrollmentStore.create({
      ...data,
      enrolledAt: data.enrolledAt || new Date().toISOString(),
    });
    return normalizeEnrollment(enrollment);
  },

  async getEnrollment(query = {}) {
    const enrollments = await enrollmentStore.list(query, { limit: 1 });
    return normalizeEnrollment(enrollments[0] || null);
  },

  async listEnrollments(query = {}, options = {}) {
    const enrollments = await enrollmentStore.list(query, options);
    return enrollments.map(normalizeEnrollment);
  },

  async countEnrollments(query = {}) {
    return enrollmentStore.count(query);
  },

  async deleteEnrollments(query = {}) {
    return enrollmentStore.deleteMany(query);
  },
};