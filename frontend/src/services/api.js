import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// ── Auth ──────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  refreshToken: (data) => api.post('/auth/refresh-token', data),
};

// ── Users ─────────────────────────────────────
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getStats: () => api.get('/users/stats'),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// ── Courses ───────────────────────────────────
export const coursesAPI = {
  getAll: (params) => api.get('/courses', { params }),
  getById: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
  enroll: (id, data) => api.post(`/courses/${id}/enroll`, data),
  getStudentEnrollments: (studentId) => api.get(`/courses/student/${studentId}/enrolled`),
  getStats: () => api.get('/courses/stats'),
};

// ── Assessments ───────────────────────────────
export const assessmentsAPI = {
  // Assignments
  createAssignment: (data) => api.post('/assessments/assignments', data),
  getAssignmentsByCourse: (courseId) => api.get(`/assessments/assignments/course/${courseId}`),
  submitAssignment: (id, data) => api.post(`/assessments/assignments/${id}/submit`, data),
  // Quizzes
  createQuiz: (data) => api.post('/assessments/quizzes', data),
  getQuizzesByCourse: (courseId) => api.get(`/assessments/quizzes/course/${courseId}`),
  submitQuiz: (id, data) => api.post(`/assessments/quizzes/${id}/submit`, data),
  // Submissions
  getStudentSubmissions: (studentId) => api.get(`/assessments/submissions/student/${studentId}`),
  gradeSubmission: (id, data) => api.put(`/assessments/submissions/${id}/grade`, data),
  getStats: () => api.get('/assessments/stats'),
};

// ── Notifications ─────────────────────────────
export const notificationsAPI = {
  getMy: (params) => api.get('/notifications/my', { params }),
  markRead: (data) => api.put('/notifications/mark-read', data),
  broadcast: (data) => api.post('/notifications/broadcast', data),
};

// ── Analytics ─────────────────────────────────
export const analyticsAPI = {
  adminOverview: () => api.get('/analytics/admin/overview'),
  studentAnalytics: (studentId) => api.get(`/analytics/student/${studentId}`),
  facultyAnalytics: (facultyId) => api.get(`/analytics/faculty/${facultyId}`),
  systemHealth: () => api.get('/analytics/system-health'),
  enrollmentTrend: () => api.get('/analytics/enrollment-trend'),
  gradeDistribution: () => api.get('/analytics/grade-distribution'),
};
