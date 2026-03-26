import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', department: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-left-logo">🎓 Uni<span>Core</span></div>
          <div className="auth-left-tagline">Start your academic journey with UniCore</div>
          <div className="auth-left-desc">
            Join thousands of students and faculty already using UniCore — the most modern university LMS.
          </div>
          <div className="auth-features">
            {[
              { icon: '🎓', text: 'Enroll in courses across departments' },
              { icon: '📝', text: 'Submit assignments and take quizzes online' },
              { icon: '📊', text: 'Track your GPA and academic progress' },
              { icon: '🔔', text: 'Never miss a deadline with smart alerts' },
            ].map(f => (
              <div className="auth-feature" key={f.text}>
                <div className="auth-feature-icon">{f.icon}</div>
                <div className="auth-feature-text">{f.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-box">
          <div className="auth-box-title">Create your account</div>
          <div className="auth-box-sub">Join UniCore in under a minute</div>

          {error && (
            <div className="alert alert-error" onClick={() => setError('')}>
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input className="form-control" type="text" name="name" value={form.name}
                onChange={handleChange} placeholder="Rahul Sharma" required />
            </div>
            <div className="form-group">
              <label>Email address</label>
              <input className="form-control" type="email" name="email" value={form.email}
                onChange={handleChange} placeholder="you@university.edu" required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input className="form-control" type="password" name="password" value={form.password}
                onChange={handleChange} placeholder="Min. 6 characters" required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label>Role</label>
                <select className="form-control" name="role" value={form.role} onChange={handleChange}>
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                </select>
              </div>
              <div className="form-group">
                <label>Department</label>
                <input className="form-control" type="text" name="department" value={form.department}
                  onChange={handleChange} placeholder="e.g. CSE-DS" />
              </div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: 4 }} disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account →'}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

