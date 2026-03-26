import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { assessmentsAPI, coursesAPI } from '../services/api.js';

export default function Assessments() {
  const { user } = useAuth();
  const [tab, setTab] = useState('assignments');
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    const loadCourses = async () => {
      try {
        if (user.role === 'student') {
          const res = await coursesAPI.getStudentEnrollments(user._id);
          const enrolled = res.data.data || [];
          setCourses(enrolled.map((e) => e.courseId).filter(Boolean));
        } else {
          const res = await coursesAPI.getAll();
          setCourses(res.data.data?.courses || []);
        }
      } catch {}
    };
    loadCourses();

    // Load submissions for student
    if (user.role === 'student') {
      assessmentsAPI.getStudentSubmissions(user._id)
        .then((res) => setSubmissions(res.data.data || []))
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    if (!selectedCourse) { setAssignments([]); setQuizzes([]); return; }
    setLoading(true);
    Promise.all([
      assessmentsAPI.getAssignmentsByCourse(selectedCourse),
      assessmentsAPI.getQuizzesByCourse(selectedCourse),
    ]).then(([aRes, qRes]) => {
      setAssignments(aRes.data.data || []);
      setQuizzes(qRes.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [selectedCourse]);

  const handleSubmitAssignment = async (id) => {
    const text = prompt('Enter your submission text:');
    if (!text) return;
    try {
      await assessmentsAPI.submitAssignment(id, { submittedText: text, studentName: user.name });
      setMsg({ type: 'success', text: 'Assignment submitted!' });
      const res = await assessmentsAPI.getStudentSubmissions(user._id);
      setSubmissions(res.data.data || []);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Submit failed.' });
    }
  };

  const isSubmitted = (assessmentId) => submissions.some((s) => s.assessmentId === assessmentId);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-title">Assessments</div>
          <div className="page-subtitle">Manage assignments, quizzes and submissions</div>
        </div>
        {(user.role === 'faculty' || user.role === 'admin') && (
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Create</button>
        )}
      </div>

      {msg.text && (
        <div className={`alert alert-${msg.type === 'success' ? 'success' : 'error'}`} onClick={() => setMsg({ type: '', text: '' })}>{msg.text}</div>
      )}

      <div className="form-group" style={{ maxWidth: 320, marginBottom: 20 }}>
        <label>Select Course</label>
        <select className="form-control" value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
          <option value="">— pick a course —</option>
          {courses.map((c) => (
            <option key={c._id || c.id} value={c._id || c.id}>{c.code} — {c.title}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['assignments', 'quizzes'].map((t) => (
          <button key={t} className={`btn ${tab === t ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab(t)}>
            {t === 'assignments' ? '📝 Assignments' : '🧩 Quizzes'}
          </button>
        ))}
        {user.role === 'student' && (
          <button className={`btn ${tab === 'submissions' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('submissions')}>
            📋 My Submissions
          </button>
        )}
      </div>

      {loading ? <div className="spinner" /> : (
        <>
          {tab === 'assignments' && (
            <AssignmentsList assignments={assignments} user={user} onSubmit={handleSubmitAssignment} isSubmitted={isSubmitted} />
          )}
          {tab === 'quizzes' && <QuizzesList quizzes={quizzes} />}
          {tab === 'submissions' && <SubmissionsList submissions={submissions} />}
        </>
      )}

      {showCreate && (
        <CreateAssessmentModal
          onClose={() => setShowCreate(false)}
          courses={courses}
          user={user}
          onCreated={() => {
            setShowCreate(false);
            if (selectedCourse) {
              assessmentsAPI.getAssignmentsByCourse(selectedCourse).then((r) => setAssignments(r.data.data || []));
            }
          }}
        />
      )}
    </div>
  );
}

function AssignmentsList({ assignments, user, onSubmit, isSubmitted }) {
  if (assignments.length === 0) return <div className="empty-state"><div style={{ fontSize: 48 }}>📝</div><p>No assignments for this course.</p></div>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {assignments.map((a) => (
        <div key={a._id} className="card">
          <div className="flex justify-between items-center">
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{a.title}</div>
              <div className="text-muted" style={{ fontSize: 13, marginTop: 2 }}>{a.instructions?.substring(0, 100)}</div>
              <div style={{ fontSize: 13, marginTop: 6, display: 'flex', gap: 16 }}>
                <span>📅 Due: {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : '—'}</span>
                <span>🏆 {a.totalMarks} marks</span>
                {a.submissionCount > 0 && <span>📥 {a.submissionCount} submissions</span>}
              </div>
            </div>
            {user.role === 'student' && (
              isSubmitted(a._id) ? (
                <span className="badge badge-green">Submitted</span>
              ) : (
                <button className="btn btn-primary btn-sm" onClick={() => onSubmit(a._id)}>Submit</button>
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function QuizzesList({ quizzes }) {
  if (quizzes.length === 0) return <div className="empty-state"><div style={{ fontSize: 48 }}>🧩</div><p>No quizzes for this course.</p></div>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {quizzes.map((q) => (
        <div key={q._id} className="card">
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{q.title}</div>
          <div style={{ fontSize: 13, display: 'flex', gap: 16, color: '#374151' }}>
            <span>🕒 Start: {q.startTime ? new Date(q.startTime).toLocaleString() : '—'}</span>
            <span>🕒 End: {q.endTime ? new Date(q.endTime).toLocaleString() : '—'}</span>
            <span>⏱ {q.duration} min</span>
            <span>🏆 {q.totalMarks} marks</span>
            <span>❓ {q.questions?.length || 0} questions</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function SubmissionsList({ submissions }) {
  if (submissions.length === 0) return <div className="empty-state"><div style={{ fontSize: 48 }}>📋</div><p>No submissions yet.</p></div>;
  return (
    <div className="card table-wrap">
      <table>
        <thead><tr><th>Type</th><th>Submitted</th><th>Status</th><th>Marks</th><th>Grade</th></tr></thead>
        <tbody>
          {submissions.map((s) => (
            <tr key={s._id}>
              <td style={{ textTransform: 'capitalize' }}>{s.type}</td>
              <td>{s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : '—'}</td>
              <td>
                <span className={`badge ${s.status === 'graded' ? 'badge-green' : s.status === 'late' ? 'badge-red' : 'badge-yellow'}`}>
                  {s.status}
                </span>
              </td>
              <td>{s.marksObtained != null ? `${s.marksObtained}/${s.totalMarks}` : '—'}</td>
              <td>{s.grade || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CreateAssessmentModal({ onClose, courses, user, onCreated }) {
  const [type, setType] = useState('assignment');
  const [form, setForm] = useState({ title: '', courseId: '', instructions: '', dueDate: '', totalMarks: 100 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (type === 'assignment') {
        await assessmentsAPI.createAssignment({ ...form, facultyId: user._id });
      } else {
        await assessmentsAPI.createQuiz({ ...form, facultyId: user._id, questions: [], startTime: form.dueDate, endTime: form.dueDate, duration: 60 });
      }
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
          <div className="modal-title">Create Assessment</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="form-group">
          <label>Type</label>
          <select className="form-control" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="assignment">Assignment</option>
            <option value="quiz">Quiz</option>
          </select>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Course</label>
            <select className="form-control" name="courseId" value={form.courseId} onChange={handleChange} required>
              <option value="">— select course —</option>
              {courses.map((c) => <option key={c._id || c.id} value={c._id || c.id}>{c.code} — {c.title}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Title</label>
            <input className="form-control" type="text" name="title" value={form.title} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Instructions</label>
            <textarea className="form-control" name="instructions" value={form.instructions} onChange={handleChange} rows={3} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>{type === 'assignment' ? 'Due Date' : 'Start/End Date'}</label>
              <input className="form-control" type="datetime-local" name="dueDate" value={form.dueDate} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Total Marks</label>
              <input className="form-control" type="number" name="totalMarks" value={form.totalMarks} onChange={handleChange} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating…' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
