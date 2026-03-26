import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { analyticsAPI } from '../services/api.js';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Cell, Legend } from 'recharts';

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Analytics() {
  const { user } = useAuth();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [trend, grades, health] = await Promise.allSettled([
          analyticsAPI.enrollmentTrend(),
          analyticsAPI.gradeDistribution(),
          analyticsAPI.systemHealth(),
        ]);
        setData({
          trend: trend.status === 'fulfilled' ? trend.value.data.data : [],
          grades: grades.status === 'fulfilled' ? grades.value.data.data : [],
          health: health.status === 'fulfilled' ? health.value.data.data : null,
        });
      } catch {}
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) return (
    <div className="loading-page">
      <div className="spinner" />
      <span>Loading analytics…</span>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-title">Analytics</div>
          <div className="page-subtitle">Platform-wide insights and performance metrics</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Enrollment Trend</div>
              <div className="card-subtitle">Monthly enrollments vs completions</div>
            </div>
          </div>
          {data.trend?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.trend} margin={{ left: -20, right: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,.1)', fontSize: 13 }} />
                <Legend formatter={(v) => <span style={{ fontSize: 13, color: '#64748b' }}>{v}</span>} />
                <Line type="monotone" dataKey="enrollments" stroke="#6366f1" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="completions" stroke="#10b981" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <div className="empty-icon">📈</div>
              <p>No trend data available yet</p>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Grade Distribution</div>
              <div className="card-subtitle">Across all assessments</div>
            </div>
          </div>
          {data.grades?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.grades} margin={{ left: -20, right: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="grade" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: 'none', fontSize: 13 }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {data.grades.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <div className="empty-icon">🏆</div>
              <p>No grade data available yet</p>
            </div>
          )}
        </div>
      </div>

      {data.health && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">System Health</div>
              <div className="card-subtitle">Last checked: {new Date(data.health.checkedAt).toLocaleString()}</div>
            </div>
            <span className={`badge ${data.health.overallStatus === 'HEALTHY' ? 'badge-green' : 'badge-red'}`}
              style={{ fontSize: 13, padding: '5px 14px' }}>
              {data.health.overallStatus}
            </span>
          </div>
          <div className="health-grid">
            {data.health.services?.map((svc) => (
              <div key={svc.name} className="health-card">
                <div className={`health-status-dot ${svc.status === 'UP' ? 'up' : 'down'}`} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{svc.name}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                    {svc.status} {svc.responseTime ? `· ${svc.responseTime}` : ''}
                  </div>
                  {svc.error && <div style={{ fontSize: 12, color: '#ef4444', marginTop: 2 }}>{svc.error}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
