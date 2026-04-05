import React, { useState } from 'react';
import { Icon } from '../components/Icon';
import { studentGrades } from '../data/mockData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const gradeChartData = [
  { assessment: 'Midterm Exam', score: 82 },
  { assessment: 'Quiz 1', score: 88 },
  { assessment: 'Quiz 2', score: 85 },
  { assessment: 'Project 1', score: 90 },
  { assessment: 'Assignments', score: 88 },
  { assessment: 'Final Exam', score: 92 },
];

export function StudentGrades() {
  const [expandedCourse, setExpandedCourse] = useState(null);

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return 'text-green-700 bg-green-50';
    if (percentage >= 80) return 'text-blue-700 bg-blue-50';
    if (percentage >= 70) return 'text-amber-700 bg-amber-50';
    return 'text-red-700 bg-red-50';
  };

  const calculateCGPA = () => {
    const avgScore = (studentGrades.reduce((sum, g) => sum + g.percentage, 0) / studentGrades.length).toFixed(2);
    return avgScore;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Grades</h1>
        <p className="text-sm text-gray-500 mt-1">Academic performance and transcript</p>
      </div>

      {/* GPA Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-xs text-gray-500 mb-1">Current CGPA</p>
          <p className="text-2xl font-bold text-primary-600">{calculateCGPA()}</p>
          <p className="text-xs text-gray-400 mt-1">Out of 4.0</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500 mb-1">Courses</p>
          <p className="text-2xl font-bold text-gray-900">{studentGrades.length}</p>
          <p className="text-xs text-gray-400 mt-1">Completed</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500 mb-1">Grade A Count</p>
          <p className="text-2xl font-bold text-green-600">{studentGrades.filter(g => g.grade.includes('A')).length}</p>
          <p className="text-xs text-gray-400 mt-1">Excellence</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500 mb-1">Average Score</p>
          <p className="text-2xl font-bold text-blue-600">{(studentGrades.reduce((s, g) => s + g.percentage, 0) / studentGrades.length).toFixed(1)}%</p>
          <p className="text-xs text-gray-400 mt-1">Across courses</p>
        </div>
      </div>

      {/* Performance Trend */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Performance Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={gradeChartData} margin={{ top: 10, right: 20, left: -20, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="assessment" tick={{ fontSize: 11, fill: '#94A3B8' }} angle={-45} textAnchor="end" height={80} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94A3B8' }} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload?.length) {
                  return (
                    <div className="bg-white border border-gray-200 rounded-lg shadow-card px-3 py-2 text-xs">
                      <p className="text-gray-500 mb-0.5">{payload[0].payload.assessment}</p>
                      <p className="font-semibold text-gray-900">{payload[0].value}%</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line type="monotone" dataKey="score" stroke="#2563EB" strokeWidth={2} dot={{ fill: '#2563EB', r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Grades */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">Course Grades</h3>
        {studentGrades.map((grade, idx) => (
          <div key={idx} className="card p-4">
            <button
              onClick={() => setExpandedCourse(expandedCourse === idx ? null : idx)}
              className="w-full text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-mono text-gray-400">{grade.course}</span>
                    <span className={`text-xs px-2 py-1 rounded font-semibold ${getGradeColor(grade.percentage)}`}>
                      {grade.grade}
                    </span>
                    <span className="text-xs text-gray-500">{grade.status}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900">{grade.title}</h4>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{grade.percentage.toFixed(1)}%</div>
                  <p className="text-xs text-gray-500 mt-1">{grade.scored}/{grade.total}</p>
                </div>
                <Icon name={expandedCourse === idx ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-gray-400 ml-3" />
              </div>
            </button>

            {expandedCourse === idx && (
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2 text-xs">
                    <span className="text-gray-600">Score Breakdown</span>
                    <span className="font-semibold text-gray-900">{grade.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        grade.percentage >= 80 ? 'bg-green-500' : grade.percentage >= 70 ? 'bg-blue-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${grade.percentage}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-500">Attendance</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">95%</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-500">Assignments</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">92%</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-500">Exams</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">88%</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
