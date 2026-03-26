import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { coursesAPI } from '../services/api.js';

export default function Courses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [enrollCourseId, setEnrollCourseId] = useState(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchCourses = async () => {
    try {
      if (user.role === 'student') {
        const res = await coursesAPI.getStudentEnrollments(user._id);
        setCourses(res.data.data || []);
      } else {
        const res = await coursesAPI.getAll({ search });
        setCourses(res.data.data?.courses || []);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchCourses(); }, [search]);

  const handleEnroll = async (courseId) => {
    try {
      await coursesAPI.enroll(courseId, { studentId: user._id, studentName: user.name, studentEmail: user.email || '' });
      setSuccess('Enrolled successfully!');
      setEnrollCourseId(null);
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.message || 'Enrollment failed.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this course?')) return;
    try {
      await coursesAPI.delete(id);
      setSuccess('Course deleted.');
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed.');
    }
  };

  if (loading) return (
    <div className="loading-page" style={{ height: 300 }}>
      <div className="spinner" />
    </div>
  );

  const DEPT_COLORS = ['#6366f1','#06b6d4','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#f97316'];
  const deptColor = (dept = '') => DEPT_COLORS[dept.charCodeAt(0) % DEPT_COLORS.length];

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-title">
            {user.role === 'student' ? 'My Enrolled Courses' : user.role === 'faculty' ? 'My Courses' : 'All Courses'}
          </div>
          <div className="page-subtitle">{courses.length} course{courses.length !== 1 ? 's' : ''} found</div>
        </div>
        <div className="flex gap-2">
          {user.role === 'student' && (
            <button className="btn btn-outline" onClick={() => setEnrollCourseId('browse')}>Browse & Enroll</button>
          )}
          {(user.role === 'admin' || user.role === 'faculty') && (
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Create Course</button>
          )}
        </div>
      </div>

      {error && <div className="alert alert-error" onClick={() => setError('')}>{error}</div>}
      {success && <div className="alert alert-success" onClick={() => setSuccess('')}>{success}</div>}

      {showCreate && (
        <CreateCourseModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); fetchCourses(); }} user={user} />
      )}

      {enrollCourseId === 'browse' && (
        <BrowseCoursesModal onClose={() => setEnrollCourseId(null)} onEnroll={handleEnroll} userId={user._id} />
      )}

      {courses.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 48 }}>📚</div>
          <p style={{ marginTop: 12 }}>No courses yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {courses.map((item) => {
            const course = item.courseId || item;
            if (!course?._id && !course?.id) return null;
            const id = course._id || course.id;
            return (
              <div key={id} className="card" style={{ position: 'relative' }}>
                <div className="flex justify-between items-center" style={{ marginBottom: 8 }}>
                  <span className="badge badge-blue">{course.code || '—'}</span>
                  <span className={`badge ${course.status === 'active' ? 'badge-green' : course.status === 'draft' ? 'badge-yellow' : 'badge-gray'}`}>
                    {course.status || 'active'}
                  </span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{course.title}</div>
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>{course.description?.substring(0, 80)}…</div>
                <div style={{ fontSize: 13, display: 'flex', gap: 16, color: '#374151' }}>
                  <span>🏛 {course.department || '—'}</span>
                  <span>👥 {course.enrolledCount || 0}/{course.maxStudents || 60}</span>
                </div>
                {(user.role === 'admin' || (user.role === 'faculty' && (course.facultyId === user._id || course.facultyId === user.id))) && (
                  <button className="btn btn-danger btn-sm" style={{ marginTop: 12 }} onClick={() => handleDelete(id)}>Delete</button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CreateCourseModal({ onClose, onCreated, user }) {
  const [form, setForm] = useState({ title: '', code: '', description: '', department: '', semester: 1, credits: 3, maxStudents: 60, status: 'active' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await coursesAPI.create({ ...form, facultyId: user._id, facultyName: user.name });
      onCreated();
    } catch (err) {
      setError(err.response?.data?.message || 'Create failed.');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">Create Course</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          {[
            { label: 'Title', name: 'title', type: 'text' },
            { label: 'Course Code', name: 'code', type: 'text' },
            { label: 'Department', name: 'department', type: 'text' },
          ].map(({ label, name, type }) => (
            <div className="form-group" key={name}>
              <label>{label}</label>
              <input className="form-control" type={type} name={name} value={form[name]} onChange={handleChange} required />
            </div>
          ))}
          <div className="form-group">
            <label>Description</label>
            <textarea className="form-control" name="description" value={form.description} onChange={handleChange} rows={3} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            {[
              { label: 'Semester', name: 'semester', type: 'number' },
              { label: 'Credits', name: 'credits', type: 'number' },
              { label: 'Max Students', name: 'maxStudents', type: 'number' },
            ].map(({ label, name, type }) => (
              <div className="form-group" key={name}>
                <label>{label}</label>
                <input className="form-control" type={type} name={name} value={form[name]} onChange={handleChange} />
              </div>
            ))}
          </div>
          <div className="form-group">
            <label>Status</label>
            <select className="form-control" name="status" value={form.status} onChange={handleChange}>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating…' : 'Create Course'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BrowseCoursesModal({ onClose, onEnroll, userId }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    coursesAPI.getAll({ status: 'active' }).then((res) => {
      setCourses(res.data.data?.courses || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <div className="modal-title">Browse & Enroll</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {loading ? <div className="spinner" style={{ margin: '40px auto' }} /> : courses.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">📚</div><p>No active courses available</p></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {courses.map((course) => (
              <div key={course._id}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', border: '1.5px solid var(--border)', borderRadius: 10, background: 'var(--surface-2)' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{course.code} — {course.title}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{course.department} · {course.enrolledCount}/{course.maxStudents} students · {course.credits} credits</div>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => onEnroll(course._id)}>Enroll</button>
              </div>
            ))}
          </div>
        )}
        <button className="btn btn-ghost" style={{ marginTop: 16, width: '100%' }} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
