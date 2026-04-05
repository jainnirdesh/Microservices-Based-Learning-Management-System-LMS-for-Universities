import React, { useState } from 'react';
import { Icon } from '../components/Icon';
import { Modal, Button } from '../components/Modal';
import { courseDetails } from '../data/mockData';

export function StudentCourses() {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showMaterial, setShowMaterial] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
        <p className="text-sm text-gray-500 mt-1">Enrolled courses for Spring 2025</p>
      </div>

      <div className="grid gap-4">
        {courseDetails.map((course) => (
          <div key={course.id} className="card p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-mono bg-primary-50 text-primary-700 px-2 py-1 rounded">{course.id}</span>
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">{course.credits} Credits</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                <p className="text-sm text-gray-500 mt-1">Instructor: {course.faculty}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 mb-2">Overall Progress</p>
                <div className="text-2xl font-bold text-primary-600">68%</div>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">{course.description}</p>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary-600 rounded-full" style={{ width: '68%' }} />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedCourse(course);
                  setShowMaterial(true);
                }}
                className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"
              >
                <Icon name="Download" size={13} />
                Materials
              </button>
              <button className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
                <Icon name="MessageSquare" size={13} />
                Forum
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Material Modal */}
      <Modal isOpen={showMaterial} title={selectedCourse?.title} onClose={() => setShowMaterial(false)} size="lg">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Course Materials</h4>
            <div className="space-y-2">
              {selectedCourse?.materials.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex items-center gap-3">
                    <Icon name="FileText" size={16} className="text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{m.name}</p>
                      <p className="text-xs text-gray-400">{m.date} • {m.size}</p>
                    </div>
                  </div>
                  <button className="btn-primary text-xs px-3 py-1.5">
                    <Icon name="Download" size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Assignments</h4>
            <div className="space-y-2">
              {selectedCourse?.assignments.map((a) => (
                <div key={a.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{a.title}</p>
                    <p className="text-xs text-gray-400">Due: {a.dueDate}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${a.status === 'Pending' ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'}`}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
