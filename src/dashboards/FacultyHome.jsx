import React, { useEffect, useMemo, useState } from 'react';
import { KpiCard } from '../components/KpiCard';
import { StatusBadge, Table } from '../components/Table';
import { Icon } from '../components/Icon';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-card px-3 py-2 text-xs">
        <p className="text-gray-500 mb-0.5">{label}</p>
        <p className="font-semibold text-gray-900">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export function FacultyHome() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [courses, setCourses] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    pendingGrading: 0,
    avgScore: 0,
  });

  const performanceData = useMemo(() => {
    return courses.map((course) => ({
      subject: course.id,
      score: Number(course.avgScore || 0),
    }));
  }, [courses]);

  useEffect(() => {
    let mounted = true;

    const fetchDashboardData = async () => {
      if (!profile?.id) return;

      setLoading(true);
      setErrorMessage('');

      const isTeacher = profile.role === 'teacher';
      const scopeSchoolId = profile.school_id;

      let offeringsQuery = supabase
        .from('subject_offerings')
        .select('id, subject_id, section_id, status, school_id');

      if (isTeacher) {
        offeringsQuery = offeringsQuery.eq('teacher_id', profile.id);
      } else if (scopeSchoolId) {
        offeringsQuery = offeringsQuery.eq('school_id', scopeSchoolId);
      }

      const [{ data: offerings, error: offeringsError }, { data: scopedSubjects, error: scopedSubjectsError }] = await Promise.all([
        offeringsQuery,
        scopeSchoolId
          ? supabase
              .from('subjects')
              .select('id, code, name, semester_no, is_active, school_id')
              .eq('school_id', scopeSchoolId)
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (offeringsError || scopedSubjectsError) {
        if (mounted) {
          setErrorMessage(offeringsError?.message || scopedSubjectsError?.message || 'Failed to load dashboard.');
          setLoading(false);
        }
        return;
      }

      const subjectIdsFromOfferings = Array.from(new Set((offerings || []).map((o) => o.subject_id).filter(Boolean)));
      const sectionIds = Array.from(new Set((offerings || []).map((o) => o.section_id).filter(Boolean)));

      const { data: offeredSubjects, error: offeredSubjectsError } = subjectIdsFromOfferings.length
        ? await supabase
            .from('subjects')
            .select('id, code, name, semester_no, is_active, school_id')
            .in('id', subjectIdsFromOfferings)
        : { data: [], error: null };

      if (offeredSubjectsError) {
        if (mounted) {
          setErrorMessage(offeredSubjectsError.message || 'Failed to load subjects.');
          setLoading(false);
        }
        return;
      }

      const subjectsMap = new Map();
      [...(scopedSubjects || []), ...(offeredSubjects || [])].forEach((subject) => {
        subjectsMap.set(subject.id, subject);
      });

      const [enrollmentsResult, gradesResult, recentGradesResult] = await Promise.all([
        sectionIds.length
          ? supabase
              .from('student_enrollments')
              .select('section_id, student_id, status')
              .in('section_id', sectionIds)
          : Promise.resolve({ data: [], error: null }),
        subjectsMap.size
          ? supabase
              .from('student_grades')
              .select('subject_id, student_id, score, max_score, grade_letter, evaluation_type, evaluated_at')
              .in('subject_id', Array.from(subjectsMap.keys()))
          : Promise.resolve({ data: [], error: null }),
        subjectsMap.size
          ? supabase
              .from('student_grades')
              .select('subject_id, student_id, score, max_score, grade_letter, evaluation_type, evaluated_at')
              .in('subject_id', Array.from(subjectsMap.keys()))
              .order('evaluated_at', { ascending: false })
              .limit(8)
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (enrollmentsResult.error || gradesResult.error || recentGradesResult.error) {
        if (mounted) {
          setErrorMessage(enrollmentsResult.error?.message || gradesResult.error?.message || recentGradesResult.error?.message || 'Failed to load performance data.');
          setLoading(false);
        }
        return;
      }

      const enrollments = (enrollmentsResult.data || []).filter((item) => item.status === 'active');
      const grades = gradesResult.data || [];
      const recentGrades = recentGradesResult.data || [];

      const studentsBySection = enrollments.reduce((acc, enrollment) => {
        if (!acc[enrollment.section_id]) {
          acc[enrollment.section_id] = new Set();
        }
        acc[enrollment.section_id].add(enrollment.student_id);
        return acc;
      }, {});

      const offeringBySubject = (offerings || []).reduce((acc, offering) => {
        if (!acc[offering.subject_id]) {
          acc[offering.subject_id] = [];
        }
        acc[offering.subject_id].push(offering);
        return acc;
      }, {});

      const gradesBySubject = grades.reduce((acc, grade) => {
        if (!acc[grade.subject_id]) {
          acc[grade.subject_id] = [];
        }
        acc[grade.subject_id].push(grade);
        return acc;
      }, {});

      const mappedCourses = Array.from(subjectsMap.values()).map((subject) => {
        const relatedOfferings = offeringBySubject[subject.id] || [];
        const studentSet = new Set();
        relatedOfferings.forEach((offering) => {
          (studentsBySection[offering.section_id] || new Set()).forEach((studentId) => {
            studentSet.add(studentId);
          });
        });

        const relatedGrades = gradesBySubject[subject.id] || [];
        const totalPercent = relatedGrades.reduce((sum, grade) => {
          if (!grade.max_score) return sum;
          return sum + (Number(grade.score || 0) / Number(grade.max_score)) * 100;
        }, 0);

        const avgScore = relatedGrades.length ? Number((totalPercent / relatedGrades.length).toFixed(1)) : 0;
        const pending = relatedGrades.filter((g) => !g.grade_letter).length;

        return {
          key: subject.id,
          id: subject.code,
          title: subject.name,
          status: subject.is_active ? 'Active' : 'Closed',
          students: studentSet.size,
          submissions: Math.max(relatedGrades.length - pending, 0),
          avgScore,
        };
      });

      const uniqueStudentIds = new Set(enrollments.map((item) => item.student_id));
      const pendingGrading = grades.filter((grade) => !grade.grade_letter).length;
      const overallAvg = grades.length
        ? grades.reduce((sum, grade) => {
            if (!grade.max_score) return sum;
            return sum + (Number(grade.score || 0) / Number(grade.max_score)) * 100;
          }, 0) / grades.length
        : 0;

      const recentStudentIds = Array.from(new Set(recentGrades.map((grade) => grade.student_id)));
      const { data: studentProfiles } = recentStudentIds.length
        ? await supabase.from('profiles').select('id, full_name').in('id', recentStudentIds)
        : { data: [] };
      const profileMap = (studentProfiles || []).reduce((acc, item) => {
        acc[item.id] = item.full_name;
        return acc;
      }, {});

      const recentRows = recentGrades.map((grade) => {
        const subject = subjectsMap.get(grade.subject_id);
        return {
          student: profileMap[grade.student_id] || 'Student',
          assignment: grade.evaluation_type || `${subject?.code || 'SUB'} grade entry`,
          submitted: new Date(grade.evaluated_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          score: grade.max_score ? Math.round((Number(grade.score || 0) / Number(grade.max_score)) * 100) : null,
          status: grade.grade_letter ? 'Graded' : 'Pending',
        };
      });

      if (!mounted) return;

      setCourses(mappedCourses.slice(0, 4));
      setSubmissions(recentRows);
      setStats({
        totalCourses: mappedCourses.length,
        totalStudents: uniqueStudentIds.size,
        pendingGrading,
        avgScore: Number(overallAvg.toFixed(1)),
      });
      setLoading(false);
    };

    fetchDashboardData();

    return () => {
      mounted = false;
    };
  }, [profile]);

  const pendingCount = submissions.filter((item) => item.status === 'Pending').length;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="My Courses" value={String(stats.totalCourses)} icon="BookOpen" />
        <KpiCard label="Total Students" value={String(stats.totalStudents)} icon="Users" />
        <KpiCard label="Pending Grading" value={String(stats.pendingGrading)} icon="ClipboardList" />
        <KpiCard label="Avg. Score" value={String(stats.avgScore)} icon="Award" />
      </div>

      {loading && <p className="text-sm text-gray-500">Loading dashboard data from Supabase...</p>}
      {errorMessage && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{errorMessage}</p>}

      {/* Courses + Chart */}
      <div className="grid xl:grid-cols-3 gap-4">
        {/* Courses */}
        <div className="card p-5 xl:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">My Courses</h3>
              <p className="text-xs text-gray-400 mt-0.5">Realtime from subject offerings</p>
            </div>
            <button className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5">
              <Icon name="PlusCircle" size={13} />
              New Assignment
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {courses.map((c) => (
              <div key={c.id} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-mono text-gray-400">{c.id}</span>
                      <StatusBadge status={c.status} />
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900">{c.title}</h4>
                  </div>
                  <span className="text-xs text-gray-400">Avg {c.avgScore || 0}%</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <Icon name="Users" size={12} />
                    {c.students} students
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Icon name="FileText" size={12} />
                    {c.submissions} / {c.students} submitted
                  </span>
                </div>
                {/* Submission progress bar */}
                <div className="mt-3">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all"
                      style={{ width: `${c.students > 0 ? Math.round((c.submissions / c.students) * 100) : 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {c.students > 0 ? Math.round((c.submissions / c.students) * 100) : 0}% submission rate
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance chart */}
        <div className="card p-5">
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-gray-900">Avg. Scores by Subject</h3>
            <p className="text-xs text-gray-400 mt-0.5">Latest graded assignment</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={performanceData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="subject" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="score" fill="#DBEAFE" radius={[4, 4, 0, 0]}>
                {performanceData.map((entry, i) => (
                  <rect key={i} fill={entry.score >= 85 ? '#2563EB' : '#93C5FD'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-primary-600 rounded-sm inline-block"></span>Above 85</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-blue-300 rounded-sm inline-block"></span>Below 85</span>
          </div>
        </div>
      </div>

      {/* Submissions table */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Recent Submissions</h3>
            <p className="text-xs text-gray-400 mt-0.5">Latest grade entries from Supabase</p>
          </div>
          <span className="tag bg-amber-50 text-amber-700">{pendingCount} pending</span>
        </div>
        <Table
          columns={['Student', 'Assignment', 'Submitted', 'Score', 'Status']}
          rows={submissions}
          renderRow={(s, i) => (
            <tr key={i} className="hover:bg-gray-50/50 transition-colors">
              <td className="py-3 px-4 first:pl-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-gray-600">{s.student.charAt(0)}</span>
                  </div>
                  <span className="text-sm text-gray-900">{s.student}</span>
                </div>
              </td>
              <td className="py-3 px-4 text-sm text-gray-600">{s.assignment}</td>
              <td className="py-3 px-4 text-sm text-gray-400">{s.submitted}</td>
              <td className="py-3 px-4">
                {s.score !== null ? (
                  <span className={`text-sm font-medium ${s.score >= 80 ? 'text-green-600' : 'text-amber-600'}`}>
                    {s.score} / 100
                  </span>
                ) : (
                  <span className="text-sm text-gray-300">—</span>
                )}
              </td>
              <td className="py-3 px-4"><StatusBadge status={s.status} /></td>
            </tr>
          )}
        />
      </div>
    </div>
  );
}
