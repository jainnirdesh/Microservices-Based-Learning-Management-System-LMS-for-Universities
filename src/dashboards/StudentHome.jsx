import React, { useState, useEffect } from 'react';
import { KpiCard } from '../components/KpiCard';
import { StatusBadge } from '../components/Table';
import { Icon } from '../components/Icon';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';

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

export function StudentHome() {
  const { profile } = useAuth();
  const displayName = profile?.full_name || 'Student';
  const [cgpa, setCgpa] = useState('0.0');
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [attendanceByCourse, setAttendanceByCourse] = useState([]);
  const [attendanceByDate, setAttendanceByDate] = useState([]);
  const [radarData, setRadarData] = useState([]);
  const [scoreTrendData, setScoreTrendData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) return;
    
    const fetchDashboardData = async () => {
      try {
        // Fetch enrolled subjects
        const { data: enrollments } = await supabase
          .from('student_enrollments')
          .select(`
            id,
            section_id,
            sections!inner(id, code, name, academic_year),
            subject_offerings!inner(id, subject_id, subjects!inner(id, code, name, credits))
          `)
          .eq('student_id', profile.id)
          .eq('status', 'active');

        if (enrollments && enrollments.length > 0) {
          // Fetch grades for all enrolled subjects
          const subjectIds = enrollments.map(e => e.subject_offerings.subject_id);
          const { data: grades } = await supabase
            .from('student_grades')
            .select('*')
            .eq('student_id', profile.id)
            .in('subject_id', subjectIds);

          // Calculate CGPA
          if (grades && grades.length > 0) {
            const avgScore = grades.reduce((sum, g) => sum + (g.score / g.max_score) * 10, 0) / grades.length;
            setCgpa(avgScore.toFixed(1));
          }

          // Transform enrolled courses data
          const coursesData = enrollments.map(enrollment => {
            const subjectGrades = grades?.filter(g => g.subject_id === enrollment.subject_offerings.subject_id) || [];
            const avgGrade = subjectGrades.length > 0
              ? subjectGrades.reduce((sum, g) => sum + g.score, 0) / subjectGrades.length
              : 0;
            return {
              id: enrollment.subject_offerings.subjects.code,
              title: enrollment.subject_offerings.subjects.name,
              credits: enrollment.subject_offerings.subjects.credits,
              faculty: 'Faculty',
              progress: Math.min(100, Math.round((subjectGrades.length / 5) * 100)),
              next: subjectGrades.length > 0 ? `Score: ${avgGrade.toFixed(1)}/100` : 'No grades yet',
            };
          });
          setEnrolledCourses(coursesData);

          // Fetch attendance data
          const { data: attendanceRecords } = await supabase
            .from('attendance_records')
            .select(`
              id,
              student_id,
              status,
              marked_at,
              attendance_sessions!inner(
                id,
                class_date,
                start_time,
                end_time,
                subject_offerings!inner(subjects!inner(code, name))
              )
            `)
            .eq('student_id', profile.id);

          if (attendanceRecords && attendanceRecords.length > 0) {
            // Group by course
            const byCourseMemo = {};
            attendanceRecords.forEach(rec => {
              const courseCode = rec.attendance_sessions.subject_offerings.subjects.code;
              const courseTitle = rec.attendance_sessions.subject_offerings.subjects.name;
              if (!byCourseMemo[courseCode]) {
                byCourseMemo[courseCode] = {
                  code: courseCode,
                  title: courseTitle,
                  attended: 0,
                  total: 0
                };
              }
              byCourseMemo[courseCode].total += 1;
              if (rec.status === 'present') {
                byCourseMemo[courseCode].attended += 1;
              }
            });
            setAttendanceByCourse(Object.values(byCourseMemo));

            // Group by date
            const byDateMemo = {};
            attendanceRecords.forEach(rec => {
              const dateStr = new Date(rec.attendance_sessions.class_date).toLocaleDateString('en-US', {
                month: 'short',
                day: '2-digit',
                year: 'numeric',
              });
              if (!byDateMemo[dateStr]) {
                byDateMemo[dateStr] = { date: dateStr, sessions: [] };
              }
              byDateMemo[dateStr].sessions.push({
                course: rec.attendance_sessions.subject_offerings.subjects.code,
                slot: `${rec.attendance_sessions.start_time || '09:00'}-${rec.attendance_sessions.end_time || '10:00'}`,
                status: rec.status.charAt(0).toUpperCase() + rec.status.slice(1),
              });
            });
            const dates = Object.values(byDateMemo)
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .slice(0, 10);
            setAttendanceByDate(dates);
          }

          // Build radar data from grades
          if (grades && grades.length > 0) {
            const radarItems = grades.slice(0, 5).map(g => {
              const subject = enrollments.find(e => e.subject_offerings.subject_id === g.subject_id);
              return {
                subject: (subject?.subject_offerings.subjects.name || 'Subject').substring(0, 12),
                score: Math.round((g.score / g.max_score) * 100),
              };
            });
            setRadarData(radarItems);

            // Score trend (mock weekly data for now)
            const trend = [
              { week: 'W1', score: Math.max(60, grades[0]?.score - 15 || 70) },
              { week: 'W2', score: Math.max(60, grades[0]?.score - 10 || 75) },
              { week: 'W3', score: Math.max(60, grades[0]?.score - 5 || 80) },
              { week: 'W4', score: grades[0]?.score || 85 },
              { week: 'W5', score: Math.min(100, grades[0]?.score + 2 || 87) },
              { week: 'W6', score: Math.round(grades.reduce((sum, g) => sum + g.score, 0) / grades.length) },
            ];
            setScoreTrendData(trend);
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [profile?.id]);

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
          <div className="text-2xl font-semibold">{cgpa}</div>
          <div className="text-xs text-primary-100">Current CGPA</div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Enrolled Courses" value={enrolledCourses.length.toString()} icon="BookOpen" />
        <KpiCard label="Pending Tasks" value="3" icon="ClipboardList" />
        <KpiCard label="Avg. Score" value={cgpa} change="+3.2" up icon="Award" />
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

          {loading ? (
            <div className="text-sm text-gray-500">Loading courses...</div>
          ) : enrolledCourses.length === 0 ? (
            <div className="text-sm text-gray-400">No enrolled courses found</div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {enrolledCourses.map((c) => (
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
                      <>Next: <span className="text-gray-600 font-medium">{c.next}</span></>
                    )}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Deadlines + notifications */}
        <div className="flex flex-col gap-4">
          {/* Upcoming deadlines */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Upcoming Deadlines</h3>
            <div className="flex flex-col gap-3">
              <div className="text-xs text-gray-400">No upcoming deadlines</div>
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
          {loading || radarData.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">
              Loading performance data...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <Radar dataKey="score" stroke="#2563EB" fill="#2563EB" fillOpacity={0.1} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-5">
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-gray-900">Score Trend</h3>
            <p className="text-xs text-gray-400 mt-0.5">Weekly score progression</p>
          </div>
          {loading || scoreTrendData.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">
              Loading trend data...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart
                data={scoreTrendData}
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="score" stroke="#2563EB" strokeWidth={2} dot={{ fill: '#2563EB', r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
