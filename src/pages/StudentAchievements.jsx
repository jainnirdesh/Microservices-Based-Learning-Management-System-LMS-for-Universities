import React, { useState } from 'react';
import { achievements } from '../data/mockData';

export function StudentAchievements() {
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const earnedAchievements = achievements.filter(a => a.earned);
  const earnedCount = earnedAchievements.length;
  const totalCount = achievements.length;
  const completionPercentage = Math.round((earnedCount / totalCount) * 100);

  const filteredAchievements = filterStatus === 'earned'
    ? earnedAchievements
    : filterStatus === 'inProgress'
    ? achievements.filter(a => !a.earned && a.progress !== undefined)
    : achievements;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg shadow-sm p-8 text-white">
        <h2 className="text-3xl font-bold mb-4">Achievements & Badges</h2>
        <p className="text-purple-100 mb-6">Unlock badges and recognize your learning progress</p>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold">Overall Progress</span>
            <span className="text-2xl font-bold">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-purple-400 rounded-full h-3">
            <div
              className="bg-white h-3 rounded-full transition-all"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <p className="text-sm text-purple-100">{earnedCount} of {totalCount} achievements earned</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <p className="text-sm text-gray-600">Earned Badges</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{earnedCount}</p>
          <p className="text-xs text-green-600 mt-2">🎉 Keep it up!</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <p className="text-sm text-gray-600">In Progress</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {achievements.filter(a => !a.earned && a.progress !== undefined).length}
          </p>
          <p className="text-xs text-blue-600 mt-2">Almost there!</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
          <p className="text-sm text-gray-600">Streak</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">7⚡</p>
          <p className="text-xs text-purple-600 mt-2">Days active</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterStatus === 'all'
              ? 'bg-purple-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Badges
        </button>
        <button
          onClick={() => setFilterStatus('earned')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterStatus === 'earned'
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Earned ✓
        </button>
        <button
          onClick={() => setFilterStatus('inProgress')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterStatus === 'inProgress'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          In Progress
        </button>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredAchievements.map((achievement, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedAchievement(achievement)}
            className={`rounded-lg p-6 text-center cursor-pointer transform transition-all hover:scale-105 ${
              achievement.earned
                ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-400 shadow-md'
                : 'bg-gray-100 border-2 border-gray-300 opacity-60'
            }`}
          >
            <div className="text-4xl mb-2">{achievement.icon}</div>
            <h3 className="font-bold text-gray-900 text-sm mb-1">{achievement.title}</h3>
            <p className="text-xs text-gray-600">{achievement.description}</p>

            {achievement.earned && (
              <div className="mt-3 pt-3 border-t border-yellow-200">
                <p className="text-xs text-gray-600">Earned: {achievement.date}</p>
                <div className="flex justify-center gap-1 mt-2">
                  {[...Array(3)].map((_, i) => (
                    <span key={i} className="text-yellow-400">⭐</span>
                  ))}
                </div>
              </div>
            )}

            {!achievement.earned && achievement.progress !== undefined && (
              <div className="mt-3 pt-3 border-t border-gray-300">
                <div className="flex items-center gap-1">
                  <div className="flex-1 bg-gray-300 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${(achievement.progress / 20) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600">{achievement.progress}/20</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Achievement Detail Modal */}
      {selectedAchievement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm mx-4">
            <div className="text-center">
              <div className="text-6xl mb-4">{selectedAchievement.icon}</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedAchievement.title}</h2>
              <p className="text-gray-600 mb-4">{selectedAchievement.description}</p>

              {selectedAchievement.earned ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-green-700 font-semibold">✓ Achieved</p>
                  <p className="text-sm text-green-600 mt-1">on {selectedAchievement.date}</p>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-blue-700 font-semibold">
                    {selectedAchievement.progress !== undefined
                      ? `${selectedAchievement.progress}/20 Progress`
                      : 'Not Started'}
                  </p>
                  {selectedAchievement.progress !== undefined && (
                    <>
                      <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${(selectedAchievement.progress / 20) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-blue-600 mt-2">
                        {20 - selectedAchievement.progress} more to unlock
                      </p>
                    </>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  {selectedAchievement.earned
                    ? 'You have unlocked this achievement! Share it with your friends.'
                    : 'Complete the requirements to unlock this achievement.'}
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                {selectedAchievement.earned && (
                  <button className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors">
                    Share
                  </button>
                )}
                <button
                  onClick={() => setSelectedAchievement(null)}
                  className={`${selectedAchievement.earned ? 'flex-1' : 'w-full'} px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">🏆 Class Leaderboard</h3>
        <div className="space-y-3">
          {[
            { rank: 1, name: 'You', badges: earnedCount, points: earnedCount * 10, highlight: true },
            { rank: 2, name: 'Priya Sharma', badges: 8, points: 80, highlight: false },
            { rank: 3, name: 'Rajesh Kumar', badges: 7, points: 70, highlight: false },
            { rank: 4, name: 'Neha Gupta', badges: 6, points: 60, highlight: false },
          ].map((entry, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border-l-4 flex items-center justify-between ${
                entry.highlight
                  ? 'bg-purple-50 border-purple-500'
                  : 'bg-gray-50 border-gray-300'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                  {entry.rank}
                </div>
                <div>
                  <p className={`font-semibold ${entry.highlight ? 'text-purple-900' : 'text-gray-900'}`}>
                    {entry.name}
                  </p>
                  <p className="text-xs text-gray-600">{entry.badges} badges</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-purple-600">{entry.points} pts</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
