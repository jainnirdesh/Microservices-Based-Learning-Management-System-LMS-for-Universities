import React, { useState } from 'react';
import { studyGroups } from '../data/mockData';
import { Modal, Button } from '../components/Modal';

export function FacultyStudyGroupMonitoring() {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const groupsWithEngagement = studyGroups.map(g => ({
    ...g,
    lastActive: '2 hours ago',
    engagement: Math.floor(Math.random() * 100) + 50,
  }));

  const filteredGroups = filterStatus === 'all'
    ? groupsWithEngagement
    : filterStatus === 'focused'
    ? groupsWithEngagement.filter(g => g.focused)
    : groupsWithEngagement.filter(g => !g.focused);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Study Group Monitoring</h2>
        <p className="text-gray-600 mt-1">Monitor and support active student study groups</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 text-center border-l-4 border-blue-500">
          <p className="text-2xl font-bold text-gray-900">{groupsWithEngagement.length}</p>
          <p className="text-sm text-gray-600 mt-1">Active Groups</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center border-l-4 border-green-500">
          <p className="text-2xl font-bold text-gray-900">{groupsWithEngagement.reduce((sum, g) => sum + g.members, 0)}</p>
          <p className="text-sm text-gray-600 mt-1">Total Members</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center border-l-4 border-purple-500">
          <p className="text-2xl font-bold text-gray-900">{groupsWithEngagement.filter(g => g.focused).length}</p>
          <p className="text-sm text-gray-600 mt-1">Focused Groups</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center border-l-4 border-orange-500">
          <p className="text-2xl font-bold text-gray-900">{Math.round(groupsWithEngagement.reduce((sum, g) => sum + g.engagement, 0) / groupsWithEngagement.length)}%</p>
          <p className="text-sm text-gray-600 mt-1">Avg Engagement</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterStatus === 'all'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Groups
        </button>
        <button
          onClick={() => setFilterStatus('focused')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterStatus === 'focused'
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Focused (Exam Prep)
        </button>
        <button
          onClick={() => setFilterStatus('peer')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterStatus === 'peer'
              ? 'bg-purple-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Peer Learning
        </button>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredGroups.map(group => (
          <div
            key={group.id}
            className={`bg-white rounded-lg shadow-sm p-6 border-l-4 cursor-pointer hover:shadow-md transition-shadow ${
              group.focused ? 'border-green-500' : 'border-blue-500'
            }`}
            onClick={() => {
              setSelectedGroup(group);
              setShowModal(true);
            }}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">{group.name}</h3>
                <p className="text-sm text-gray-600">{group.course}</p>
              </div>
              {group.focused && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">
                  FOCUSED
                </span>
              )}
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">👥 Members</span>
                <span className="font-semibold text-gray-900">{group.members}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Leader</span>
                <span className="font-semibold text-gray-900">{group.leader}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Last Active</span>
                <span className="font-semibold text-gray-900">{group.lastActive}</span>
              </div>
            </div>

            {/* Engagement Bar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-gray-600">Engagement</span>
                <span className="text-xs font-bold text-gray-700">{group.engagement}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    group.engagement > 75 ? 'bg-green-500' : group.engagement > 50 ? 'bg-yellow-500' : 'bg-orange-500'
                  }`}
                  style={{ width: `${group.engagement}%` }}
                ></div>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded font-medium text-sm hover:bg-blue-200 transition-colors">
                Message
              </button>
              <button className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded font-medium text-sm hover:bg-gray-200 transition-colors">
                Join
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredGroups.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500 text-lg">No groups found</p>
        </div>
      )}

      {/* Group Insights */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">💡 Group Insights</h3>
        <div className="space-y-3">
          <div className="p-3 bg-white border-l-4 border-green-500 rounded">
            <p className="font-semibold text-gray-900">Most Active Group</p>
            <p className="text-sm text-gray-600 mt-1">{groupsWithEngagement.reduce((max, g) => g.engagement > max.engagement ? g : max).name} - {groupsWithEngagement.reduce((max, g) => g.engagement > max.engagement ? g : max).engagement}% engagement</p>
          </div>
          <div className="p-3 bg-white border-l-4 border-blue-500 rounded">
            <p className="font-semibold text-gray-900">High-Quality Learning Environment</p>
            <p className="text-sm text-gray-600 mt-1">Most groups maintain focused discussion on course topics</p>
          </div>
          <div className="p-3 bg-white border-l-4 border-purple-500 rounded">
            <p className="font-semibold text-gray-900">Peer Tutoring Opportunity</p>
            <p className="text-sm text-gray-600 mt-1">Consider identifying top performers in study groups as peer tutors</p>
          </div>
        </div>
      </div>

      {/* Group Detail Modal */}
      <Modal
        isOpen={showModal}
        title={selectedGroup?.name || ''}
        onClose={() => {
          setShowModal(false);
          setSelectedGroup(null);
        }}
        size="lg"
      >
        {selectedGroup && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Course</p>
                <p className="font-semibold">{selectedGroup.course}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Type</p>
                <p className="font-semibold">{selectedGroup.focused ? 'Focused (Exam Prep)' : 'Peer Learning'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Members</p>
                <p className="font-semibold">{selectedGroup.members} students</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Leader</p>
                <p className="font-semibold">{selectedGroup.leader}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Engagement Level</p>
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-500 h-3 rounded-full"
                    style={{ width: `${selectedGroup.engagement}%` }}
                  ></div>
                </div>
                <span className="font-bold text-lg text-gray-900">{selectedGroup.engagement}%</span>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Member List</p>
              <div className="bg-gray-50 rounded p-3 max-h-40 overflow-y-auto space-y-2">
                {[...Array(Math.min(5, selectedGroup.members))].map((_, i) => (
                  <div key={i} className="text-sm text-gray-700">
                    • Student {String.fromCharCode(65 + i)}
                  </div>
                ))}
                {selectedGroup.members > 5 && (
                  <div className="text-sm text-gray-600 pt-2 border-t">
                    +{selectedGroup.members - 5} more members
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="primary" className="flex-1">
                Message Group
              </Button>
              <Button variant="secondary" className="flex-1">
                View Activity
              </Button>
              <Button onClick={() => setShowModal(false)} className="flex-1">
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
