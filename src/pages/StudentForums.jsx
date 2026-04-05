import React, { useState } from 'react';
import { forumTopics } from '../data/mockData';
import { Modal, Button } from '../components/Modal';

export function StudentForums() {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showNewTopicModal, setShowNewTopicModal] = useState(false);
  const [newTopic, setNewTopic] = useState({ title: '', course: 'CS401', message: '' });
  const [filterCourse, setFilterCourse] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const courses = ['all', ...new Set(forumTopics.map(t => t.course))];

  const filteredTopics = filterCourse === 'all'
    ? forumTopics
    : forumTopics.filter(t => t.course === filterCourse);

  const sortedTopics = [...filteredTopics].sort((a, b) => {
    if (sortBy === 'recent') return b.id - a.id;
    if (sortBy === 'popular') return b.upvotes - a.upvotes;
    if (sortBy === 'replies') return b.replies - a.replies;
    return 0;
  });

  const handleNewTopic = () => {
    // Reset form
    setNewTopic({ title: '', course: 'CS401', message: '' });
    setShowNewTopicModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with Action Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Discussion Forums</h2>
          <p className="text-gray-600 mt-1">Ask questions, share knowledge, and learn from peers</p>
        </div>
        <button
          onClick={() => setShowNewTopicModal(true)}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
        >
          + New Topic
        </button>
      </div>

      {/* Filter and Sort */}
      <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Course</label>
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              {courses.map(course => (
                <option key={course} value={course}>
                  {course === 'all' ? 'All Courses' : course}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="replies">Most Replies</option>
            </select>
          </div>
        </div>
      </div>

      {/* Forum Topics List */}
      <div className="space-y-3">
        {sortedTopics.map(topic => (
          <div
            key={topic.id}
            onClick={() => {
              setSelectedTopic(topic);
              setShowModal(true);
            }}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-blue-500"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{topic.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    topic.status === 'answered'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {topic.status === 'answered' ? '✓ Answered' : 'Open'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{topic.course} • Asked by {topic.author}</p>
              </div>
            </div>

            <div className="flex gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <span>💬</span>
                <span>{topic.replies} replies</span>
              </div>
              <div className="flex items-center gap-1">
                <span>👍</span>
                <span>{topic.upvotes} upvotes</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sortedTopics.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500 text-lg">No topics found</p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-blue-500">{forumTopics.length}</p>
          <p className="text-sm text-gray-600 mt-1">Topics</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-green-500">{forumTopics.reduce((sum, t) => sum + t.replies, 0)}</p>
          <p className="text-sm text-gray-600 mt-1">Total Replies</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-purple-500">{forumTopics.reduce((sum, t) => sum + t.upvotes, 0)}</p>
          <p className="text-sm text-gray-600 mt-1">Total Upvotes</p>
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
              <p className="text-sm text-gray-600">Status</p>
              <p className="font-semibold capitalize">{selectedTopic.status}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Replies & Engagement</p>
              <div className="flex gap-4 mt-2">
                <span className="text-lg font-bold text-blue-600">{selectedTopic.replies} replies</span>
                <span className="text-lg font-bold text-purple-600">{selectedTopic.upvotes} upvotes</span>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="primary" className="flex-1">
                View Answers
              </Button>
              <Button onClick={() => setShowModal(false)} variant="secondary" className="flex-1">
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* New Topic Modal */}
      <Modal
        isOpen={showNewTopicModal}
        title="Start a New Discussion"
        onClose={() => setShowNewTopicModal(false)}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Course</label>
            <select
              value={newTopic.course}
              onChange={(e) => setNewTopic({ ...newTopic, course: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="CS401">CS401 - Distributed Systems</option>
              <option value="CS305">CS305 - Operating Systems</option>
              <option value="MA201">MA201 - Advanced Calculus</option>
              <option value="CS210">CS210 - Data Structures</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Topic Title</label>
            <input
              type="text"
              value={newTopic.title}
              onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
              placeholder="What's your question?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              value={newTopic.message}
              onChange={(e) => setNewTopic({ ...newTopic, message: e.target.value })}
              placeholder="Provide more details..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              rows="4"
            />
          </div>
          <div className="flex gap-3">
            <Button onClick={handleNewTopic} variant="primary" className="flex-1">
              Post Topic
            </Button>
            <Button onClick={() => setShowNewTopicModal(false)} variant="secondary" className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
