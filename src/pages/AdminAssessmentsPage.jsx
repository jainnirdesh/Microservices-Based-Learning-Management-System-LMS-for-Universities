import React, { useState } from 'react';
import { Icon } from '../components/Icon';
import { Modal } from '../components/Modal';

export function AdminAssessments() {
  const [assessments, setAssessments] = useState([
    { id: 1, name: 'Midterm Exam', type: 'Exam', courses: 3, date: 'Apr 5, 2025', status: 'Active', attempts: 234 },
    { id: 2, name: 'Quiz 1', type: 'Quiz', courses: 5, date: 'Apr 1, 2025', status: 'Active', attempts: 567 },
    { id: 3, name: 'Final Project', type: 'Project', courses: 2, date: 'May 10, 2025', status: 'Draft', attempts: 0 },
  ]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);

  const handleCreateAssessment = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const newAssessment = {
      id: Date.now(),
      name: String(formData.get('name') || '').trim(),
      type: String(formData.get('type') || 'Quiz'),
      courses: Number(formData.get('courses') || 0),
      attempts: 0,
      date: String(formData.get('date') || '').trim(),
      status: String(formData.get('status') || 'Draft'),
    };

    setAssessments((prev) => [newAssessment, ...prev]);
    setShowCreateModal(false);
    e.target.reset();
  };

  const openEditModal = (assessment) => {
    setSelectedAssessment(assessment);
    setShowEditModal(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!selectedAssessment) return;

    const formData = new FormData(e.target);
    const updated = {
      ...selectedAssessment,
      name: String(formData.get('name') || '').trim(),
      type: String(formData.get('type') || 'Quiz'),
      courses: Number(formData.get('courses') || 0),
      date: String(formData.get('date') || '').trim(),
      status: String(formData.get('status') || 'Draft'),
    };

    setAssessments((prev) => prev.map((item) => (item.id === selectedAssessment.id ? updated : item)));
    setShowEditModal(false);
    setSelectedAssessment(null);
  };

  const handleDeleteAssessment = (assessmentId) => {
    setAssessments((prev) => prev.filter((item) => item.id !== assessmentId));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assessment Engine</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all assessments across subjects</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary text-sm px-4 py-2 flex items-center gap-2"
        >
          <Icon name="PlusCircle" size={16} />
          Create Assessment
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">Assessment</th>
              <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">Type</th>
              <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">Subjects</th>
              <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">Attempts</th>
              <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">Date</th>
              <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">Status</th>
              <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {assessments.map((a) => (
              <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{a.name}</td>
                <td className="px-4 py-3 text-xs bg-gray-50 rounded w-fit px-2">{a.type}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{a.courses}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{a.attempts}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{a.date}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded font-semibold ${a.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>{a.status}</span></td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => openEditModal(a)} className="btn-secondary text-xs px-2 py-1">Edit</button>
                  <button onClick={() => handleDeleteAssessment(a.id)} className="btn-ghost text-xs px-2 py-1">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showCreateModal} title="Create Assessment" onClose={() => setShowCreateModal(false)}>
        <form onSubmit={handleCreateAssessment} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Assessment name"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              name="type"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="Exam">Exam</option>
              <option value="Quiz">Quiz</option>
              <option value="Project">Project</option>
              <option value="Assignment">Assignment</option>
            </select>
            <input
              type="number"
              name="courses"
              min="1"
              placeholder="Subject count"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              name="date"
              placeholder="Apr 20, 2026"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <select
              name="status"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="Draft">Draft</option>
              <option value="Active">Active</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn-primary flex-1">Create</button>
            <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showEditModal} title="Edit Assessment" onClose={() => setShowEditModal(false)}>
        {selectedAssessment ? (
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <input
              type="text"
              name="name"
              defaultValue={selectedAssessment.name}
              placeholder="Assessment name"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                name="type"
                defaultValue={selectedAssessment.type}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="Exam">Exam</option>
                <option value="Quiz">Quiz</option>
                <option value="Project">Project</option>
                <option value="Assignment">Assignment</option>
              </select>
              <input
                type="number"
                name="courses"
                min="1"
                defaultValue={selectedAssessment.courses}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                name="date"
                defaultValue={selectedAssessment.date}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <select
                name="status"
                defaultValue={selectedAssessment.status}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="Draft">Draft</option>
                <option value="Active">Active</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="btn-primary flex-1">Save Changes</button>
              <button type="button" onClick={() => setShowEditModal(false)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </form>
        ) : null}
      </Modal>
    </div>
  );
}
