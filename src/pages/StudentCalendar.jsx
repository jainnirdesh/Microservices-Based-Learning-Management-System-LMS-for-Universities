import React, { useState } from 'react';
import { calendarEvents, announcements } from '../data/mockData';
import { Modal, Button } from '../components/Modal';

export function StudentCalendar() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [expandedAnnouncements, setExpandedAnnouncements] = useState({});
  const [filterType, setFilterType] = useState('all');

  const filteredAnnouncements = filterType === 'all' 
    ? announcements 
    : announcements.filter(a => a.id.toString().includes(filterType));

  const handleMarkAsRead = (id) => {
    setExpandedAnnouncements(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Calendar & Deadlines</h2>
        
        {/* Events List */}
        <div className="space-y-3">
          {calendarEvents.map(event => (
            <div
              key={event.id}
              onClick={() => {
                setSelectedEvent(event);
                setShowModal(true);
              }}
              className={`p-4 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-shadow ${
                event.type === 'deadline'
                  ? 'border-red-500 bg-red-50 hover:bg-red-100'
                  : event.type === 'exam'
                  ? 'border-purple-500 bg-purple-50 hover:bg-purple-100'
                  : 'border-blue-500 bg-blue-50 hover:bg-blue-100'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-gray-900">{event.title}</span>
                    {event.priority === 'high' && (
                      <span className="px-2 py-1 bg-red-200 text-red-800 text-xs font-bold rounded">HIGH PRIORITY</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{event.course} • {event.date}</p>
                  <p className="text-sm text-gray-700 mt-1">{event.type === 'deadline' ? 'Due: ' : 'Time: '}{event.time}</p>
                  {event.location && <p className="text-sm text-gray-600">📍 {event.location}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Announcements Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Course Announcements</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                filterType === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {filteredAnnouncements.map(announcement => (
            <div
              key={announcement.id}
              className={`p-4 rounded-lg border ${
                announcement.read
                  ? 'border-gray-200 bg-gray-50'
                  : 'border-blue-300 bg-blue-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{announcement.title}</h3>
                    {!announcement.read && (
                      <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded">NEW</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{announcement.course} • {announcement.date}</p>
                  <p className="text-sm text-gray-700 mt-2">{announcement.message}</p>
                  <p className="text-xs text-gray-500 mt-2">By {announcement.author}</p>
                </div>
                <button
                  onClick={() => handleMarkAsRead(announcement.id)}
                  className="text-gray-500 hover:text-gray-700 text-lg ml-4"
                >
                  {expandedAnnouncements[announcement.id] ? '✓' : '○'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Event Detail Modal */}
      <Modal
        isOpen={showModal}
        title={selectedEvent?.title || ''}
        onClose={() => {
          setShowModal(false);
          setSelectedEvent(null);
        }}
      >
        {selectedEvent && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Course</p>
              <p className="font-semibold">{selectedEvent.course}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date</p>
              <p className="font-semibold">{selectedEvent.date}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Time</p>
              <p className="font-semibold">{selectedEvent.time}</p>
            </div>
            {selectedEvent.location && (
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-semibold">{selectedEvent.location}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Type</p>
              <p className="font-semibold capitalize">{selectedEvent.type}</p>
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={() => setShowModal(false)} variant="secondary" className="flex-1">
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
