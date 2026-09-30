import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
const AuthContext = createContext(null);

function api(path, { token, ...options } = {}) {
  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  }).then(async (res) => {
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) throw new Error(data?.error || 'Request failed');
    return data;
  });
}

function AuthProvider({ children }) {
  const [session, setSession] = useState(() => JSON.parse(localStorage.getItem('unicore-session') || 'null'));
  const login = async (email, password) => {
    const next = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    localStorage.setItem('unicore-session', JSON.stringify(next));
    setSession(next);
    return next;
  };
  const register = async (payload) => {
    const next = await api('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
    localStorage.setItem('unicore-session', JSON.stringify(next));
    setSession(next);
    return next;
  };
  const logout = () => {
    localStorage.removeItem('unicore-session');
    setSession(null);
  };
  const value = useMemo(() => ({ session, user: session?.user, token: session?.token, login, register, logout }), [session]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  return useContext(AuthContext);
}

function rolePath(role) {
  if (role === 'ADMIN') return '/admin';
  if (role === 'INSTRUCTOR') return '/instructor';
  return '/student';
}

function Protected({ roles, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={rolePath(user.role)} replace />;
  return children;
}

function Shell({ children }) {
  const { user, logout } = useAuth();
  return (
    <div>
      <nav className="nav">
        <Link className="brand" to="/">UniCore LMS</Link>
        <div className="nav-links">
          <Link to="/courses">Courses</Link>
          {user && <Link to={rolePath(user.role)}>Dashboard</Link>}
          {user ? <button onClick={logout}>Logout</button> : <Link className="button" to="/login">Login</Link>}
        </div>
      </nav>
      {children}
    </div>
  );
}

function Landing() {
  return (
    <Shell>
      <main className="hero">
        <section>
          <p className="eyebrow">Java Spring Boot Microservices + React</p>
          <h1>UniCore LMS</h1>
          <p className="hero-copy">A portfolio-ready learning platform with JWT auth, role dashboards, course enrollment, assessments, automatic scoring, and notifications.</p>
          <div className="actions">
            <Link className="button primary" to="/courses">Explore courses</Link>
            <Link className="button" to="/register">Create account</Link>
          </div>
        </section>
        <section className="hero-panel">
          <div className="metric"><span>5</span><small>Spring services</small></div>
          <div className="metric"><span>3</span><small>Role journeys</small></div>
          <div className="metric"><span>JWT</span><small>Protected APIs</small></div>
        </section>
      </main>
    </Shell>
  );
}

function AuthForm({ mode }) {
  const isRegister = mode === 'register';
  const auth = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'STUDENT' });
  const [error, setError] = useState('');
  const submit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const session = isRegister ? await auth.register(form) : await auth.login(form.email, form.password);
      navigate(rolePath(session.user.role));
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <Shell>
      <main className="auth-card">
        <h1>{isRegister ? 'Create your account' : 'Welcome back'}</h1>
        <form onSubmit={submit} className="form">
          {isRegister && <input required placeholder="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />}
          <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input required type="password" minLength="6" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {isRegister && (
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="STUDENT">Student</option>
              <option value="INSTRUCTOR">Instructor</option>
              <option value="ADMIN">Admin</option>
            </select>
          )}
          {error && <p className="error">{error}</p>}
          <button className="button primary">{isRegister ? 'Register' : 'Login'}</button>
        </form>
      </main>
    </Shell>
  );
}

function Courses() {
  const { token, user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [q, setQ] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    api(`/courses${q ? `?q=${encodeURIComponent(q)}` : ''}`).then(setCourses).catch((e) => setError(e.message));
  }, [q]);
  const enroll = async (course) => {
    if (!user) return setError('Login as a student to enroll');
    await api(`/courses/${course.id}/enroll`, { method: 'POST', token, body: JSON.stringify({ studentId: user.id, studentName: user.fullName }) });
    setCourses(await api('/courses'));
  };
  return (
    <Shell>
      <main className="page">
        <div className="page-head"><h1>Course Catalog</h1><input placeholder="Search courses or categories" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        {error && <p className="error">{error}</p>}
        <div className="grid">
          {courses.map((course) => (
            <article className="card" key={course.id}>
              <span className="pill">{course.category}</span>
              <h2>{course.title}</h2>
              <p>{course.description}</p>
              <small>{course.instructorName || 'Instructor'} · {course.level}</small>
              <div className="actions">
                <Link className="button" to={`/courses/${course.id}`}>Details</Link>
                {user?.role === 'STUDENT' && <button className="button primary" onClick={() => enroll(course)}>Enroll</button>}
              </div>
            </article>
          ))}
        </div>
      </main>
    </Shell>
  );
}

function CourseDetails() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  useEffect(() => { api(`/courses/${id}`).then(setCourse); }, [id]);
  if (!course) return <Shell><main className="page">Loading course...</main></Shell>;
  return (
    <Shell>
      <main className="page detail">
        <span className="pill">{course.category}</span>
        <h1>{course.title}</h1>
        <p>{course.description}</p>
        <h2>Modules</h2>
        {(course.modules || []).map((module, i) => (
          <section className="card" key={module.title + i}>
            <h3>{module.title}</h3>
            <p>{module.summary}</p>
            {(module.lessons || []).map((lesson) => <p key={lesson.title}>Lesson: {lesson.title} · {lesson.durationMinutes} min</p>)}
          </section>
        ))}
      </main>
    </Shell>
  );
}

