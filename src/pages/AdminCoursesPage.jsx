import React, { useState } from 'react';
import { Icon } from '../components/Icon';
import { Modal } from '../components/Modal';
import { adminCourses } from '../data/mockData';

export function AdminCourses() {
  const [courses, setCourses] = useState(adminCourses);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = courses.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleCreate = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newCourse = {
      id: `CS${Math.floor(Math.random() * 900) + 100}`,
      title: formData.get('title'),
      semester: formData.get('semester'),
      students: 0,
      avgScore: 0,
      status: 'Active',
    };
    setCourses([...courses, newCourse]);
    setShowNewModal(false);
    e.target.reset();
  };

  const handleOpenEdit = (course) => {
    setSelectedCourse(course);
    setShowEditModal(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!selectedCourse) return;

    const formData = new FormData(e.target);
    const updatedCourse = {
      ...selectedCourse,
      title: String(formData.get('title') || '').trim(),
      semester: String(formData.get('semester') || '').trim(),
      status: String(formData.get('status') || 'Active'),
    };

    setCourses((prev) => prev.map((c) => (c.id === selectedCourse.id ? updatedCourse : c)));
    setShowEditModal(false);
    setSelectedCourse(null);
  };

  const handleDeleteCourse = (courseId) => {
    setCourses((prev) => prev.filter((c) => c.id !== courseId));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Course Registry</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage all courses in the system</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="btn-primary text-sm px-4 py-2 flex items-center gap-2"
        >
          <Icon name="PlusCircle" size={16} />
          Create Course
        </button>
      </div>

      <input
        type="text"
        placeholder="Search courses..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      />

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">ID</th>
              <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">Course</th>
              <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">Semester</th>
              <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">Students</th>
              <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">Avg Score</th>
              <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">Status</th>
              <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((course) => (
              <tr key={course.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                <td className="px-4 py-3 text-xs font-mono text-gray-600">{course.id}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{course.title}</td>
                <td className="px-4 py-3 text-sm text-gray-500">Semester {course.semester}</td>
                <td className="px-4 py-3 text-sm text-gray-900 font-semibold">{course.students}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{course.avgScore || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded font-semibold ${
                    course.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'
                  }`}>
                    {course.status}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-1">
                  <button
                    onClick={() => handleOpenEdit(course)}
                    className="btn-secondary text-xs px-2 py-1"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course.id)}
                    className="btn-ghost text-xs px-2 py-1"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showNewModal} title="Create New Course" onClose={() => setShowNewModal(false)}>
        <form onSubmit={handleCreate} className="space-y-4">
          <input type="text" name="title" placeholder="Course title" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          <select name="semester" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
          </select>
          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn-primary flex-1">Create</button>
            <button type="button" onClick={() => setShowNewModal(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showEditModal} title="Edit Course" onClose={() => setShowEditModal(false)}>
        {selectedCourse ? (
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <input
              type="text"
              name="title"
              defaultValue={selectedCourse.title}
              placeholder="Course title"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <select
              name="semester"
              defaultValue={String(selectedCourse.semester)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
            </select>
            <select
              name="status"
              defaultValue={selectedCourse.status}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="Active">Active</option>
              <option value="Closed">Closed</option>
            </select>
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
