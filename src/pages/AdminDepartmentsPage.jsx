import React, { useEffect, useState } from 'react';
import { Icon } from '../components/Icon';
import { Modal } from '../components/Modal';
import { Table, StatusBadge } from '../components/Table';
import { supabase } from '../lib/supabaseClient';

export function AdminDepartments() {
  const [departments, setDepartments] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [form, setForm] = useState({
    school_id: '',
    code: '',
    name: '',
  });

  const fetchData = async () => {
    setLoading(true);

    const [schoolsResult, departmentsResult] = await Promise.all([
      supabase.from('schools').select('id, code, name').order('name', { ascending: true }),
      supabase.from('departments').select('id, school_id, code, name, created_at').order('created_at', { ascending: false }),
    ]);

    if (!schoolsResult.error && Array.isArray(schoolsResult.data)) {
      setSchools(schoolsResult.data);
    }

    if (!departmentsResult.error && Array.isArray(departmentsResult.data)) {
      setDepartments(departmentsResult.data);
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

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setCreating(true);

    if (!form.school_id || !form.code || !form.name) {
      setErrorMessage('Please fill all required fields.');
      setCreating(false);
      return;
    }

    const payload = {
      school_id: Number(form.school_id),
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
    };

    const { error } = await supabase.from('departments').insert(payload);

    if (error) {
      setErrorMessage(error.message || 'Failed to create department.');
      setCreating(false);
      return;
    }

    setSuccessMessage(`Department ${payload.code} created successfully.`);
    setShowCreateModal(false);
    setForm({ school_id: '', code: '', name: '' });
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
          <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
          <p className="text-sm text-gray-500 mt-1">Create departments for each school</p>
        </div>
        <button onClick={handleOpenCreate} className="btn-primary text-sm px-4 py-2 flex items-center gap-2">
          <Icon name="PlusCircle" size={16} />
          Create Department
        </button>
      </div>

      {successMessage && (
        <div className="border border-emerald-200 bg-emerald-50 rounded-lg p-4">
          <p className="text-sm font-semibold text-emerald-900">Success</p>
          <p className="text-xs text-emerald-800 mt-1">{successMessage}</p>
        </div>
      )}

      {loading && <div className="text-sm text-gray-500">Loading departments from Supabase...</div>}

      <div className="card p-5">
        <Table
          columns={['Code', 'Department', 'School', 'Status']}
          rows={departments}
          renderRow={(department) => (
            <tr key={department.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="py-3 px-4 first:pl-0 text-xs font-mono text-gray-600">{department.code}</td>
              <td className="py-3 px-4 text-sm font-medium text-gray-900">{department.name}</td>
              <td className="py-3 px-4 text-sm text-gray-600">{schoolMap[department.school_id] || `School ${department.school_id}`}</td>
              <td className="py-3 px-4"><StatusBadge status="Active" /></td>
            </tr>
          )}
        />
      </div>

      <Modal isOpen={showCreateModal} title="Create Department" onClose={() => setShowCreateModal(false)}>
        <form onSubmit={handleCreateDepartment} className="space-y-4">
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
            <label className="block text-sm font-medium text-gray-900 mb-1">Department Code</label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="CSE"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Department Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Computer Science & Engineering"
              required
            />
          </div>
          {errorMessage && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{errorMessage}</p>
          )}
          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn-primary flex-1" disabled={creating}>
              {creating ? 'Creating...' : 'Create Department'}
            </button>
            <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
