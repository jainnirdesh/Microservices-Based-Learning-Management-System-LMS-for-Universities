import React, { useState } from 'react';
import { calendarEvents, announcements } from '../data/mockData';
import { Modal, Button } from '../components/Modal';

export function FacultyCalendar() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', course: 'CS401', message: '' });
  const [announcementsList, setAnnouncementsList] = useState(announcements);

  const classEvents = calendarEvents.filter(e => e.type === 'class');
  const deadlineEvents = calendarEvents.filter(e => e.type === 'deadline');
  const examEvents = calendarEvents.filter(e => e.type === 'exam');

  const handlePostAnnouncement = () => {
    if (newAnnouncement.title && newAnnouncement.message) {
      setAnnouncementsList([
        {
          id: announcementsList.length + 1,
          ...newAnnouncement,
          date: new Date().toLocaleDateString(),
          author: 'Dr. Vikram Singh',
          read: false,
        },
        ...announcementsList,
      ]);
      setNewAnnouncement({ title: '', course: 'CS401', message: '' });
      setShowAnnouncementModal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Academic Calendar</h2>
          <p className="text-gray-600 mt-1">Manage class schedule and post announcements to students</p>
        </div>
        <button
          onClick={() => setShowAnnouncementModal(true)}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
        >
          + Post Announcement
        </button>
      </div>

      {/* Calendar Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <p className="text-sm text-gray-600">Upcoming Classes</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{classEvents.length}</p>
          <p className="text-xs text-blue-600 mt-2">This month</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500">
          <p className="text-sm text-gray-600">Assignment Deadlines</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{deadlineEvents.length}</p>
          <p className="text-xs text-red-600 mt-2">Pending submissions</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
          <p className="text-sm text-gray-600">Scheduled Exams</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{examEvents.length}</p>
          <p className="text-xs text-purple-600 mt-2">To be conducted</p>
        </div>
      </div>

      {/* Events Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Classes */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">📚 Classes</h3>
          <div className="space-y-3">
            {classEvents.map(event => (
              <div
                key={event.id}
                onClick={() => {
                  setSelectedEvent(event);
                  setShowModal(true);
                }}
                className="p-4 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer hover:shadow-md transition-shadow"
              >
                <p className="font-semibold text-gray-900">{event.title}</p>
                <p className="text-sm text-gray-600 mt-1">{event.date}</p>
                <p className="text-sm text-gray-600">{event.time}</p>
                {event.location && <p className="text-sm text-gray-600">📍 {event.location}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Deadlines */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">⏰ Deadlines</h3>
          <div className="space-y-3">
            {deadlineEvents.map(event => (
              <div
                key={event.id}
                onClick={() => {
                  setSelectedEvent(event);
                  setShowModal(true);
                }}
                className={`p-4 rounded-lg cursor-pointer hover:shadow-md transition-shadow ${
                  event.priority === 'high'
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-yellow-50 border border-yellow-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{event.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{event.date}</p>
                  </div>
                  {event.priority === 'high' && (
                    <span className="px-2 py-1 bg-red-200 text-red-800 text-xs font-bold rounded">
                      URGENT
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Exams */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">📝 Exams</h3>
          <div className="space-y-3">
            {examEvents.map(event => (
              <div
                key={event.id}
                onClick={() => {
                  setSelectedEvent(event);
                  setShowModal(true);
                }}
                className="p-4 bg-purple-50 border border-purple-200 rounded-lg cursor-pointer hover:shadow-md transition-shadow"
              >
                <p className="font-semibold text-gray-900">{event.title}</p>
                <p className="text-sm text-gray-600 mt-1">{event.date}</p>
                <p className="text-sm text-gray-600">{event.time}</p>
                <p className="text-sm text-gray-600">📍 {event.location}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Announcements */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Announcements</h3>
        <div className="space-y-3">
          {announcementsList.slice(0, 5).map(announcement => (
            <div key={announcement.id} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{announcement.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{announcement.course} • {announcement.date}</p>
                  <p className="text-sm text-gray-700 mt-2">{announcement.message}</p>
                </div>
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
            <div className="flex gap-3 mt-6">
              <Button onClick={() => setShowModal(false)} variant="secondary" className="flex-1">
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Announcement Modal */}
      <Modal
        isOpen={showAnnouncementModal}
        title="Post Announcement"
        onClose={() => setShowAnnouncementModal(false)}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Course</label>
            <select
              value={newAnnouncement.course}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, course: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option>CS401 - Distributed Systems</option>
              <option>CS305 - Operating Systems</option>
              <option>MA201 - Advanced Calculus</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={newAnnouncement.title}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
              placeholder="Announcement title"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
            <textarea
              value={newAnnouncement.message}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
              placeholder="What would you like to announce?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              rows="4"
            />
          </div>
          <div className="flex gap-3">
            <Button onClick={handlePostAnnouncement} variant="primary" className="flex-1">
              Post Announcement
            </Button>
            <Button onClick={() => setShowAnnouncementModal(false)} variant="secondary" className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
