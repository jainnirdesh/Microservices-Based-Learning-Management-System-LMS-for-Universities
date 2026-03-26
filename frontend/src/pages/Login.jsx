import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const DEMO = [
  { email: 'admin@unicore.edu', password: 'admin123', label: 'Admin', color: '#ef4444' },
  { email: 'faculty@unicore.edu', password: 'faculty123', label: 'Faculty', color: '#f59e0b' },
  { email: 'student@unicore.edu', password: 'student123', label: 'Student', color: '#6366f1' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const getFriendlyError = (err) => {
    if (!err.response) {
      return 'Unable to reach server. Start backend services (API Gateway on port 3000) and try again.';
    }
    if (err.response?.status === 401) {
      return 'Invalid credentials or demo users are not seeded yet. Register first, or seed demo accounts.';
    }
    return err.response?.data?.message || 'Login failed. Check your credentials.';
  };

  const submitLogin = async (email, password) => {
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(getFriendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitLogin(form.email, form.password);
  };

  const handleDemoLogin = async (demo) => {
    setForm({ email: demo.email, password: demo.password });
    await submitLogin(demo.email, demo.password);
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-left-logo">🎓 Uni<span>Core</span></div>
          <div className="auth-left-tagline">The smart way to manage university learning</div>
          <div className="auth-left-desc">
            A complete microservices-based LMS powering courses, assessments, analytics, and real-time notifications—across every role.
          </div>
          <div className="auth-features">
            {[
              { icon: '📚', text: 'Course management & enrollment tracking' },
              { icon: '✅', text: 'Quizzes, assignments & automated grading' },
              { icon: '📊', text: 'Real-time analytics & performance insights' },
              { icon: '🔔', text: 'Smart notifications for every event' },
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
          <div className="auth-box-title">Welcome back 👋</div>
          <div className="auth-box-sub">Sign in to your UniCore account</div>

          {error && (
            <div className="alert alert-error" onClick={() => setError('')}>
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email address</label>
              <input className="form-control" type="email" name="email" value={form.email}
                onChange={handleChange} placeholder="you@university.edu" required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input className="form-control" type="password" name="password" value={form.password}
                onChange={handleChange} placeholder="••••••••" required />
            </div>
            <button className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: 4 }} disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          <div className="demo-strip">
            <div className="demo-strip-label">Try a demo account</div>
            <div className="demo-btns">
              {DEMO.map(d => (
                <button key={d.label} type="button" className="demo-btn"
                  onClick={() => handleDemoLogin(d)}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="auth-footer">
            Don't have an account? <Link to="/register">Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
