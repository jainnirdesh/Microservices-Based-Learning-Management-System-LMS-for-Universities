import React, { useEffect, useState } from 'react';
import { Icon } from '../components/Icon';
import { Modal } from '../components/Modal';
import { Table, StatusBadge } from '../components/Table';
import { supabase } from '../lib/supabaseClient';

export function AdminPrograms() {
  const [programs, setPrograms] = useState([]);
  const [schools, setSchools] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [form, setForm] = useState({
    school_id: '',
    department_id: '',
    code: '',
    name: '',
    level: 'UG',
    duration_years: '3',
  });

  const fetchData = async () => {
    setLoading(true);

    const [schoolsResult, departmentsResult, programsResult] = await Promise.all([
      supabase.from('schools').select('id, code, name').order('name', { ascending: true }),
      supabase.from('departments').select('id, school_id, code, name').order('name', { ascending: true }),
      supabase.from('programs').select('id, school_id, department_id, code, name, level, duration_years, is_active, created_at').order('created_at', { ascending: false }),
    ]);

    if (!schoolsResult.error && Array.isArray(schoolsResult.data)) {
      setSchools(schoolsResult.data);
    }

    if (!departmentsResult.error && Array.isArray(departmentsResult.data)) {
      setDepartments(departmentsResult.data);
    }

    if (!programsResult.error && Array.isArray(programsResult.data)) {
      setPrograms(programsResult.data);
    }

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

  const filteredDepartments = departments.filter((department) => String(department.school_id) === String(form.school_id));

  const handleCreateProgram = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setCreating(true);

    if (!form.school_id || !form.department_id || !form.code || !form.name) {
      setErrorMessage('Please fill all required fields.');
      setCreating(false);
      return;
    }

    const payload = {
      school_id: Number(form.school_id),
      department_id: Number(form.department_id),
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      level: form.level,
      duration_years: Number(form.duration_years),
      is_active: true,
    };

    const { error } = await supabase.from('programs').insert(payload);

    if (error) {
      setErrorMessage(error.message || 'Failed to create program.');
      setCreating(false);
      return;
    }

    setSuccessMessage(`Program ${payload.code} created successfully.`);
    setShowCreateModal(false);
    setForm({ school_id: '', department_id: '', code: '', name: '', level: 'UG', duration_years: '3' });
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
          <h1 className="text-2xl font-bold text-gray-900">Programs</h1>
          <p className="text-sm text-gray-500 mt-1">Create degree programs under departments</p>
        </div>
        <button onClick={handleOpenCreate} className="btn-primary text-sm px-4 py-2 flex items-center gap-2">
          <Icon name="PlusCircle" size={16} />
          Create Program
        </button>
      </div>

      {successMessage && (
        <div className="border border-emerald-200 bg-emerald-50 rounded-lg p-4">
          <p className="text-sm font-semibold text-emerald-900">Success</p>
          <p className="text-xs text-emerald-800 mt-1">{successMessage}</p>
        </div>
      )}

      {loading && <div className="text-sm text-gray-500">Loading programs from Supabase...</div>}

      <div className="card p-5">
        <Table
          columns={['Code', 'Program', 'School', 'Department', 'Level', 'Duration', 'Status']}
          rows={programs}
          renderRow={(program) => (
            <tr key={program.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="py-3 px-4 first:pl-0 text-xs font-mono text-gray-600">{program.code}</td>
              <td className="py-3 px-4 text-sm font-medium text-gray-900">{program.name}</td>
              <td className="py-3 px-4 text-sm text-gray-600">{schoolMap[program.school_id] || `School ${program.school_id}`}</td>
              <td className="py-3 px-4 text-sm text-gray-600">{departmentMap[program.department_id] || '—'}</td>
              <td className="py-3 px-4 text-sm text-gray-600">{program.level}</td>
              <td className="py-3 px-4 text-sm text-gray-600">{program.duration_years || '—'} yrs</td>
              <td className="py-3 px-4"><StatusBadge status={program.is_active ? 'Active' : 'Inactive'} /></td>
            </tr>
          )}
        />
      </div>

      <Modal isOpen={showCreateModal} title="Create Program" onClose={() => setShowCreateModal(false)}>
        <form onSubmit={handleCreateProgram} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">School</label>
            <select
              value={form.school_id}
              onChange={(e) => setForm({ ...form, school_id: e.target.value, department_id: '' })}
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
            <label className="block text-sm font-medium text-gray-900 mb-1">Department</label>
            <select
              value={form.department_id}
              onChange={(e) => setForm({ ...form, department_id: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
              disabled={!form.school_id}
            >
              <option value="">Select department</option>
              {filteredDepartments.map((department) => (
                <option key={department.id} value={department.id}>{department.code} - {department.name}</option>
              ))}
            </select>
            {form.school_id && filteredDepartments.length === 0 && (
              <p className="text-xs text-amber-700 mt-1">No departments found for this school yet. Create a department first.</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Program Code</label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="BCA"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Program Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Bachelor of Computer Applications"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Level</label>
              <select
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="UG">UG</option>
                <option value="PG">PG</option>
                <option value="Diploma">Diploma</option>
                <option value="Doctorate">Doctorate</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Duration (Years)</label>
              <input
                type="number"
                min="1"
                step="0.5"
                value={form.duration_years}
                onChange={(e) => setForm({ ...form, duration_years: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="3"
              />
            </div>
          </div>
          {errorMessage && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{errorMessage}</p>
          )}
          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn-primary flex-1" disabled={creating}>
              {creating ? 'Creating...' : 'Create Program'}
            </button>
            <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
