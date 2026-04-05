import React, { useState } from 'react';
import { Icon } from '../components/Icon';
import { Modal } from '../components/Modal';
import { courseAssignments } from '../data/mockData';

export function FacultyAssignments() {
  const [showNewAssignmentModal, setShowNewAssignmentModal] = useState(false);
  const [assignments, setAssignments] = useState(courseAssignments);

  const handleCreateAssignment = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newAssignment = {
      id: assignments.length + 1,
      title: formData.get('title'),
      course: formData.get('course'),
      dueDate: formData.get('dueDate'),
      submitted: 0,
      total: 40,
      status: 'Draft',
    };
    setAssignments([...assignments, newAssignment]);
    setShowNewAssignmentModal(false);
    e.target.reset();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage assignments</p>
        </div>
        <button
          onClick={() => setShowNewAssignmentModal(true)}
          className="btn-primary text-sm px-4 py-2 flex items-center gap-2"
        >
          <Icon name="PlusCircle" size={16} />
          New Assignment
        </button>
      </div>

      <div className="space-y-3">
        {assignments.map((assignment) => (
          <div key={assignment.id} className="card p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded">{assignment.course}</span>
                  <span className={`text-xs px-2 py-1 rounded ${assignment.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                    {assignment.status}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-gray-900">{assignment.title}</h3>
                <p className="text-sm text-gray-500 mt-1">Due: {assignment.dueDate}</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-gray-600">Submissions</span>
                <span className="font-semibold text-gray-900">{assignment.submitted}/{assignment.total}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full"
                  style={{ width: `${(assignment.submitted / assignment.total) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
                <Icon name="Edit" size={13} />
                Edit
              </button>
              <button className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
                <Icon name="Eye" size={13} />
                View Submissions
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* New Assignment Modal */}
      <Modal isOpen={showNewAssignmentModal} title="Create Assignment" onClose={() => setShowNewAssignmentModal(false)}>
        <form onSubmit={handleCreateAssignment} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Title</label>
            <input
              type="text"
              name="title"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Assignment title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Course</label>
            <select
              name="course"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option>CS401</option>
              <option>CS305</option>
              <option>CS210</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Due Date</label>
            <input
              type="date"
              name="dueDate"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn-primary flex-1">Create</button>
            <button type="button" onClick={() => setShowNewAssignmentModal(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
