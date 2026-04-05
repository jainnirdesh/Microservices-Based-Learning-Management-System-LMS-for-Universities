import React, { useState } from 'react';
import { studyMaterials, resourcesByTopic } from '../data/mockData';

export function StudentMaterials() {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredMaterials = studyMaterials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         material.course.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || material.type === filterType;
    return matchesSearch && matchesType;
  });

  const materialTypes = ['all', 'PDF', 'Video', 'Interactive'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-sm p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">Study Materials Hub</h2>
        <p className="text-blue-100">Access organized learning resources across all your courses</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Search materials by title or course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {materialTypes.map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterType === type
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type === 'all' ? 'All Types' : type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMaterials.map(material => (
          <div key={material.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full mb-2">
                  {material.type}
                </div>
              </div>
              <div className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">
                {material.course}
              </div>
            </div>

            <h3 className="font-bold text-gray-900 mb-2">{material.title}</h3>

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              {material.size && <p>📦 Size: {material.size}</p>}
              {material.duration && <p>⏱️ Duration: {material.duration}</p>}
              {material.downloads && <p>⬇️ Downloads: {material.downloads}</p>}
              {material.views && <p>👁️ Views: {material.views}</p>}
            </div>

            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 bg-blue-500 text-white rounded font-medium text-sm hover:bg-blue-600 transition-colors">
                View
              </button>
              <button className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded font-medium text-sm hover:bg-gray-200 transition-colors">
                Download
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredMaterials.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No materials found matching your search</p>
        </div>
      )}

      {/* Resources by Topic */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Resources by Topic</h3>

        <div className="space-y-4">
          {resourcesByTopic.map((topicGroup, idx) => (
            <div key={idx} className="border rounded-lg overflow-hidden">
              <button
                onClick={() => setSelectedTopic(selectedTopic === topicGroup.topic ? null : topicGroup.topic)}
                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex justify-between items-center font-semibold text-gray-900"
              >
                {topicGroup.topic}
                <span className="text-xl transition-transform">{selectedTopic === topicGroup.topic ? '▼' : '▶'}</span>
              </button>

              {selectedTopic === topicGroup.topic && (
                <div className="p-4 bg-white space-y-3">
                  {topicGroup.resources.map((resource, ridx) => (
                    <div key={ridx} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900">{resource.title}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          resource.difficulty === 'beginner'
                            ? 'bg-green-100 text-green-700'
                            : resource.difficulty === 'intermediate'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {resource.difficulty.charAt(0).toUpperCase() + resource.difficulty.slice(1)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-3">
                        <p>Type: {resource.type}</p>
                        <p>{resource.duration ? `Duration: ${resource.duration}` : `Time: ${resource.timeToRead || resource.timeToComplete}`}</p>
                      </div>
                      <button className="w-full px-3 py-2 bg-blue-500 text-white rounded text-sm font-medium hover:bg-blue-600 transition-colors">
                        Start Learning
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-blue-500">{studyMaterials.length}</p>
          <p className="text-sm text-gray-600 mt-1">Total Materials</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-green-500">
            {new Set(studyMaterials.map(m => m.course)).size}
          </p>
          <p className="text-sm text-gray-600 mt-1">Courses Covered</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-purple-500">
            {studyMaterials.reduce((sum, m) => sum + (m.downloads || m.views || 0), 0)}
          </p>
          <p className="text-sm text-gray-600 mt-1">Total Downloads</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-orange-500">{resourcesByTopic.length}</p>
          <p className="text-sm text-gray-600 mt-1">Topics Organized</p>
        </div>
      </div>
    </div>
  );
}
