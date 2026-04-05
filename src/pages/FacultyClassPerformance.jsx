import React, { useEffect, useMemo, useState } from 'react';
import { LineChart, Line, PieChart, Pie, Cell, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export function FacultyClassPerformance() {
  const { profile } = useAuth();
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [classPerformance, setClassPerformance] = useState([]);
  const [courseComparison, setCourseComparison] = useState([]);
  const [gradeDistribution, setGradeDistribution] = useState([]);
  const [supportStudents, setSupportStudents] = useState([]);
  const [overview, setOverview] = useState({
    avgClassScore: 0,
    passRate: 0,
    totalStudents: 0,
    engagementRate: 0,
  });

  useEffect(() => {
    let mounted = true;

    const fetchPerformanceData = async () => {
      if (!profile?.id) return;

      setLoading(true);
      setErrorMessage('');

      const isTeacher = profile.role === 'teacher';

      let offeringsQuery = supabase
        .from('subject_offerings')
        .select('id, school_id, section_id, subject_id, teacher_id');

      if (isTeacher) {
        offeringsQuery = offeringsQuery.eq('teacher_id', profile.id);
      } else if (profile.school_id) {
        offeringsQuery = offeringsQuery.eq('school_id', profile.school_id);
      }

      const { data: offerings, error: offeringsError } = await offeringsQuery;
      if (offeringsError) {
        if (mounted) {
          setErrorMessage(offeringsError.message || 'Failed to load offerings.');
          setLoading(false);
        }
        return;
      }

      const subjectIds = Array.from(new Set((offerings || []).map((item) => item.subject_id).filter(Boolean)));
      const sectionIds = Array.from(new Set((offerings || []).map((item) => item.section_id).filter(Boolean)));

      const [{ data: subjectsData }, { data: gradesData }, { data: enrollmentsData }, { data: attendanceRecordsData }] = await Promise.all([
        subjectIds.length
          ? supabase.from('subjects').select('id, code, name').in('id', subjectIds)
          : Promise.resolve({ data: [] }),
        subjectIds.length
          ? supabase
              .from('student_grades')
              .select('subject_id, student_id, score, max_score, evaluated_at')
              .in('subject_id', subjectIds)
          : Promise.resolve({ data: [] }),
        sectionIds.length
          ? supabase
              .from('student_enrollments')
              .select('section_id, student_id, status')
              .in('section_id', sectionIds)
          : Promise.resolve({ data: [] }),
        sectionIds.length
          ? supabase
              .from('attendance_records')
              .select('student_id, status, session_id, attendance_sessions!inner(section_id)')
              .in('attendance_sessions.section_id', sectionIds)
          : Promise.resolve({ data: [] }),
      ]);

      const subjectMap = (subjectsData || []).reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {});

      const gradesBySubject = (gradesData || []).reduce((acc, row) => {
        if (!acc[row.subject_id]) acc[row.subject_id] = [];
        acc[row.subject_id].push(row);
        return acc;
      }, {});

      const activeEnrollments = (enrollmentsData || []).filter((row) => row.status === 'active');
      const studentsBySection = activeEnrollments.reduce((acc, row) => {
        if (!acc[row.section_id]) acc[row.section_id] = new Set();
        acc[row.section_id].add(row.student_id);
        return acc;
      }, {});

      const sectionIdsBySubject = (offerings || []).reduce((acc, row) => {
        if (!acc[row.subject_id]) acc[row.subject_id] = new Set();
        acc[row.subject_id].add(row.section_id);
        return acc;
      }, {});

      const subjectPerformance = subjectIds.map((subjectId) => {
        const subject = subjectMap[subjectId] || { code: 'SUB', name: 'Subject' };
        const subjectGrades = gradesBySubject[subjectId] || [];

        const avgScore = subjectGrades.length
          ? subjectGrades.reduce((sum, grade) => sum + ((Number(grade.score || 0) / Number(grade.max_score || 100)) * 100), 0) / subjectGrades.length
          : 0;

        const passRate = subjectGrades.length
          ? (subjectGrades.filter((grade) => ((Number(grade.score || 0) / Number(grade.max_score || 100)) * 100) >= 40).length / subjectGrades.length) * 100
          : 0;

        const sections = Array.from(sectionIdsBySubject[subjectId] || []);
        const uniqueStudents = new Set();
        sections.forEach((sectionId) => {
          (studentsBySection[sectionId] || new Set()).forEach((studentId) => uniqueStudents.add(studentId));
        });

        return {
          name: subject.code,
          avgScore: Number(avgScore.toFixed(1)),
          classSize: uniqueStudents.size,
          passRate: Number(passRate.toFixed(1)),
          fullName: subject.name,
        };
      });

      const totalGrades = (gradesData || []).length;
      const overallAvg = totalGrades
        ? (gradesData || []).reduce((sum, grade) => sum + ((Number(grade.score || 0) / Number(grade.max_score || 100)) * 100), 0) / totalGrades
        : 0;
      const overallPassRate = totalGrades
        ? ((gradesData || []).filter((grade) => ((Number(grade.score || 0) / Number(grade.max_score || 100)) * 100) >= 40).length / totalGrades) * 100
        : 0;

      const uniqueStudentsOverall = new Set(activeEnrollments.map((row) => row.student_id));

      const attendanceRows = attendanceRecordsData || [];
      const presentCount = attendanceRows.filter((row) => row.status === 'present').length;
      const engagementRate = attendanceRows.length ? (presentCount / attendanceRows.length) * 100 : 0;

      const gradeBuckets = {
        'A (90-100%)': 0,
        'B (80-89%)': 0,
        'C (70-79%)': 0,
        'D (60-69%)': 0,
        'F (Below 60%)': 0,
      };

      (gradesData || []).forEach((grade) => {
        const percent = (Number(grade.score || 0) / Number(grade.max_score || 100)) * 100;
        if (percent >= 90) gradeBuckets['A (90-100%)'] += 1;
        else if (percent >= 80) gradeBuckets['B (80-89%)'] += 1;
        else if (percent >= 70) gradeBuckets['C (70-79%)'] += 1;
        else if (percent >= 60) gradeBuckets['D (60-69%)'] += 1;
        else gradeBuckets['F (Below 60%)'] += 1;
      });

      const distributionTotal = Object.values(gradeBuckets).reduce((sum, value) => sum + value, 0) || 1;
      const mappedDistribution = Object.entries(gradeBuckets).map(([name, count], index) => ({
        name,
        value: Number(((count / distributionTotal) * 100).toFixed(1)),
        fill: COLORS[index % COLORS.length],
      }));

      const studentAgg = (gradesData || []).reduce((acc, grade) => {
        if (!acc[grade.student_id]) {
          acc[grade.student_id] = { total: 0, count: 0, low: 0 };
        }
        const percent = (Number(grade.score || 0) / Number(grade.max_score || 100)) * 100;
        acc[grade.student_id].total += percent;
        acc[grade.student_id].count += 1;
        if (percent < 60) acc[grade.student_id].low += 1;
        return acc;
      }, {});

      const riskyStudentIds = Object.entries(studentAgg)
        .filter(([, stats]) => stats.count > 0 && (stats.total / stats.count < 70 || stats.low > 0))
        .map(([studentId]) => studentId)
        .slice(0, 6);

      const { data: riskyProfiles } = riskyStudentIds.length
        ? await supabase.from('profiles').select('id, full_name').in('id', riskyStudentIds)
        : { data: [] };

      const riskyProfileMap = (riskyProfiles || []).reduce((acc, row) => {
        acc[row.id] = row.full_name;
        return acc;
      }, {});

      const riskyRows = riskyStudentIds.map((studentId) => {
        const stats = studentAgg[studentId];
        const avg = stats.count ? stats.total / stats.count : 0;
        return {
          name: riskyProfileMap[studentId] || 'Student',
          score: Number(avg.toFixed(1)),
          status: avg < 60 ? 'Critical' : avg < 70 ? 'Warning' : 'At Risk',
        };
      });

      const monthKey = (dateLike) => {
        const dt = new Date(dateLike);
        return `${dt.getFullYear()}-${dt.getMonth() + 1}`;
      };
      const monthLabel = (offset) => {
        const now = new Date();
        const dt = new Date(now.getFullYear(), now.getMonth() + offset, 1);
        return dt.toLocaleString('en-US', { month: 'short' });
      };
      const last3 = [monthLabel(-2), monthLabel(-1), monthLabel(0)];

      const trendRows = subjectPerformance.map((subject) => {
        const grades = (gradesBySubject[subjectIds.find((id) => subjectMap[id]?.code === subject.name)] || []);
        const now = new Date();
        const buckets = {
          [monthKey(new Date(now.getFullYear(), now.getMonth() - 2, 1))]: { total: 0, count: 0 },
          [monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1))]: { total: 0, count: 0 },
          [monthKey(new Date(now.getFullYear(), now.getMonth(), 1))]: { total: 0, count: 0 },
        };

        grades.forEach((grade) => {
          const key = monthKey(grade.evaluated_at);
          if (!buckets[key]) return;
          buckets[key].total += (Number(grade.score || 0) / Number(grade.max_score || 100)) * 100;
          buckets[key].count += 1;
        });

        const sem1Key = monthKey(new Date(now.getFullYear(), now.getMonth() - 2, 1));
        const sem2Key = monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1));
        const sem3Key = monthKey(new Date(now.getFullYear(), now.getMonth(), 1));

        const sem1 = buckets[sem1Key].count ? buckets[sem1Key].total / buckets[sem1Key].count : subject.avgScore;
        const sem2 = buckets[sem2Key].count ? buckets[sem2Key].total / buckets[sem2Key].count : subject.avgScore;
        const sem3 = buckets[sem3Key].count ? buckets[sem3Key].total / buckets[sem3Key].count : subject.avgScore;

        return {
          course: subject.name,
          sem1: Number(sem1.toFixed(1)),
          sem2: Number(sem2.toFixed(1)),
          sem3: Number(sem3.toFixed(1)),
        };
      });

      if (!mounted) return;

      setClassPerformance(subjectPerformance);
      setCourseComparison(trendRows);
      setGradeDistribution(mappedDistribution);
      setSupportStudents(riskyRows);
      setOverview({
        avgClassScore: Number(overallAvg.toFixed(1)),
        passRate: Number(overallPassRate.toFixed(1)),
        totalStudents: uniqueStudentsOverall.size,
        engagementRate: Number(engagementRate.toFixed(1)),
      });
      setLoading(false);
    };

    fetchPerformanceData();

    return () => {
      mounted = false;
    };
  }, [profile]);

  const semesterLabels = useMemo(() => {
    const now = new Date();
    const labels = [];
    for (let i = 2; i >= 0; i -= 1) {
      const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(dt.toLocaleString('en-US', { month: 'short' }));
    }
    return labels;
  }, []);

  return (
    <div className="space-y-6">
      {loading && <p className="text-sm text-gray-500">Loading class performance from Supabase...</p>}
      {errorMessage && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{errorMessage}</p>}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <p className="text-sm text-gray-600">Average Class Score</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{overview.avgClassScore}%</p>
          <p className="text-xs text-blue-600 mt-2">From real grades</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <p className="text-sm text-gray-600">Pass Rate</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{overview.passRate}%</p>
          <p className="text-xs text-green-600 mt-2">Students passing</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
          <p className="text-sm text-gray-600">Total Students</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{overview.totalStudents}</p>
          <p className="text-xs text-purple-600 mt-2">Across active subjects</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-orange-500">
          <p className="text-sm text-gray-600">Class Engagement</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{overview.engagementRate}%</p>
          <p className="text-xs text-orange-600 mt-2">Attendance present rate</p>
        </div>
      </div>

      {/* Performance by Course */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Performance by Course</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Course</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Average Score</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Class Size</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Pass Rate</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Trend</th>
              </tr>
            </thead>
            <tbody>
              {classPerformance.map((course) => (
                <tr key={course.name} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-semibold text-gray-900">{course.name}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${course.avgScore}%` }}
                        ></div>
                      </div>
                      <span className="font-semibold text-gray-900">{course.avgScore}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{course.classSize}</td>
                  <td className="py-3 px-4">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                      {course.passRate}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-green-600 font-bold">Live</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Trends */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Performance Trends (Semester Comparison)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={courseComparison}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="course" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="sem1" stroke="#D1D5DB" name={semesterLabels[0]} />
            <Line type="monotone" dataKey="sem2" stroke="#F59E0B" name={semesterLabels[1]} />
            <Line type="monotone" dataKey="sem3" stroke="#10B981" name={semesterLabels[2]} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Grade Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Grade Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={gradeDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {gradeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* At-Risk Students */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">⚠️ Students Needing Support</h3>
          <div className="space-y-3">
            {supportStudents.map((student, idx) => (
              <div key={`${student.name}-${idx}`} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900">{student.name}</p>
                    <p className="text-sm text-gray-600">Needs academic support</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">{student.score}%</p>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      student.status === 'Critical' ? 'bg-red-200 text-red-800' : 'bg-orange-200 text-orange-800'
                    }`}>
                      {student.status}
                    </span>
                  </div>
                </div>
                <button className="w-full mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm font-medium hover:bg-blue-600 transition-colors">
                  Send Intervention
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Learning Insights */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">💡 Insights & Recommendations</h3>
        <div className="space-y-3">
          <div className="p-3 bg-white border-l-4 border-blue-500 rounded">
            <p className="font-semibold text-gray-900">Strong Performance Areas</p>
            <p className="text-sm text-gray-600 mt-1">Subjects above 85% average can be used as teaching benchmarks for peer mentoring.</p>
          </div>
          <div className="p-3 bg-white border-l-4 border-yellow-500 rounded">
            <p className="font-semibold text-gray-900">Areas for Improvement</p>
            <p className="text-sm text-gray-600 mt-1">Subjects below 75% need remedial classes and additional assessments.</p>
          </div>
          <div className="p-3 bg-white border-l-4 border-green-500 rounded">
            <p className="font-semibold text-gray-900">Student Support</p>
            <p className="text-sm text-gray-600 mt-1">{supportStudents.length} students are currently flagged for intervention support.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
