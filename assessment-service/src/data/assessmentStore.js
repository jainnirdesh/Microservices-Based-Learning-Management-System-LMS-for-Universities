const { randomUUID } = require('crypto');
const { createCollectionStore } = require('../../../shared/supabaseDocumentStore');

const assignmentStore = createCollectionStore('assignments', {
  courseCode: '',
  instructions: '',
  attachments: [],
  allowLateSubmission: false,
  isPublished: false,
  submissionCount: 0,
});

const quizStore = createCollectionStore('quizzes', {
  courseCode: '',
  questions: [],
  totalMarks: 0,
  instructions: '',
  isPublished: false,
  allowMultipleAttempts: false,
  shuffleQuestions: true,
  attemptCount: 0,
});

const submissionStore = createCollectionStore('submissions', {
  studentName: '',
  submittedText: '',
  attachments: [],
  answers: [],
  status: 'submitted',
  marksObtained: null,
  totalMarks: 0,
  grade: null,
  feedback: '',
  gradedBy: null,
  gradedAt: null,
  submittedAt: null,
  isLate: false,
});

const withId = (item) => (item ? { _id: item.id, ...item } : null);

const normalizeQuestions = (questions = []) => questions.map((question) => ({
  _id: question._id || question.id || randomUUID(),
  ...question,
}));

module.exports = {
  async createAssignment(data) {
    return withId(await assignmentStore.create(data));
  },

  async listAssignments(query = {}, options = {}) {
    return (await assignmentStore.list(query, options)).map(withId);
  },

  async getAssignmentById(id) {
    return withId(await assignmentStore.getById(id));
  },

  async updateAssignment(id, updates) {
    return withId(await assignmentStore.update(id, updates));
  },

  async deleteAssignment(id) {
    return withId(await assignmentStore.delete(id));
  },

  async countAssignments(query = {}) {
    return assignmentStore.count(query);
  },

  async createQuiz(data) {
    const questions = normalizeQuestions(data.questions);
    const totalMarks = questions.reduce((sum, question) => sum + (question.marks || 1), 0);
    return withId(await quizStore.create({ ...data, questions, totalMarks }));
  },

  async listQuizzes(query = {}, options = {}) {
    return (await quizStore.list(query, options)).map(withId);
  },

  async getQuizById(id) {
    return withId(await quizStore.getById(id));
  },

  async updateQuiz(id, updates) {
    const payload = { ...updates };
    if (payload.questions) {
      payload.questions = normalizeQuestions(payload.questions);
      payload.totalMarks = payload.questions.reduce((sum, question) => sum + (question.marks || 1), 0);
    }
    return withId(await quizStore.update(id, payload));
  },

  async countQuizzes(query = {}) {
    return quizStore.count(query);
  },

  async createSubmission(data) {
    return withId(await submissionStore.create({
      ...data,
      submittedAt: data.submittedAt || new Date().toISOString(),
    }));
  },

  async getSubmission(query = {}) {
    const submissions = await submissionStore.list(query, { limit: 1 });
    return withId(submissions[0] || null);
  },

  async listSubmissions(query = {}, options = {}) {
    return (await submissionStore.list(query, options)).map(withId);
  },

  async updateSubmission(id, updates) {
    return withId(await submissionStore.update(id, updates));
  },

  async deleteSubmissions(query = {}) {
    return submissionStore.deleteMany(query);
  },

  async countSubmissions(query = {}) {
    return submissionStore.count(query);
  },
};