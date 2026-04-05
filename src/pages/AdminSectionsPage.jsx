import React, { useEffect, useState } from 'react';
import { Icon } from '../components/Icon';
import { Modal } from '../components/Modal';
import { Table, StatusBadge } from '../components/Table';
import { supabase } from '../lib/supabaseClient';

export function AdminSections() {
  const [sections, setSections] = useState([]);
  const [schools, setSchools] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [enrollmentCountBySection, setEnrollmentCountBySection] = useState({});
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [form, setForm] = useState({
    school_id: '',
    code: '',
    name: '',
    academic_year: '2025-26',
    semester_no: '1',
    class_teacher_id: '',
  });

  const fetchData = async () => {
    setLoading(true);

    const [schoolsResult, teachersResult, sectionsResult, enrollmentsResult] = await Promise.all([
      supabase.from('schools').select('id, code, name').order('name', { ascending: true }),
      supabase
        .from('profiles')
        .select('id, full_name, role, school_id')
        .in('role', ['teacher', 'school_coordinator'])
        .order('full_name', { ascending: true }),
      supabase
        .from('sections')
        .select('id, school_id, code, name, academic_year, semester_no, class_teacher_id, is_active, created_at')
        .order('created_at', { ascending: false }),
      supabase.from('student_enrollments').select('section_id'),
    ]);

    if (!schoolsResult.error && Array.isArray(schoolsResult.data)) {
      setSchools(schoolsResult.data);
    }

    if (!teachersResult.error && Array.isArray(teachersResult.data)) {
      setTeachers(teachersResult.data);
    }

    if (!sectionsResult.error && Array.isArray(sectionsResult.data)) {
      setSections(sectionsResult.data);
    }

    if (!enrollmentsResult.error && Array.isArray(enrollmentsResult.data)) {
      const counts = enrollmentsResult.data.reduce((acc, enrollment) => {
        const sectionId = enrollment.section_id;
        acc[sectionId] = (acc[sectionId] || 0) + 1;
        return acc;
      }, {});
      setEnrollmentCountBySection(counts);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setErrorMessage('');
    setSuccessMessage('');
    setShowCreateModal(true);
  };

  const handleCreateSection = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setCreating(true);

    if (!form.school_id || !form.code || !form.name || !form.academic_year || !form.semester_no) {
      setErrorMessage('Please fill all required fields.');
      setCreating(false);
      return;
    }

    const payload = {
      school_id: Number(form.school_id),
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      academic_year: form.academic_year.trim(),
      semester_no: Number(form.semester_no),
      class_teacher_id: form.class_teacher_id || null,
      is_active: true,
    };

    const { error } = await supabase.from('sections').insert(payload);

    if (error) {
      setErrorMessage(error.message || 'Failed to create section.');
      setCreating(false);
      return;
    }

    setSuccessMessage(`Section ${payload.code} created successfully.`);
    setShowCreateModal(false);
    setForm({
      school_id: '',
      code: '',
      name: '',
      academic_year: '2025-26',
      semester_no: '1',
      class_teacher_id: '',
    });
    await fetchData();
    setCreating(false);
  };

  const schoolMap = schools.reduce((acc, school) => {
    acc[school.id] = `${school.code} - ${school.name}`;
    return acc;
  }, {});

  const teacherMap = teachers.reduce((acc, teacher) => {
    acc[teacher.id] = teacher.full_name;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sections</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage class sections for each school</p>
        </div>
        <button onClick={handleOpenCreate} className="btn-primary text-sm px-4 py-2 flex items-center gap-2">
          <Icon name="PlusCircle" size={16} />
          Create Section
        </button>
      </div>

      {successMessage && (
        <div className="border border-emerald-200 bg-emerald-50 rounded-lg p-4">
          <p className="text-sm font-semibold text-emerald-900">Success</p>
          <p className="text-xs text-emerald-800 mt-1">{successMessage}</p>
        </div>
      )}

      {loading && <div className="text-sm text-gray-500">Loading sections from Supabase...</div>}

      <div className="card p-5">
        <Table
          columns={['Code', 'Name', 'School', 'Academic Year', 'Semester', 'Enrolled Students', 'Class Teacher', 'Status']}
          rows={sections}
          renderRow={(section) => (
            <tr key={section.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="py-3 px-4 first:pl-0 text-xs font-mono text-gray-600">{section.code}</td>
              <td className="py-3 px-4 text-sm font-medium text-gray-900">{section.name}</td>
              <td className="py-3 px-4 text-sm text-gray-600">{schoolMap[section.school_id] || `School ${section.school_id}`}</td>
              <td className="py-3 px-4 text-sm text-gray-600">{section.academic_year}</td>
              <td className="py-3 px-4 text-sm text-gray-600">Semester {section.semester_no}</td>
              <td className="py-3 px-4 text-sm text-gray-900 font-semibold">{enrollmentCountBySection[section.id] || 0}</td>
              <td className="py-3 px-4 text-sm text-gray-600">{teacherMap[section.class_teacher_id] || 'Not assigned'}</td>
              <td className="py-3 px-4"><StatusBadge status={section.is_active ? 'Active' : 'Inactive'} /></td>
            </tr>
          )}
        />
      </div>

      <Modal isOpen={showCreateModal} title="Create Section" onClose={() => setShowCreateModal(false)}>
        <form onSubmit={handleCreateSection} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">School</label>
            <select
              value={form.school_id}
              onChange={(e) => setForm({ ...form, school_id: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Select school</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>{school.code} - {school.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Section Code</label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="BCA-A"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Section Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="BCA Semester 1 - Section A"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Academic Year</label>
              <input
                type="text"
                value={form.academic_year}
                onChange={(e) => setForm({ ...form, academic_year: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="2025-26"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Semester</label>
              <select
                value={form.semester_no}
                onChange={(e) => setForm({ ...form, semester_no: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => (
                  <option key={semester} value={semester}>Semester {semester}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Class Teacher (optional)</label>
            <select
              value={form.class_teacher_id}
              onChange={(e) => setForm({ ...form, class_teacher_id: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Not assigned</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>{teacher.full_name}</option>
              ))}
            </select>
          </div>
          {errorMessage && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{errorMessage}</p>
          )}
          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn-primary flex-1" disabled={creating}>
              {creating ? 'Creating...' : 'Create Section'}
            </button>
            <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
