import React, { useState } from 'react';
import { forumTopics } from '../data/mockData';
import { Modal, Button } from '../components/Modal';

export function FacultyForumsModeration() {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [topicsList, setTopicsList] = useState(forumTopics.map(t => ({ ...t, needsModeration: Math.random() > 0.6 })));

  const needsModerationCount = topicsList.filter(t => t.needsModeration).length;

  const filteredTopics = filterStatus === 'all'
    ? topicsList
    : filterStatus === 'moderation'
    ? topicsList.filter(t => t.needsModeration)
    : topicsList.filter(t => !t.needsModeration);

  const handleApprove = (id) => {
    setTopicsList(topicsList.map(t => t.id === id ? { ...t, needsModeration: false, status: 'approved' } : t));
  };

  const handleReject = (id) => {
    setTopicsList(topicsList.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Forums Moderation</h2>
        <p className="text-gray-600 mt-1">Monitor and manage course discussion forums</p>
      </div>

      {/* Alert Section */}
      {needsModerationCount > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
          <p className="font-semibold text-yellow-800">⚠️ {needsModerationCount} topics need moderation</p>
          <p className="text-sm text-yellow-700 mt-1">Review flagged content and approve or reject posts</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 text-center border-l-4 border-blue-500">
          <p className="text-2xl font-bold text-gray-900">{topicsList.length}</p>
          <p className="text-sm text-gray-600 mt-1">Total Topics</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center border-l-4 border-green-500">
          <p className="text-2xl font-bold text-gray-900">{topicsList.filter(t => t.status === 'answered').length}</p>
          <p className="text-sm text-gray-600 mt-1">Answered</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center border-l-4 border-yellow-500">
          <p className="text-2xl font-bold text-gray-900">{needsModerationCount}</p>
          <p className="text-sm text-gray-600 mt-1">Need Review</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center border-l-4 border-purple-500">
          <p className="text-2xl font-bold text-gray-900">{topicsList.reduce((sum, t) => sum + t.upvotes, 0)}</p>
          <p className="text-sm text-gray-600 mt-1">Total Engagement</p>
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
          All Topics
        </button>
        <button
          onClick={() => setFilterStatus('moderation')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterStatus === 'moderation'
              ? 'bg-yellow-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Needs Moderation ({needsModerationCount})
        </button>
        <button
          onClick={() => setFilterStatus('approved')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterStatus === 'approved'
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Approved
        </button>
      </div>

      {/* Topics List */}
      <div className="space-y-3">
        {filteredTopics.map(topic => (
          <div
            key={topic.id}
            className={`bg-white rounded-lg shadow-sm p-6 border-l-4 ${
              topic.needsModeration
                ? 'border-yellow-500'
                : 'border-green-500'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{topic.title}</h3>
                  {topic.needsModeration && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded">
                      FLAG: Review needed
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{topic.course} • Asked by {topic.author}</p>
              </div>
            </div>

            <div className="flex gap-6 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <span>💬</span>
                <span>{topic.replies} replies</span>
              </div>
              <div className="flex items-center gap-1">
                <span>👍</span>
                <span>{topic.upvotes} upvotes</span>
              </div>
            </div>

            {topic.needsModeration && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleApprove(topic.id)}
                  className="flex-1 px-3 py-2 bg-green-500 text-white rounded font-medium text-sm hover:bg-green-600 transition-colors"
                >
                  ✓ Approve
                </button>
                <button
                  onClick={() => handleReject(topic.id)}
                  className="flex-1 px-3 py-2 bg-red-500 text-white rounded font-medium text-sm hover:bg-red-600 transition-colors"
                >
                  ✕ Reject
                </button>
                <button
                  onClick={() => {
                    setSelectedTopic(topic);
                    setShowModal(true);
                  }}
                  className="flex-1 px-3 py-2 bg-blue-500 text-white rounded font-medium text-sm hover:bg-blue-600 transition-colors"
                >
                  View Details
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredTopics.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500 text-lg">No topics to display</p>
        </div>
      )}

      {/* Moderation Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">📋 Moderation Guidelines</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>✓ <strong>Approve posts that:</strong> Follow course guidelines, are on-topic, respectful, and academically appropriate</p>
          <p>✕ <strong>Reject posts that:</strong> Contain inappropriate language, off-topic content, spam, or violate academic integrity</p>
          <p>⚠️ <strong>Flag for review:</strong> Posts with potential plagiarism or disputes between students</p>
        </div>
      </div>

      {/* Topic Detail Modal */}
      <Modal
        isOpen={showModal}
        title={selectedTopic?.title || ''}
        onClose={() => {
          setShowModal(false);
          setSelectedTopic(null);
        }}
        size="lg"
      >
        {selectedTopic && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Course</p>
              <p className="font-semibold">{selectedTopic.course}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Asked by</p>
              <p className="font-semibold">{selectedTopic.author}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Engagement</p>
              <div className="flex gap-4 mt-2">
                <span className="text-lg font-bold text-blue-600">{selectedTopic.replies} replies</span>
                <span className="text-lg font-bold text-purple-600">{selectedTopic.upvotes} upvotes</span>
              </div>
            </div>
            {selectedTopic.needsModeration && (
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded mt-4">
                <p className="text-yellow-800 font-semibold">Flagged for Review</p>
                <p className="text-sm text-yellow-700 mt-1">This topic may contain content that needs moderator attention</p>
              </div>
            )}
            <div className="flex gap-3 mt-6">
              {selectedTopic.needsModeration && (
                <>
                  <Button
                    onClick={() => {
                      handleApprove(selectedTopic.id);
                      setShowModal(false);
                    }}
                    variant="primary"
                    className="flex-1"
                  >
                    Approve Topic
                  </Button>
                  <Button
                    onClick={() => {
                      handleReject(selectedTopic.id);
                      setShowModal(false);
                    }}
                    variant="danger"
                    className="flex-1"
                  >
                    Reject Topic
                  </Button>
                </>
              )}
              <Button onClick={() => setShowModal(false)} variant="secondary" className={selectedTopic.needsModeration ? '' : 'flex-1'}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
