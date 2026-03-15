const bcrypt = require('bcryptjs');
const { createCollectionStore } = require('../../../shared/supabaseDocumentStore');

const store = createCollectionStore('users', {
  role: 'student',
  profilePicture: null,
  bio: '',
  department: '',
  enrollmentNumber: null,
  employeeId: null,
  isActive: true,
  lastLogin: null,
  refreshToken: null,
});

const normalizeUser = (user, includeSecrets = false) => {
  if (!user) {
    return null;
  }

  const normalized = {
    ...user,
    _id: user.id,
  };

  if (!includeSecrets) {
    delete normalized.password;
    delete normalized.refreshToken;
  }

  return normalized;
};

const normalizeEmail = (email = '') => email.trim().toLowerCase();

const createUser = async (data) => {
  const password = await bcrypt.hash(data.password, 12);

  const user = await store.create({
    name: (data.name || '').trim(),
    email: normalizeEmail(data.email),
    password,
    role: data.role || 'student',
    department: data.department || '',
  });

  return normalizeUser(user);
};

const findByEmail = async (email, options = {}) => {
  const users = await store.list({ email: normalizeEmail(email) });
  return normalizeUser(users[0] || null, options.includeSecrets);
};

const getById = async (id, options = {}) => {
  const user = await store.getById(id);
  return normalizeUser(user, options.includeSecrets);
};

const updateById = async (id, updates, options = {}) => {
  const payload = { ...updates };

  if (payload.email) {
    payload.email = normalizeEmail(payload.email);
  }

  if (payload.password) {
    payload.password = await bcrypt.hash(payload.password, 12);
  }

  const user = await store.update(id, payload);
  return normalizeUser(user, options.includeSecrets);
};

const deleteById = async (id) => {
  const user = await store.delete(id);
  return normalizeUser(user);
};

const listUsers = async (query = {}, options = {}) => {
  const users = await store.list(query, options);
  return users.map((user) => normalizeUser(user));
};

const countUsers = async (query = {}) => store.count(query);

const comparePassword = async (user, candidatePassword) => {
  if (!user?.password) {
    return false;
  }

  return bcrypt.compare(candidatePassword, user.password);
};

module.exports = {
  comparePassword,
  countUsers,
  createUser,
  deleteById,
  findByEmail,
  getById,
  listUsers,
  updateById,
};