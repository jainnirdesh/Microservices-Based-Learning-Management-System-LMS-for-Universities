import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { analyticsAPI } from '../services/api.js';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const PALETTE = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        if (user.role === 'admin') {
          const res = await analyticsAPI.adminOverview();
          setData(res.data.data);
        } else if (user.role === 'faculty') {
          const res = await analyticsAPI.facultyAnalytics(user._id);
          setData(res.data.data);
        } else {
          const res = await analyticsAPI.studentAnalytics(user._id);
          setData(res.data.data);
        }
      } catch {}
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) return (
    <div className="loading-page">
      <div className="spinner" />
      <span>Loading your dashboard…</span>
    </div>
  );

  return (
    <div>
      {user.role === 'admin' && <AdminDash data={data} user={user} />}
      {user.role === 'faculty' && <FacultyDash data={data} user={user} />}
      {user.role === 'student' && <StudentDash data={data} user={user} />}
    </div>
  );
}

/* ── Admin Dashboard ─────────────────────────────────────── */
function AdminDash({ data, user }) {
  const u = data?.users || {};
  const c = data?.courses || {};
  const a = data?.assessments || {};

  const enrollmentTrend = [
    { month: 'Aug', enrolled: 42 }, { month: 'Sep', enrolled: 98 },
    { month: 'Oct', enrolled: 135 }, { month: 'Nov', enrolled: 162 },
    { month: 'Dec', enrolled: 148 }, { month: 'Jan', enrolled: 190 },
    { month: 'Feb', enrolled: c.totalEnrollments || 210 },
  ];

  const userBreakdown = [
    { name: 'Students', value: u.students || 0 },
    { name: 'Faculty', value: u.faculty || 0 },
    { name: 'Admins', value: (u.total || 0) - (u.students || 0) - (u.faculty || 0) },
  ];

  const assessmentData = [
    { name: 'Assignments', count: a.totalAssignments || 0 },
    { name: 'Quizzes', count: a.totalQuizzes || 0 },
    { name: 'Submissions', count: a.totalSubmissions || 0 },
  ];

  const stats = [
    { label: 'Total Users', value: u.total ?? 0, icon: '👥', bg: '#ede9fe', color: '#7c3aed', trend: '+12%' },
    { label: 'Students', value: u.students ?? 0, icon: '🎓', bg: '#cffafe', color: '#0891b2', trend: '+8%' },
    { label: 'Active Courses', value: c.active ?? 0, icon: '📚', bg: '#d1fae5', color: '#059669', trend: '+3' },
    { label: 'Enrollments', value: c.totalEnrollments ?? 0, icon: '✅', bg: '#fee2e2', color: '#dc2626', trend: '+24%' },
  ];

  return (
    <>
      <div className="welcome-banner">
        <div>
          <div className="welcome-text-heading">Good {timeOfDay()}, {firstName(user.name)} 👋</div>
          <div className="welcome-text-sub">Here's what's happening across UniCore today</div>
        </div>
        <div className="welcome-badge" style={{ display: 'flex', gap: 24 }}>
          <div>
            <div className="welcome-badge-value">{c.total ?? 0}</div>
            <div className="welcome-badge-label">Courses</div>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,.15)' }} />
          <div>
            <div className="welcome-badge-value">{u.faculty ?? 0}</div>
            <div className="welcome-badge-label">Faculty</div>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-card-icon" style={{ background: s.bg, color: s.color }}>
              <span style={{ fontSize: 20 }}>{s.icon}</span>
            </div>
            <div className="label">{s.label}</div>
            <div className="value">{s.value}</div>
            <div className="trend"><span className="up">↑ {s.trend}</span> vs last semester</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Enrollment Trend</div>
              <div className="card-subtitle">Last 7 months</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={enrollmentTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="enroll" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,.1)', fontSize: 13 }} />
              <Area type="monotone" dataKey="enrolled" stroke="#6366f1" strokeWidth={2.5} fill="url(#enroll)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">User Distribution</div>
              <div className="card-subtitle">By role</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={userBreakdown} cx="40%" cy="50%" innerRadius={55} outerRadius={90}
                dataKey="value" paddingAngle={3}>
                {userBreakdown.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 10, border: 'none', fontSize: 13 }} />
              <Legend iconType="circle" iconSize={9} formatter={(v) => <span style={{ fontSize: 13, color: '#64748b' }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Assessment Overview</div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={assessmentData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 13 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 10, border: 'none', fontSize: 13 }} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {assessmentData.map((_, i) => <Cell key={i} fill={PALETTE[i]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

/* ── Faculty Dashboard ───────────────────────────────────── */
function FacultyDash({ data, user }) {
  const courses = data?.coursePerformance || [];
  const totalStudents = courses.reduce((s, c) => s + (c.enrolled || 0), 0);

  const gradeData = courses.map(c => ({
    name: c.courseCode || 'N/A',
    avg: c.avgGrade || 0,
    enrolled: c.enrolled || 0,
  }));

  return (
    <>
      <div className="welcome-banner">
        <div>
          <div className="welcome-text-heading">Good {timeOfDay()}, Prof. {firstName(user.name)} 👋</div>
          <div className="welcome-text-sub">Here's a summary of your teaching portfolio</div>
        </div>
        <div className="welcome-badge">
          <div className="welcome-badge-value">{data?.totalCourses ?? 0}</div>
          <div className="welcome-badge-label">Active Courses</div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}>📚</div>
          <div className="label">Courses Teaching</div>
          <div className="value">{data?.totalCourses ?? 0}</div>
          <div className="trend">This semester</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#cffafe', color: '#0891b2' }}>👥</div>
          <div className="label">Total Students</div>
          <div className="value">{totalStudents}</div>
          <div className="trend"><span className="up">Across all courses</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#d1fae5', color: '#059669' }}>🏆</div>
          <div className="label">Avg Class Grade</div>
          <div className="value">
            {courses.length
              ? Math.round(courses.reduce((s, c) => s + (c.avgGrade || 0), 0) / courses.length) + '%'
              : '—'}
          </div>
          <div className="trend">Across all courses</div>
        </div>
      </div>

      {gradeData.length > 0 ? (
        <div className="grid-2">
          <div className="card">
            <div className="card-header">
              <div className="card-title">Grade Averages by Course</div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={gradeData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: 'none', fontSize: 13 }} formatter={v => [`${v}%`, 'Avg Grade']} />
                <Bar dataKey="avg" radius={[6, 6, 0, 0]} fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Enrollment by Course</div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={gradeData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={50} />
                <Tooltip contentStyle={{ borderRadius: 10, border: 'none', fontSize: 13 }} formatter={v => [v, 'Students']} />
                <Bar dataKey="enrolled" radius={[0, 6, 6, 0]} fill="#06b6d4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <p>No course data available yet</p>
            <small>Performance data will appear once students start enrolling</small>
          </div>
        </div>
      )}

      {courses.length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-header">
            <div className="card-title">Course Details</div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Enrolled</th>
                  <th>Capacity</th>
                  <th>Fill Rate</th>
                  <th>Avg Grade</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c, i) => {
                  const fill = c.maxStudents ? Math.round((c.enrolled / c.maxStudents) * 100) : 0;
                  return (
                    <tr key={i}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{c.courseCode}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>{c.courseTitle}</div>
                      </td>
                      <td><span className="badge badge-indigo">{c.enrolled}</span></td>
                      <td>{c.maxStudents}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="progress-bar-wrap" style={{ width: 80 }}>
                            <div className="progress-bar-fill"
                              style={{ width: `${fill}%`, background: fill > 80 ? '#ef4444' : '#6366f1' }} />
                          </div>
                          <span style={{ fontSize: 12, color: '#64748b' }}>{fill}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${c.avgGrade >= 70 ? 'badge-green' : 'badge-yellow'}`}>
                          {c.avgGrade}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Student Dashboard ───────────────────────────────────── */
function StudentDash({ data, user }) {
  const progress = data?.courseProgress || [];
  const avgScore = data?.averageScore ?? 0;

  const submissionData = [
    { name: 'Submitted', value: data?.totalSubmissions ?? 0 },
    { name: 'Graded', value: data?.gradedSubmissions ?? 0 },
    { name: 'Pending', value: Math.max(0, (data?.totalSubmissions ?? 0) - (data?.gradedSubmissions ?? 0)) },
  ];

  const radialData = [{ name: 'Score', value: avgScore, fill: '#6366f1' }];

  return (
    <>
      <div className="welcome-banner">
        <div>
          <div className="welcome-text-heading">Hey, {firstName(user.name)} 👋</div>
          <div className="welcome-text-sub">Keep up the great work — here's your academic snapshot</div>
        </div>
        <div className="welcome-badge">
          <div className="welcome-badge-value">{avgScore ? `${avgScore}%` : '—'}</div>
          <div className="welcome-badge-label">Avg Score</div>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { label: 'Enrolled Courses', value: data?.totalEnrollments ?? 0, icon: '📚', bg: '#ede9fe', color: '#7c3aed' },
          { label: 'Total Submissions', value: data?.totalSubmissions ?? 0, icon: '📤', bg: '#cffafe', color: '#0891b2' },
          { label: 'Graded', value: data?.gradedSubmissions ?? 0, icon: '✅', bg: '#d1fae5', color: '#059669' },
          { label: 'Average Score', value: avgScore ? `${avgScore}%` : '—', icon: '🏆', bg: '#fef3c7', color: '#d97706' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-card-icon" style={{ background: s.bg, color: s.color }}>
              <span style={{ fontSize: 20 }}>{s.icon}</span>
            </div>
            <div className="label">{s.label}</div>
            <div className="value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        {progress.length > 0 ? (
          <div className="card">
            <div className="card-header">
              <div className="card-title">Course Progress</div>
              <div className="card-action">{progress.length} enrolled</div>
            </div>
            {progress.map((p, i) => (
              <div key={i} style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{p.courseTitle}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{p.courseCode}</div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: p.progress >= 50 ? '#059669' : '#6366f1' }}>
                    {p.progress}%
                  </div>
                </div>
                <div className="progress-bar-wrap">
                  <div className="progress-bar-fill"
                    style={{
                      width: `${p.progress}%`,
                      background: p.progress >= 75
                        ? 'linear-gradient(90deg,#10b981,#34d399)'
                        : p.progress >= 40
                          ? 'linear-gradient(90deg,#6366f1,#8b5cf6)'
                          : 'linear-gradient(90deg,#f59e0b,#fbbf24)',
                    }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card">
            <div className="empty-state" style={{ padding: '40px 24px' }}>
              <div className="empty-icon">📚</div>
              <p>Not enrolled in any courses yet</p>
              <small>Head to the Courses page to enroll</small>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ flex: 1 }}>
            <div className="card-header">
              <div className="card-title">Submissions Overview</div>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={submissionData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: 'none', fontSize: 13 }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {submissionData.map((_, i) => (
                    <Cell key={i} fill={['#6366f1', '#10b981', '#f59e0b'][i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {avgScore > 0 && (
            <div className="card" style={{ textAlign: 'center' }}>
              <div className="card-title" style={{ marginBottom: 8 }}>Performance Score</div>
              <ResponsiveContainer width="100%" height={140}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="55%" outerRadius="80%"
                  data={radialData} startAngle={90} endAngle={90 - 3.6 * avgScore}>
                  <RadialBar dataKey="value" cornerRadius={8} fill="#6366f1" background={{ fill: '#e0e7ff' }} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#6366f1', marginTop: -100, position: 'relative', zIndex: 1 }}>
                {avgScore}%
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 70 }}>Overall average</div>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Quick Tips</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          {[
            { icon: '📤', title: 'Submit on time', desc: 'Check the Assessments page for upcoming deadlines' },
            { icon: '📊', title: 'Track your grades', desc: 'View graded submissions and improve weak areas' },
            { icon: '💬', title: 'Stay updated', desc: 'Check Notifications for course announcements' },
          ].map(t => (
            <div key={t.title} style={{ background: '#f8fafc', borderRadius: 12, padding: '16px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{t.icon}</div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{t.title}</div>
              <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>{t.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ── Helpers ─────────────────────────────────────────────── */
function firstName(name = '') { return name.split(' ')[0]; }
function timeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

