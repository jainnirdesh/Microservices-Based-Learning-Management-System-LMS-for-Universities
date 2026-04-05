import React, { useEffect, useState } from 'react';
import { Icon } from '../components/Icon';
import { Modal } from '../components/Modal';
import { Table, StatusBadge } from '../components/Table';
import { supabase } from '../lib/supabaseClient';

export function AdminSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [schools, setSchools] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [form, setForm] = useState({
    school_id: '',
    department_id: '',
    program_id: '',
    code: '',
    name: '',
    credits: '3',
    semester_no: '1',
  });

  const fetchData = async () => {
    setLoading(true);

    const [schoolsResult, departmentsResult, programsResult, subjectsResult] = await Promise.all([
      supabase.from('schools').select('id, code, name').order('name', { ascending: true }),
      supabase.from('departments').select('id, school_id, code, name').order('name', { ascending: true }),
      supabase.from('programs').select('id, school_id, department_id, code, name').order('name', { ascending: true }),
      supabase.from('subjects').select('id, school_id, department_id, program_id, code, name, credits, semester_no, is_active, created_at').order('created_at', { ascending: false }),
    ]);

    if (!schoolsResult.error && Array.isArray(schoolsResult.data)) setSchools(schoolsResult.data);
    if (!departmentsResult.error && Array.isArray(departmentsResult.data)) setDepartments(departmentsResult.data);
    if (!programsResult.error && Array.isArray(programsResult.data)) setPrograms(programsResult.data);
    if (!subjectsResult.error && Array.isArray(subjectsResult.data)) setSubjects(subjectsResult.data);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const schoolMap = schools.reduce((acc, school) => {
    acc[school.id] = `${school.code} - ${school.name}`;
    return acc;
  }, {});

  const departmentMap = departments.reduce((acc, department) => {
    acc[department.id] = department.name;
    return acc;
  }, {});

  const programMap = programs.reduce((acc, program) => {
    acc[program.id] = program.name;
    return acc;
  }, {});

  const filteredDepartments = departments.filter((department) => String(department.school_id) === String(form.school_id));
  const filteredPrograms = programs.filter((program) => String(program.school_id) === String(form.school_id) && String(program.department_id) === String(form.department_id));

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setCreating(true);

    if (!form.school_id || !form.code || !form.name || !form.credits || !form.semester_no) {
      setErrorMessage('Please fill all required fields.');
      setCreating(false);
      return;
    }

    const payload = {
      school_id: Number(form.school_id),
      department_id: form.department_id ? Number(form.department_id) : null,
      program_id: form.program_id ? Number(form.program_id) : null,
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      credits: Number(form.credits),
      semester_no: Number(form.semester_no),
      is_active: true,
    };

    const { error } = await supabase.from('subjects').insert(payload);

    if (error) {
      setErrorMessage(error.message || 'Failed to create subject.');
      setCreating(false);
      return;
    }

    setSuccessMessage(`Subject ${payload.code} created successfully.`);
    setShowCreateModal(false);
    setForm({ school_id: '', department_id: '', program_id: '', code: '', name: '', credits: '3', semester_no: '1' });
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
          <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
          <p className="text-sm text-gray-500 mt-1">Create subjects for each school and program</p>
        </div>
        <button onClick={handleOpenCreate} className="btn-primary text-sm px-4 py-2 flex items-center gap-2">
          <Icon name="PlusCircle" size={16} />
          Create Subject
        </button>
      </div>

      {successMessage && (
        <div className="border border-emerald-200 bg-emerald-50 rounded-lg p-4">
          <p className="text-sm font-semibold text-emerald-900">Success</p>
          <p className="text-xs text-emerald-800 mt-1">{successMessage}</p>
        </div>
      )}

      {loading && <div className="text-sm text-gray-500">Loading subjects from Supabase...</div>}

      <div className="card p-5">
        <Table
          columns={['Code', 'Subject', 'School', 'Department', 'Program', 'Credits', 'Semester', 'Status']}
          rows={subjects}
          renderRow={(subject) => (
            <tr key={subject.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="py-3 px-4 first:pl-0 text-xs font-mono text-gray-600">{subject.code}</td>
              <td className="py-3 px-4 text-sm font-medium text-gray-900">{subject.name}</td>
              <td className="py-3 px-4 text-sm text-gray-600">{schoolMap[subject.school_id] || `School ${subject.school_id}`}</td>
              <td className="py-3 px-4 text-sm text-gray-600">{departmentMap[subject.department_id] || '—'}</td>
              <td className="py-3 px-4 text-sm text-gray-600">{programMap[subject.program_id] || '—'}</td>
              <td className="py-3 px-4 text-sm text-gray-600">{subject.credits}</td>
              <td className="py-3 px-4 text-sm text-gray-600">Semester {subject.semester_no}</td>
              <td className="py-3 px-4"><StatusBadge status={subject.is_active ? 'Active' : 'Inactive'} /></td>
            </tr>
          )}
        />
      </div>

      <Modal isOpen={showCreateModal} title="Create Subject" onClose={() => setShowCreateModal(false)}>
        <form onSubmit={handleCreateSubject} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">School</label>
            <select
              value={form.school_id}
              onChange={(e) => setForm({ ...form, school_id: e.target.value, department_id: '', program_id: '' })}
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
            <label className="block text-sm font-medium text-gray-900 mb-1">Department (optional)</label>
            <select
              value={form.department_id}
              onChange={(e) => setForm({ ...form, department_id: e.target.value, program_id: '' })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={!form.school_id}
            >
              <option value="">No department</option>
              {filteredDepartments.map((department) => (
                <option key={department.id} value={department.id}>{department.code} - {department.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Program (optional)</label>
            <select
              value={form.program_id}
              onChange={(e) => setForm({ ...form, program_id: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={!form.department_id}
            >
              <option value="">No program</option>
              {filteredPrograms.map((program) => (
                <option key={program.id} value={program.id}>{program.code} - {program.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Subject Code</label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="CS101"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Subject Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Introduction to Programming"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Credits</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={form.credits}
                onChange={(e) => setForm({ ...form, credits: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Semester</label>
              <select
                value={form.semester_no}
                onChange={(e) => setForm({ ...form, semester_no: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => (
                  <option key={semester} value={semester}>Semester {semester}</option>
                ))}
              </select>
            </div>
          </div>
          {errorMessage && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{errorMessage}</p>
          )}
          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn-primary flex-1" disabled={creating}>
              {creating ? 'Creating...' : 'Create Subject'}
            </button>
            <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
