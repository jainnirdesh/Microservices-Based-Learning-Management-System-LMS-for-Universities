import React, { useEffect, useState } from 'react';
import { Icon } from '../components/Icon';
import { Modal } from '../components/Modal';
import { Table, StatusBadge } from '../components/Table';
import { supabase } from '../lib/supabaseClient';

export function AdminTeachingAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [form, setForm] = useState({
    school_id: '',
    section_id: '',
    subject_id: '',
    teacher_id: '',
    room: '',
    meeting_pattern: '',
  });

  const fetchData = async () => {
    setLoading(true);

    const [schoolsResult, sectionsResult, subjectsResult, teachersResult, assignmentsResult] = await Promise.all([
      supabase.from('schools').select('id, code, name').order('name', { ascending: true }),
      supabase.from('sections').select('id, school_id, code, name, academic_year').order('created_at', { ascending: false }),
      supabase.from('subjects').select('id, school_id, code, name').order('name', { ascending: true }),
      supabase.from('profiles').select('id, full_name, role, school_id').in('role', ['teacher', 'school_coordinator']).order('full_name', { ascending: true }),
      supabase.from('subject_offerings').select('id, school_id, section_id, subject_id, teacher_id, room, meeting_pattern, status, created_at').order('created_at', { ascending: false }),
    ]);

    if (!schoolsResult.error && Array.isArray(schoolsResult.data)) setSchools(schoolsResult.data);
    if (!sectionsResult.error && Array.isArray(sectionsResult.data)) setSections(sectionsResult.data);
    if (!subjectsResult.error && Array.isArray(subjectsResult.data)) setSubjects(subjectsResult.data);
    if (!teachersResult.error && Array.isArray(teachersResult.data)) setTeachers(teachersResult.data);
    if (!assignmentsResult.error && Array.isArray(assignmentsResult.data)) setAssignments(assignmentsResult.data);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const schoolMap = schools.reduce((acc, school) => {
    acc[school.id] = `${school.code} - ${school.name}`;
    return acc;
  }, {});

  const sectionMap = sections.reduce((acc, section) => {
    acc[section.id] = `${section.code} - ${section.name}`;
    return acc;
  }, {});

  const subjectMap = subjects.reduce((acc, subject) => {
    acc[subject.id] = `${subject.code} - ${subject.name}`;
    return acc;
  }, {});

  const teacherMap = teachers.reduce((acc, teacher) => {
    acc[teacher.id] = teacher.full_name;
    return acc;
  }, {});

  const filteredSections = sections.filter((section) => String(section.school_id) === String(form.school_id));
  const filteredSubjects = subjects.filter((subject) => String(subject.school_id) === String(form.school_id));
  const filteredTeachers = teachers.filter((teacher) => !form.school_id || !teacher.school_id || String(teacher.school_id) === String(form.school_id));

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setCreating(true);

    if (!form.school_id || !form.section_id || !form.subject_id || !form.teacher_id) {
      setErrorMessage('Please fill all required fields.');
      setCreating(false);
      return;
    }

    const payload = {
      school_id: Number(form.school_id),
      section_id: Number(form.section_id),
      subject_id: Number(form.subject_id),
      teacher_id: form.teacher_id,
      room: form.room.trim() || null,
      meeting_pattern: form.meeting_pattern.trim() || null,
      status: 'active',
    };

    const { error } = await supabase.from('subject_offerings').insert(payload);

    if (error) {
      setErrorMessage(error.message || 'Failed to create assignment.');
      setCreating(false);
      return;
    }

    setSuccessMessage('Teaching assignment created successfully.');
    setShowCreateModal(false);
    setForm({ school_id: '', section_id: '', subject_id: '', teacher_id: '', room: '', meeting_pattern: '' });
    await fetchData();
    setCreating(false);
  };

  const handleOpenCreate = () => {
    setErrorMessage('');
    setSuccessMessage('');
    setShowCreateModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teaching Assignments</h1>
          <p className="text-sm text-gray-500 mt-1">Assign teachers to subjects and sections</p>
        </div>
        <button onClick={handleOpenCreate} className="btn-primary text-sm px-4 py-2 flex items-center gap-2">
          <Icon name="PlusCircle" size={16} />
          Assign Teacher
        </button>
      </div>

      {successMessage && (
        <div className="border border-emerald-200 bg-emerald-50 rounded-lg p-4">
          <p className="text-sm font-semibold text-emerald-900">Success</p>
          <p className="text-xs text-emerald-800 mt-1">{successMessage}</p>
        </div>
      )}

      {loading && <div className="text-sm text-gray-500">Loading assignments from Supabase...</div>}

      <div className="card p-5">
        <Table
          columns={['School', 'Section', 'Subject', 'Teacher', 'Room', 'Pattern', 'Status']}
          rows={assignments}
          renderRow={(assignment) => (
            <tr key={assignment.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="py-3 px-4 first:pl-0 text-sm text-gray-600">{schoolMap[assignment.school_id] || `School ${assignment.school_id}`}</td>
              <td className="py-3 px-4 text-sm text-gray-600">{sectionMap[assignment.section_id] || '—'}</td>
              <td className="py-3 px-4 text-sm text-gray-600">{subjectMap[assignment.subject_id] || '—'}</td>
              <td className="py-3 px-4 text-sm text-gray-600">{teacherMap[assignment.teacher_id] || '—'}</td>
              <td className="py-3 px-4 text-sm text-gray-600">{assignment.room || '—'}</td>
              <td className="py-3 px-4 text-sm text-gray-600">{assignment.meeting_pattern || '—'}</td>
              <td className="py-3 px-4"><StatusBadge status={assignment.status === 'active' ? 'Active' : 'Inactive'} /></td>
            </tr>
          )}
        />
      </div>

      <Modal isOpen={showCreateModal} title="Assign Teacher" onClose={() => setShowCreateModal(false)}>
        <form onSubmit={handleCreateAssignment} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">School</label>
            <select
              value={form.school_id}
              onChange={(e) => setForm({ ...form, school_id: e.target.value, section_id: '', subject_id: '', teacher_id: '' })}
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
            <label className="block text-sm font-medium text-gray-900 mb-1">Section</label>
            <select
              value={form.section_id}
              onChange={(e) => setForm({ ...form, section_id: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
              disabled={!form.school_id}
            >
              <option value="">Select section</option>
              {filteredSections.map((section) => (
                <option key={section.id} value={section.id}>{section.code} - {section.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Subject</label>
            <select
              value={form.subject_id}
              onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
              disabled={!form.school_id}
            >
              <option value="">Select subject</option>
              {filteredSubjects.map((subject) => (
                <option key={subject.id} value={subject.id}>{subject.code} - {subject.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Teacher</label>
            <select
              value={form.teacher_id}
              onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Select teacher</option>
              {filteredTeachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>{teacher.full_name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Room (optional)</label>
              <input
                type="text"
                value={form.room}
                onChange={(e) => setForm({ ...form, room: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Room 105"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Meeting Pattern (optional)</label>
              <input
                type="text"
                value={form.meeting_pattern}
                onChange={(e) => setForm({ ...form, meeting_pattern: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Mon/Wed 10:00-11:00"
              />
            </div>
          </div>
          {errorMessage && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{errorMessage}</p>
          )}
          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn-primary flex-1" disabled={creating}>
              {creating ? 'Assigning...' : 'Assign Teacher'}
            </button>
            <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
