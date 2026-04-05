import React from 'react';
import { KpiCard } from '../components/KpiCard';
import { StatusBadge } from '../components/Table';
import { Icon } from '../components/Icon';
import { useAuth } from '../context/AuthContext';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import { studentCourses, deadlines } from '../data/mockData';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-card px-3 py-2 text-xs">
        <p className="text-gray-500 mb-0.5">{label}</p>
        <p className="font-semibold text-gray-900">{payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

const radarData = [
  { subject: 'Distributed Sys.', score: 88 },
  { subject: 'OS', score: 74 },
  { subject: 'Math', score: 91 },
  { subject: 'DSA', score: 95 },
  { subject: 'Networks', score: 79 },
];

const attendanceByCourse = [
  { code: 'CS401', title: 'Distributed Systems', attended: 22, total: 24 },
  { code: 'CS305', title: 'Operating Systems', attended: 19, total: 22 },
  { code: 'MA201', title: 'Engineering Mathematics', attended: 21, total: 23 },
  { code: 'CS210', title: 'Data Structures', attended: 20, total: 21 },
];

const attendanceByDate = [
  {
    date: 'Apr 04, 2026',
    sessions: [
      { course: 'CS401', slot: '10:00-11:00', status: 'Present' },
      { course: 'CS210', slot: '14:00-15:30', status: 'Present' },
    ],
  },
  {
    date: 'Apr 03, 2026',
    sessions: [
      { course: 'MA201', slot: '11:00-12:00', status: 'Present' },
      { course: 'CS305', slot: '10:00-11:00', status: 'Absent' },
    ],
  },
  {
    date: 'Apr 02, 2026',
    sessions: [
      { course: 'CS401', slot: '10:00-11:00', status: 'Present' },
    ],
  },
  {
    date: 'Apr 01, 2026',
    sessions: [
      { course: 'CS210', slot: '14:00-15:30', status: 'Present' },
    ],
  },
];

export function StudentHome() {
  const { profile } = useAuth();
  const displayName = profile?.full_name || 'Student';
  const totalAttended = attendanceByCourse.reduce((sum, item) => sum + item.attended, 0);
  const totalClasses = attendanceByCourse.reduce((sum, item) => sum + item.total, 0);
  const attendancePercent = totalClasses ? Math.round((totalAttended / totalClasses) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Welcome strip */}
      <div className="card p-5 flex items-center justify-between bg-gradient-to-r from-primary-600 to-primary-700 border-primary-600 text-white">
        <div>
          <p className="text-xs text-primary-100 mb-0.5">Welcome back</p>
          <h2 className="text-base font-semibold">{displayName}</h2>
          <p className="text-xs text-primary-100 mt-0.5">Computer Science — Semester VI</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold">8.4</div>
          <div className="text-xs text-primary-100">Current CGPA</div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Enrolled Courses" value="4" icon="BookOpen" />
        <KpiCard label="Pending Tasks" value="3" icon="ClipboardList" />
        <KpiCard label="Avg. Score" value="87.0" change="+3.2" up icon="Award" />
        <KpiCard label="Attendance" value={`${attendancePercent}%`} change="+1%" up icon="Check" />
      </div>

      {/* Attendance records */}
      <div className="grid xl:grid-cols-3 gap-4">
        <div className="card p-5 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Attendance Record</h3>
              <p className="text-xs text-gray-400 mt-0.5">Course-wise attendance summary</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-900">{attendancePercent}%</p>
              <p className="text-xs text-gray-400">Overall</p>
            </div>
          </div>

          <div className="space-y-3">
            {attendanceByCourse.map((item) => {
              const percent = Math.round((item.attended / item.total) * 100);
              return (
                <div key={item.code} className="border border-gray-100 rounded-xl p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs font-mono text-gray-400">{item.code}</p>
                      <p className="text-sm font-medium text-gray-900">{item.title}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{percent}%</p>
                      <p className="text-xs text-gray-400">{item.attended}/{item.total} classes</p>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${percent >= 85 ? 'bg-green-500' : percent >= 75 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Date-wise Attendance</h3>
          <p className="text-xs text-gray-400 mb-4">Daily class attendance records</p>
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {attendanceByDate.map((day) => (
              <div key={day.date} className="border border-gray-100 rounded-lg p-3">
                <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  <Icon name="CalendarDays" size={12} />
                  {day.date}
                </p>
                <div className="space-y-2">
                  {day.sessions.map((entry, index) => (
                    <div key={`${day.date}-${entry.course}-${index}`} className="flex items-center justify-between bg-gray-50 rounded-md px-2.5 py-2">
                      <div>
                        <p className="text-xs font-medium text-gray-900">{entry.course}</p>
                        <p className="text-[11px] text-gray-500">Slot: {entry.slot}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${entry.status === 'Present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {entry.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Courses + Deadlines */}
      <div className="grid xl:grid-cols-3 gap-4">
        {/* Enrolled courses */}
        <div className="card p-5 xl:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Enrolled Courses</h3>
              <p className="text-xs text-gray-400 mt-0.5">Spring 2025</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {studentCourses.map((c) => (
              <div key={c.id} className="border border-gray-100 rounded-xl p-4 hover:border-primary-200 hover:bg-primary-50/30 transition-colors cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-mono text-gray-400">{c.id}</span>
                  <span className="text-xs text-gray-400">{c.credits} cr</span>
                </div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">{c.title}</h4>
                <p className="text-xs text-gray-400 mb-3">{c.faculty}</p>

                {/* Progress */}
                <div className="mb-1.5">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-medium text-gray-700">{c.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${c.progress >= 80 ? 'bg-green-500' : 'bg-primary-500'}`}
                      style={{ width: `${c.progress}%` }}
                    />
                  </div>
                </div>

                <p className="text-xs text-gray-400">
                  {c.next === 'Completed' ? (
                    <span className="text-green-600 font-medium">Completed</span>
                  ) : (
                    <>Next deadline: <span className="text-gray-600 font-medium">{c.next}</span></>
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Deadlines + notifications */}
        <div className="flex flex-col gap-4">
          {/* Upcoming deadlines */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Upcoming Deadlines</h3>
            <div className="flex flex-col gap-3">
              {deadlines.map((d, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                    d.priority === 'High' ? 'bg-red-500' : 'bg-amber-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">{d.task}</p>
                    <p className="text-xs text-gray-400">{d.course} · {d.due}</p>
                  </div>
                  <StatusBadge status={d.priority} />
                </div>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Notifications</h3>
            <div className="flex flex-col gap-3">
              {[
                { title: 'Assignment graded', desc: 'OS Lab 5 — Score: 74/100', time: '2h ago', read: false },
                { title: 'New announcement', desc: 'CS401 lecture rescheduled to Friday', time: '5h ago', read: false },
                { title: 'Deadline reminder', desc: 'Math Problem Set due tomorrow', time: '1d ago', read: true },
              ].map((n, i) => (
                <div key={i} className={`flex items-start gap-2.5 ${!n.read ? '' : 'opacity-60'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${!n.read ? 'bg-primary-500' : 'bg-gray-200'}`} />
                  <div>
                    <p className="text-xs font-medium text-gray-900">{n.title}</p>
                    <p className="text-xs text-gray-400">{n.desc}</p>
                    <p className="text-xs text-gray-300 mt-0.5">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Performance chart */}
      <div className="grid xl:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-gray-900">Subject Performance</h3>
            <p className="text-xs text-gray-400 mt-0.5">Scores across enrolled courses</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#E2E8F0" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#94A3B8' }} />
              <Radar dataKey="score" stroke="#2563EB" fill="#2563EB" fillOpacity={0.1} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-gray-900">Score Trend</h3>
            <p className="text-xs text-gray-400 mt-0.5">Weekly score progression</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart
              data={[
                { week: 'W1', score: 72 },
                { week: 'W2', score: 78 },
                { week: 'W3', score: 75 },
                { week: 'W4', score: 83 },
                { week: 'W5', score: 88 },
                { week: 'W6', score: 87 },
              ]}
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="score" stroke="#2563EB" strokeWidth={2} dot={{ fill: '#2563EB', r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
