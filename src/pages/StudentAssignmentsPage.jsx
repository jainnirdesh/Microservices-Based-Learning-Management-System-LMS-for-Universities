import React, { useState } from 'react';
import { Icon } from '../components/Icon';
import { Modal, Button } from '../components/Modal';
import { studentAssignments } from '../data/mockData';

export function StudentAssignments() {
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [filter, setFilter] = useState('all');

  const displayAssignments = filter === 'pending' ? studentAssignments.filter(a => !a.submitted) : studentAssignments;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
          <p className="text-sm text-gray-500 mt-1">Track and submit your assignments</p>
        </div>
        <div className="flex gap-2">
          {['all', 'pending'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-lg transition ${
                filter === f ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f === 'all' ? 'All' : 'Pending'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {displayAssignments.map((assignment) => (
          <div key={assignment.id} className="card p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono text-gray-400">{assignment.course}</span>
                  {assignment.submitted && <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">Submitted</span>}
                  {!assignment.submitted && assignment.daysLeft <= 3 && <span className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded">Urgent</span>}
                </div>
                <h3 className="text-base font-semibold text-gray-900">{assignment.title}</h3>
                {!assignment.submitted && <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>}
                <p className="text-sm text-gray-500 mt-2">Due: {assignment.dueDate}</p>
              </div>
              <div className="text-right">
                {assignment.submitted && <div className="text-sm font-bold text-green-600 mb-2">{assignment.score}%</div>}
                {!assignment.submitted && <div className="text-sm font-semibold text-amber-600 mb-2">{assignment.daysLeft} days left</div>}
              </div>
            </div>

            {assignment.submitted && assignment.feedback && (
              <div className="bg-blue-50 p-3 rounded-lg mb-3">
                <p className="text-xs font-semibold text-blue-900 mb-1">Feedback</p>
                <p className="text-sm text-blue-800">{assignment.feedback}</p>
              </div>
            )}

            {assignment.submitted && (
              <div className="mb-3">
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${assignment.score}%` }} />
                </div>
              </div>
            )}

            <div className="flex gap-2">
              {!assignment.submitted && (
                <button
                  onClick={() => {
                    setSelectedAssignment(assignment);
                    setShowSubmitModal(true);
                  }}
                  className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1"
                >
                  <Icon name="Upload" size={13} />
                  Submit
                </button>
              )}
              <button className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
                <Icon name="FileText" size={13} />
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Submit Modal */}
      <Modal isOpen={showSubmitModal} title="Submit Assignment" onClose={() => setShowSubmitModal(false)} size="lg">
        <div className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm font-semibold text-gray-900">{selectedAssignment?.title}</p>
            <p className="text-xs text-gray-500 mt-1">Course: {selectedAssignment?.course}</p>
            <p className="text-xs text-gray-500">Due: {selectedAssignment?.dueDate}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Upload File</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/20 transition">
              <Icon name="Upload" size={24} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-900">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-500 mt-1">PDF, DOC, ZIP up to 10MB</p>
              <input type="file" className="hidden" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Comments</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows="3"
              placeholder="Add any comments for your instructor..."
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button className="btn-primary flex-1">Submit</button>
            <button onClick={() => setShowSubmitModal(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
