import React, { useEffect, useState } from 'react';
import { Icon } from '../components/Icon';
import { Modal } from '../components/Modal';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export function FacultyCourses() {
  const { profile, user } = useAuth();
  const [showNewCourseModal, setShowNewCourseModal] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchCourses = async () => {
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
            .order('created_at', { ascending: false })
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (offeringsError || scopedSubjectsError) {
      setErrorMessage(offeringsError?.message || scopedSubjectsError?.message || 'Failed to load subjects.');
      setLoading(false);
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
      setErrorMessage(offeredSubjectsError.message || 'Failed to load offered subjects.');
      setLoading(false);
      return;
    }

    const subjectsMap = new Map();
    [...(scopedSubjects || []), ...(offeredSubjects || [])].forEach((subject) => {
      subjectsMap.set(subject.id, subject);
    });

    const { data: enrollments, error: enrollmentsError } = sectionIds.length
      ? await supabase
          .from('student_enrollments')
          .select('section_id, student_id, status')
          .in('section_id', sectionIds)
      : { data: [], error: null };

    const allSubjectIds = Array.from(subjectsMap.keys());
    const { data: grades, error: gradesError } = allSubjectIds.length
      ? await supabase
          .from('student_grades')
          .select('subject_id, score, max_score, evaluation_type')
          .in('subject_id', allSubjectIds)
      : { data: [], error: null };

    if (enrollmentsError || gradesError) {
      setErrorMessage(enrollmentsError?.message || gradesError?.message || 'Failed to load performance data.');
      setLoading(false);
      return;
    }

    const activeEnrollments = (enrollments || []).filter((e) => e.status === 'active');
    const studentsBySection = activeEnrollments.reduce((acc, enrollment) => {
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

    const gradesBySubject = (grades || []).reduce((acc, grade) => {
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
      const assignmentCount = new Set(relatedGrades.map((grade) => grade.evaluation_type || `eval-${grade.subject_id}`)).size;

      return {
        key: subject.id,
        id: subject.code,
        title: subject.name,
        semester: subject.semester_no || '—',
        students: studentSet.size,
        avgScore,
        status: subject.is_active ? 'Active' : 'Closed',
        assignments: assignmentCount,
      };
    });

    setCourses(mappedCourses.sort((a, b) => String(a.id).localeCompare(String(b.id))));
    setLoading(false);
  };

  useEffect(() => {
    fetchCourses();
  }, [profile?.id, profile?.role, profile?.school_id]);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!profile?.school_id) {
      setErrorMessage('School is required to create a subject. Update your profile school first.');
      return;
    }

    setCreating(true);
    setErrorMessage('');
    const formData = new FormData(e.target);
    const title = String(formData.get('title') || '').trim();
    const semester = Number(formData.get('semester') || 1);
    const derivedCode = title
      .split(' ')
      .filter(Boolean)
      .map((word) => word[0]?.toUpperCase())
      .join('')
      .slice(0, 4);

    const payload = {
      school_id: profile.school_id,
      code: `${derivedCode || 'SUB'}${Math.floor(Math.random() * 900) + 100}`,
      name: title,
      semester_no: semester,
      credits: 3,
      is_active: true,
    };

    const { error } = await supabase.from('subjects').insert(payload);

    if (error) {
      setErrorMessage(error.message || 'Failed to create subject.');
      setCreating(false);
      return;
    }

    setShowNewCourseModal(false);
    setCreating(false);
    e.target.reset();
    await fetchCourses();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and organize your subjects</p>
        </div>
        <button
          onClick={() => setShowNewCourseModal(true)}
          className="btn-primary text-sm px-4 py-2 flex items-center gap-2"
        >
          <Icon name="PlusCircle" size={16} />
          New Course
        </button>
      </div>

      {errorMessage && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{errorMessage}</p>
      )}

      {loading && (
        <p className="text-sm text-gray-500">Loading subjects from Supabase...</p>
      )}

      <div className="grid gap-4">
        {courses.map((course) => (
          <div key={course.id} className="card p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-mono bg-primary-50 text-primary-700 px-2 py-1 rounded">{course.id}</span>
                  <span className={`text-xs px-2 py-1 rounded ${course.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'}`}>
                    {course.status}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                <p className="text-sm text-gray-500 mt-1">Semester {course.semester}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 mb-1">Students</p>
                <p className="text-2xl font-bold text-primary-600">{course.students}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-100 mb-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Average Score</p>
                <p className="text-lg font-semibold text-gray-900">{course.avgScore || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Assignments</p>
                <p className="text-lg font-semibold text-gray-900">{course.assignments}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Enrollment</p>
                <p className="text-lg font-semibold text-gray-900">100%</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
                <Icon name="Edit" size={13} />
                Edit
              </button>
              <button className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
                <Icon name="Users" size={13} />
                Students
              </button>
              <button className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
                <Icon name="BarChart2" size={13} />
                Analytics
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* New Course Modal */}
      <Modal isOpen={showNewCourseModal} title="Create New Course" onClose={() => setShowNewCourseModal(false)}>
        <form onSubmit={handleCreateCourse} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Course Title</label>
            <input
              type="text"
              name="title"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g. Advanced Databases"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Semester</label>
            <select
              name="semester"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => <option key={sem} value={sem}>Semester {sem}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Course Description</label>
            <textarea
              name="description"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows="3"
              placeholder="Brief course description..."
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn-primary flex-1" disabled={creating}>{creating ? 'Creating...' : 'Create Course'}</button>
            <button type="button" onClick={() => setShowNewCourseModal(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
