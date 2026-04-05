import React, { useState } from 'react';
import { studyGroups, tutoringRequests } from '../data/mockData';
import { Modal, Button } from '../components/Modal';

export function StudentGroups() {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showTutoringModal, setShowTutoringModal] = useState(false);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [showNewTutoringModal, setShowNewTutoringModal] = useState(false);
  const [selectedTutoring, setSelectedTutoring] = useState(null);
  const [newTutoring, setNewTutoring] = useState({ subject: '', tutor: '', date: '' });

  const handleJoinGroup = () => {
    setShowGroupModal(false);
  };

  const handleNewGroup = () => {
    setShowNewGroupModal(false);
  };

  const handleNewTutoring = () => {
    setShowTutoringModal(false);
  };

  const handlePostTutoring = () => {
    setShowNewTutoringModal(false);
    setNewTutoring({ subject: '', tutor: '', date: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Study Groups & Tutoring</h2>
        <p className="text-gray-600 mt-1">Connect with peers and get personalized academic support</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button className="px-4 py-3 font-semibold text-blue-600 border-b-2 border-blue-600">
          Study Groups
        </button>
        <button className="px-4 py-3 font-semibold text-gray-600 border-b-2 border-transparent hover:text-gray-900">
          Tutoring
        </button>
      </div>

      {/* Study Groups Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Active Study Groups</h3>
          <button
            onClick={() => setShowNewGroupModal(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
          >
            + Create Group
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {studyGroups.map(group => (
            <div
              key={group.id}
              onClick={() => {
                setSelectedGroup(group);
                setShowGroupModal(true);
              }}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-green-500"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-bold text-gray-900">{group.name}</h4>
                  <p className="text-sm text-gray-600">{group.course}</p>
                </div>
                {group.focused && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">
                    Focused
                  </span>
                )}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>👥</span>
                  <span>{group.members} members</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>👤</span>
                  <span>Led by {group.leader}</span>
                </div>
              </div>

              <button className="w-full px-3 py-2 bg-green-500 text-white rounded font-medium text-sm hover:bg-green-600 transition-colors">
                Join Group
              </button>
            </div>
          ))}
        </div>

        {studyGroups.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">No study groups available</p>
          </div>
        )}
      </div>

      {/* Suggested Groups */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">🎯 Suggested for You</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white rounded border border-gray-200">
            <div>
              <p className="font-semibold text-gray-900">Advanced Algorithms Study Group</p>
              <p className="text-sm text-gray-600">CS401 • 12 members</p>
            </div>
            <button className="px-4 py-2 bg-blue-500 text-white rounded font-medium text-sm hover:bg-blue-600 transition-colors">
              Join
            </button>
          </div>
          <div className="flex items-center justify-between p-3 bg-white rounded border border-gray-200">
            <div>
              <p className="font-semibold text-gray-900">OS Concepts Mastery</p>
              <p className="text-sm text-gray-600">CS305 • 8 members</p>
            </div>
            <button className="px-4 py-2 bg-blue-500 text-white rounded font-medium text-sm hover:bg-blue-600 transition-colors">
              Join
            </button>
          </div>
        </div>
      </div>

      {/* Tutoring Section */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Tutoring Requests</h3>
          <button
            onClick={() => setShowNewTutoringModal(true)}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors"
          >
            + Request Tutoring
          </button>
        </div>

        <div className="space-y-3">
          {tutoringRequests.map(request => (
            <div
              key={request.id}
              onClick={() => {
                setSelectedTutoring(request);
                setShowTutoringModal(true);
              }}
              className={`p-6 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-shadow ${
                request.status === 'scheduled'
                  ? 'bg-blue-50 border-blue-500'
                  : request.status === 'completed'
                  ? 'bg-green-50 border-green-500'
                  : 'bg-yellow-50 border-yellow-500'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900">{request.subject}</h4>
                  <p className="text-sm text-gray-600 mt-1">Tutor: {request.tutor}</p>
                  {request.date && <p className="text-sm text-gray-600">{request.date} • {request.time}</p>}
                  {request.rating && (
                    <p className="text-sm text-gray-600 mt-1">
                      Rating: {request.rating} ⭐
                    </p>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  request.status === 'scheduled'
                    ? 'bg-blue-200 text-blue-700'
                    : request.status === 'completed'
                    ? 'bg-green-200 text-green-700'
                    : 'bg-yellow-200 text-yellow-700'
                }`}>
                  {request.status === 'scheduled'
                    ? '📅 Scheduled'
                    : request.status === 'completed'
                    ? '✓ Completed'
                    : '⏳ Pending'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {tutoringRequests.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">No tutoring requests yet</p>
          </div>
        )}
      </div>

      {/* Group Detail Modal */}
      <Modal
        isOpen={showGroupModal}
        title={selectedGroup?.name || ''}
        onClose={() => {
          setShowGroupModal(false);
          setSelectedGroup(null);
        }}
      >
        {selectedGroup && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Course</p>
              <p className="font-semibold">{selectedGroup.course}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Leader</p>
              <p className="font-semibold">{selectedGroup.leader}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Members</p>
              <p className="font-semibold">{selectedGroup.members}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Type</p>
              <p className="font-semibold">{selectedGroup.focused ? 'Focused (Exam prep)' : 'General (Peer learning)'}</p>
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={handleJoinGroup} variant="primary" className="flex-1">
                Join Group
              </Button>
              <Button onClick={() => setShowGroupModal(false)} variant="secondary" className="flex-1">
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Tutoring Detail Modal */}
      <Modal
        isOpen={showTutoringModal}
        title={selectedTutoring?.subject || ''}
        onClose={() => {
          setShowTutoringModal(false);
          setSelectedTutoring(null);
        }}
      >
        {selectedTutoring && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Tutor</p>
              <p className="font-semibold">{selectedTutoring.tutor}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="font-semibold capitalize">{selectedTutoring.status}</p>
            </div>
            {selectedTutoring.date && (
              <>
                <div>
                  <p className="text-sm text-gray-600">Date & Time</p>
                  <p className="font-semibold">{selectedTutoring.date} at {selectedTutoring.time}</p>
                </div>
              </>
            )}
            {selectedTutoring.rating && (
              <div>
                <p className="text-sm text-gray-600">Rating</p>
                <p className="font-semibold">{selectedTutoring.rating} ⭐</p>
              </div>
            )}
            <div className="flex gap-3 mt-6">
              {selectedTutoring.status === 'scheduled' && (
                <Button variant="primary" className="flex-1">
                  Join Session
                </Button>
              )}
              {selectedTutoring.status === 'completed' && (
                <Button variant="primary" className="flex-1">
                  Book Again
                </Button>
              )}
              <Button onClick={() => setShowTutoringModal(false)} variant="secondary" className="flex-1">
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* New Group Modal */}
      <Modal
        isOpen={showNewGroupModal}
        title="Create a New Study Group"
        onClose={() => setShowNewGroupModal(false)}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Group Name</label>
            <input
              type="text"
              placeholder="e.g., Distributed Systems Study Group"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Course</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none">
              <option>CS401 - Distributed Systems</option>
              <option>CS305 - Operating Systems</option>
              <option>MA201 - Advanced Calculus</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Focus Type</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="radio" name="focus" value="general" defaultChecked />
                <span>General peer learning</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="focus" value="exam" />
                <span>Exam preparation (Focused)</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleNewGroup} variant="primary" className="flex-1">
              Create Group
            </Button>
            <Button onClick={() => setShowNewGroupModal(false)} variant="secondary" className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* New Tutoring Modal */}
      <Modal
        isOpen={showNewTutoringModal}
        title="Request Tutoring Session"
        onClose={() => setShowNewTutoringModal(false)}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
            <input
              type="text"
              value={newTutoring.subject}
              onChange={(e) => setNewTutoring({ ...newTutoring, subject: e.target.value })}
              placeholder="What do you need help with?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Date</label>
            <input
              type="date"
              value={newTutoring.date}
              onChange={(e) => setNewTutoring({ ...newTutoring, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tutor Type</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none">
              <option>Faculty Tutor</option>
              <option>Senior Student</option>
              <option>Any</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Details</label>
            <textarea
              placeholder="Describe what you need help with..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              rows="3"
            />
          </div>
          <div className="flex gap-3">
            <Button onClick={handlePostTutoring} variant="primary" className="flex-1">
              Submit Request
            </Button>
            <Button onClick={() => setShowNewTutoringModal(false)} variant="secondary" className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
