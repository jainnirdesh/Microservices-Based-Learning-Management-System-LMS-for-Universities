import React, { useState } from 'react';
import { weeklySchedule } from '../data/mockData';
import { Modal, Button } from '../components/Modal';

export function StudentSchedule() {
  const [selectedClass, setSelectedClass] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const timeSlots = ['9:00', '10:00', '11:00', '12:00', '1:00', '2:00', '3:00', '4:00'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const getClassAtSlot = (day, time) => {
    const dayData = weeklySchedule.find(d => d.day === day);
    if (!dayData) return null;
    return dayData.classes.find(c => c.time.startsWith(time));
  };

  const handleClassClick = (classInfo, day) => {
    setSelectedClass({ ...classInfo, day });
    setShowModal(true);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Class Schedule</h2>

      {/* Timetable Grid */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="bg-gray-100 border border-gray-300 p-3 text-left font-semibold text-gray-700 w-20">Time</th>
              {days.map(day => (
                <th key={day} className="bg-blue-50 border border-gray-300 p-3 text-center font-semibold text-gray-700 w-40">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map(time => (
              <tr key={time}>
                <td className="bg-gray-50 border border-gray-300 p-3 font-semibold text-gray-600">{time}</td>
                {days.map(day => {
                  const classData = getClassAtSlot(day, time);
                  return (
                    <td
                      key={`${day}-${time}`}
                      className="border border-gray-300 p-3"
                    >
                      {classData && (
                        <div
                          onClick={() => handleClassClick(classData, day)}
                          className="bg-blue-500 text-white p-3 rounded-lg cursor-pointer hover:bg-blue-600 transition-colors"
                        >
                          <p className="font-semibold text-sm">{classData.course}</p>
                          <p className="text-xs mt-1">{classData.time}</p>
                          <p className="text-xs mt-1">Room {classData.room}</p>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600 font-semibold mb-2">Legend:</p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-700">Active Class</span>
          </div>
        </div>
      </div>

      {/* Upcoming Classes Summary */}
      <div className="mt-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Today's Classes</h3>
        <div className="space-y-3">
          {weeklySchedule[0].classes && weeklySchedule[0].classes.length > 0 ? (
            weeklySchedule[0].classes.map((classInfo, idx) => (
              <div
                key={idx}
                className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900">{classInfo.course}</p>
                    <p className="text-sm text-gray-600 mt-1">Time: {classInfo.time}</p>
                    <p className="text-sm text-gray-600">Faculty: {classInfo.faculty}</p>
                    <p className="text-sm text-gray-600">Room: {classInfo.room}</p>
                  </div>
                  <button className="px-3 py-2 bg-blue-500 text-white rounded text-sm font-medium hover:bg-blue-600 transition-colors">
                    Join
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No classes today</p>
          )}
        </div>
      </div>

      {/* Class Detail Modal */}
      <Modal
        isOpen={showModal}
        title={selectedClass?.course || ''}
        onClose={() => {
          setShowModal(false);
          setSelectedClass(null);
        }}
      >
        {selectedClass && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Day</p>
              <p className="font-semibold">{selectedClass.day}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Time</p>
              <p className="font-semibold">{selectedClass.time}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Faculty</p>
              <p className="font-semibold">{selectedClass.faculty}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Room</p>
              <p className="font-semibold">{selectedClass.room}</p>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="primary" className="flex-1">
                Add to Calendar
              </Button>
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
