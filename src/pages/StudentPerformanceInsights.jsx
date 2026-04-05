import React from 'react';
import { BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarAngleAxis, PolarGridAxis, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { performanceInsights, recommendations, studyProgress } from '../data/mockData';

export function StudentPerformanceInsights() {
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const subjectComparison = performanceInsights.map(item => ({
    subject: item.subject,
    'Your Score': item.score,
    'Class Average': item.classAvg,
  }));

  const scoreData = performanceInsights.map(item => ({
    name: item.subject,
    value: item.score,
    fill: item.strength ? '#10B981' : '#F59E0B',
  }));

  const strengths = performanceInsights.filter(i => i.strength);
  const weaknesses = performanceInsights.filter(i => !i.strength);

  return (
    <div className="space-y-6">
      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <p className="text-sm text-gray-600">Overall Average</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {(performanceInsights.reduce((sum, i) => sum + i.score, 0) / performanceInsights.length).toFixed(1)}%
          </p>
          <p className="text-xs text-green-600 mt-2">↑ 5% from last semester</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <p className="text-sm text-gray-600">Strengths</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{strengths.length}</p>
          <p className="text-xs text-blue-600 mt-2">Strong areas identified</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-600">Areas to Improve</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{weaknesses.length}</p>
          <p className="text-xs text-yellow-600 mt-2">Focus recommended</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
          <p className="text-sm text-gray-600">Study Time</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {studyProgress.reduce((sum, p) => sum + p.timeSpent, 0)}h
          </p>
          <p className="text-xs text-purple-600 mt-2">This month</p>
        </div>
      </div>

      {/* Subject Comparison Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Subject Performance Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={subjectComparison}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="subject" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Your Score" fill="#3B82F6" />
            <Bar dataKey="Class Average" fill="#D1D5DB" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Score Distribution Pie Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Score Distribution by Subject</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={scoreData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {scoreData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Strengths and Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-green-50 rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <h3 className="text-xl font-bold text-gray-900 mb-4">📈 Your Strengths</h3>
          <div className="space-y-3">
            {strengths.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  ✓
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{item.subject}</p>
                  <p className="text-sm text-gray-600">Score: {item.score}% (Class avg: {item.classAvg}%)</p>
                  <p className="text-xs text-green-700 mt-1">
                    {item.score - item.classAvg > 0 ? `+${item.score - item.classAvg}%` : `${item.score - item.classAvg}%`} above class average
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weaknesses */}
        <div className="bg-yellow-50 rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
          <h3 className="text-xl font-bold text-gray-900 mb-4">🎯 Areas to Improve</h3>
          <div className="space-y-3">
            {weaknesses.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  !
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{item.subject}</p>
                  <p className="text-sm text-gray-600">Score: {item.score}% (Class avg: {item.classAvg}%)</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    {Math.abs(item.score - item.classAvg)}% below class average - Focus here
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Study Progress */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Study Progress Summary</h3>
        <div className="space-y-4">
          {studyProgress.map((course, idx) => (
            <div key={idx}>
              <div className="flex justify-between mb-2">
                <span className="font-semibold text-gray-900">{course.course}</span>
                <span className="text-sm text-gray-600">{course.completed}% complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${course.completed}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>Time spent: {course.timeSpent}h</span>
                <span>Recommended: {course.recommendedHours}h</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">💡 Personalized Recommendations</h3>
        <div className="space-y-3">
          {recommendations.map((rec, idx) => (
            <div key={idx} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-900">{rec.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{rec.reason}</p>
                  <p className="text-xs text-gray-500 mt-2">Difficulty: {rec.difficulty}</p>
                </div>
                <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm font-medium hover:bg-blue-600 transition-colors">
                  Explore
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
