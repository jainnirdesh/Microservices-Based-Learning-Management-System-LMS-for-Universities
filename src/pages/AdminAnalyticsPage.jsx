import React, { useEffect, useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabaseClient';

export function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeSessionsToday, setActiveSessionsToday] = useState(0);
  const [totalSubjects, setTotalSubjects] = useState(0);
  const [apiHealth, setApiHealth] = useState('0.00');
  const [enrollmentTrend, setEnrollmentTrend] = useState([]);
  const [serviceHealth, setServiceHealth] = useState([]);

  const monthLabels = useMemo(() => {
    const labels = [];
    const now = new Date();
    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(date.toLocaleString('en-US', { month: 'short' }));
    }
    return labels;
  }, []);

  useEffect(() => {
    let mounted = true;

    const timedCount = async (tableName, filterBuilder) => {
      const startedAt = performance.now();
      let query = supabase.from(tableName).select('*', { count: 'exact', head: true });
      if (typeof filterBuilder === 'function') {
        query = filterBuilder(query);
      }
      const { count, error } = await query;
      const elapsedMs = Math.max(1, Math.round(performance.now() - startedAt));
      return { tableName, count: count || 0, error, elapsedMs };
    };

    const fetchAnalytics = async () => {
      setLoading(true);

      const todayIso = new Date().toISOString().slice(0, 10);
      const [usersStats, sessionsStats, subjectsStats, enrollmentsStats] = await Promise.all([
        timedCount('profiles'),
        timedCount('attendance_sessions', (query) => query.eq('class_date', todayIso)),
        timedCount('subjects', (query) => query.eq('is_active', true)),
        timedCount('student_enrollments'),
      ]);

      const checks = [usersStats, sessionsStats, subjectsStats, enrollmentsStats];
      const successfulChecks = checks.filter((item) => !item.error).length;
      const uptime = ((successfulChecks / checks.length) * 100).toFixed(2);

      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('student_enrollments')
        .select('enrolled_at')
        .order('enrolled_at', { ascending: true });

      const trendMap = monthLabels.reduce((acc, label) => {
        acc[label] = 0;
        return acc;
      }, {});

      if (!enrollmentsError && Array.isArray(enrollmentsData)) {
        enrollmentsData.forEach((entry) => {
          const label = new Date(entry.enrolled_at).toLocaleString('en-US', { month: 'short' });
          if (trendMap[label] !== undefined) {
            trendMap[label] += 1;
          }
        });
      }

      const chartData = monthLabels.map((month) => ({
        month,
        students: trendMap[month] || 0,
      }));

      const liveServiceHealth = [
        {
          service: 'User Service',
          uptime: usersStats.error ? 0 : 99.9,
          responseTime: usersStats.elapsedMs,
          lastCheck: 'now',
        },
        {
          service: 'Subject Service',
          uptime: subjectsStats.error ? 0 : 99.9,
          responseTime: subjectsStats.elapsedMs,
          lastCheck: 'now',
        },
        {
          service: 'Enrollment Service',
          uptime: enrollmentsStats.error ? 0 : 99.9,
          responseTime: enrollmentsStats.elapsedMs,
          lastCheck: 'now',
        },
        {
          service: 'Attendance Service',
          uptime: sessionsStats.error ? 0 : 99.9,
          responseTime: sessionsStats.elapsedMs,
          lastCheck: 'now',
        },
      ];

      if (!mounted) return;

      setTotalUsers(usersStats.count || 0);
      setActiveSessionsToday(sessionsStats.count || 0);
      setTotalSubjects(subjectsStats.count || 0);
      setApiHealth(uptime);
      setEnrollmentTrend(chartData);
      setServiceHealth(liveServiceHealth);
      setLoading(false);
    };

    fetchAnalytics();

    return () => {
      mounted = false;
    };
  }, [monthLabels]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Platform-wide metrics and performance</p>
      </div>

      {loading && <p className="text-sm text-gray-500">Loading analytics from Supabase...</p>}

      <div className="grid grid-cols-4 gap-4">
        <div className="card p-4"><p className="text-xs text-gray-500 mb-1">Total Users</p><p className="text-2xl font-bold text-gray-900">{totalUsers.toLocaleString()}</p><p className="text-xs text-gray-400 mt-1">From profiles</p></div>
        <div className="card p-4"><p className="text-xs text-gray-500 mb-1">Active Sessions</p><p className="text-2xl font-bold text-gray-900">{activeSessionsToday.toLocaleString()}</p><p className="text-xs text-gray-400 mt-1">Attendance sessions today</p></div>
        <div className="card p-4"><p className="text-xs text-gray-500 mb-1">Total Subjects</p><p className="text-2xl font-bold text-gray-900">{totalSubjects.toLocaleString()}</p><p className="text-xs text-gray-400 mt-1">Active subjects</p></div>
        <div className="card p-4"><p className="text-xs text-gray-500 mb-1">API Health</p><p className="text-2xl font-bold text-green-600">{apiHealth}%</p><p className="text-xs text-gray-400 mt-1">Realtime query success</p></div>
      </div>

      <div className="grid xl:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Enrollment Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={enrollmentTrend}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} />
              <Tooltip />
              <Area type="monotone" dataKey="students" stroke="#2563EB" strokeWidth={2} fill="url(#grad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Service Health</h3>
          <div className="space-y-3">
            {serviceHealth.map((s, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-900">{s.service}</p>
                  <span className="text-xs text-green-600 font-semibold">{Number(s.uptime).toFixed(2)}%</span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${s.uptime}%` }} />
                </div>
                <p className="text-xs text-gray-400 mt-1">{s.responseTime}ms response • {s.lastCheck}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