function DashboardFrame({ title, links, children }) {
  return (
    <Shell>
      <main className="dashboard">
        <aside>{links.map((item) => <Link key={item.to} to={item.to}>{item.label}</Link>)}</aside>
        <section><h1>{title}</h1>{children}</section>
      </main>
    </Shell>
  );
}

function Stat({ label, value }) {
  return <div className="stat"><strong>{value ?? 0}</strong><span>{label}</span></div>;
}

function StudentDashboard() {
  const { user, token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [results, setResults] = useState([]);
  const [notifications, setNotifications] = useState([]);
  useEffect(() => {
    api('/courses').then((all) => setCourses(all.filter((c) => (c.enrollments || []).some((e) => e.studentId === user.id))));
    api(`/results/student/${user.id}`, { token }).then(setResults).catch(() => setResults([]));
    api(`/notifications/user/${user.id}`, { token }).then(setNotifications).catch(() => setNotifications([]));
  }, [token, user.id]);
  const average = results.length ? Math.round(results.reduce((sum, r) => sum + r.scorePercent, 0) / results.length) : 0;
  return (
    <DashboardFrame title="Student Dashboard" links={[{ to: '/student', label: 'Overview' }, { to: '/courses', label: 'Catalog' }]}>
      <div className="stats"><Stat label="Enrolled courses" value={courses.length} /><Stat label="Assessments" value={results.length} /><Stat label="Average score" value={`${average}%`} /></div>
      <h2>Learning progress</h2>
      <ResponsiveContainer width="100%" height={260}><BarChart data={courses.map((c) => ({ name: c.title, progress: (c.enrollments || []).find((e) => e.studentId === user.id)?.progress || 0 }))}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="progress" fill="#2563eb" /></BarChart></ResponsiveContainer>
      <h2>Recent activity</h2>
      <div className="list">{notifications.map((n) => <p key={n.id}>{n.title}: {n.message}</p>)}</div>
    </DashboardFrame>
  );
}

function InstructorDashboard() {
  const { user, token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', category: 'Programming', level: 'Intermediate' });
  useEffect(() => {
    api(`/courses/instructor/${user.id}`, { token }).then(setCourses).catch(() => setCourses([]));
    api(`/assessments/instructor/${user.id}`, { token }).then(setAssessments).catch(() => setAssessments([]));
  }, [token, user.id]);
  const createCourse = async (event) => {
    event.preventDefault();
    await api('/courses', { method: 'POST', token, body: JSON.stringify({ ...form, instructorId: user.id, instructorName: user.fullName, modules: [] }) });
    setForm({ title: '', description: '', category: 'Programming', level: 'Intermediate' });
    setCourses(await api(`/courses/instructor/${user.id}`, { token }));
  };
  return (
    <DashboardFrame title="Instructor Dashboard" links={[{ to: '/instructor', label: 'Overview' }, { to: '/courses', label: 'Catalog' }]}>
      <div className="stats"><Stat label="Courses created" value={courses.length} /><Stat label="Students" value={courses.reduce((sum, c) => sum + (c.enrollments || []).length, 0)} /><Stat label="Assessments" value={assessments.length} /></div>
      <form className="form panel" onSubmit={createCourse}>
        <h2>Create Course</h2>
        <input required placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input required placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <textarea required placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <button className="button primary">Create course</button>
      </form>
      <div className="table">{courses.map((c) => <p key={c.id}><strong>{c.title}</strong><span>{(c.enrollments || []).length} students</span></p>)}</div>
    </DashboardFrame>
  );
}

function AdminDashboard() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [courseStats, setCourseStats] = useState({});
  const [assessmentStats, setAssessmentStats] = useState({});
  useEffect(() => {
    api('/users', { token }).then(setUsers).catch(() => setUsers([]));
    api('/courses/stats').then(setCourseStats);
    api('/assessments/stats').then(setAssessmentStats);
  }, [token]);
  return (
    <DashboardFrame title="Admin Dashboard" links={[{ to: '/admin', label: 'Overview' }, { to: '/courses', label: 'Courses' }]}>
      <div className="stats">
        <Stat label="Total users" value={users.length} />
        <Stat label="Students" value={users.filter((u) => u.role === 'STUDENT').length} />
        <Stat label="Instructors" value={users.filter((u) => u.role === 'INSTRUCTOR').length} />
        <Stat label="Courses" value={courseStats.totalCourses} />
        <Stat label="Enrollments" value={courseStats.enrollments} />
        <Stat label="Average score" value={`${assessmentStats.averageScore || 0}%`} />
      </div>
      <div className="table">{users.map((u) => <p key={u.id}><strong>{u.fullName}</strong><span>{u.email}</span><span>{u.role}</span></p>)}</div>
    </DashboardFrame>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<AuthForm mode="login" />} />
          <Route path="/register" element={<AuthForm mode="register" />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetails />} />
          <Route path="/student/*" element={<Protected roles={['STUDENT']}><StudentDashboard /></Protected>} />
          <Route path="/instructor/*" element={<Protected roles={['INSTRUCTOR']}><InstructorDashboard /></Protected>} />
          <Route path="/admin/*" element={<Protected roles={['ADMIN']}><AdminDashboard /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
