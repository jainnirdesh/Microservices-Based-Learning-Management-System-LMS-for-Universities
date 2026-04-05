import React, { useState, useEffect } from 'react';
import { achievements } from '../data/mockData';
import { Modal, Button } from '../components/Modal';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export function FacultyStudentAchievements() {
  const { profile } = useAuth();
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [filterCourse, setFilterCourse] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [studentAchievementData, setStudentAchievementData] = useState([]);

  const courses = Array.from(new Set(studentAchievementData.map((s) => s.course).filter(Boolean)));
  const coursesList = ['all', ...courses.sort()];

  const filteredStudents = filterCourse === 'all' 
    ? studentAchievementData 
    : studentAchievementData.filter(s => s.course === filterCourse);

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (sortBy === 'recent') return new Date(b.lastAchieved) - new Date(a.lastAchieved);
    if (sortBy === 'most') return b.achievements - a.achievements;
    return a.name.localeCompare(b.name);
  });

  const allAchievements = achievements;

  const fetchStudentBadges = async () => {
    if (!profile?.id || !profile?.school_id) return;

    setLoading(true);
    setErrorMessage('');

    try {
      // Fetch students enrolled in school with their badges
      const { data: badgesData, error: badgesError } = await supabase
        .from('student_badges')
        .select('student_id, badge_title, awarded_at')
        .eq('school_id', profile.school_id);

      if (badgesError) throw badgesError;

      // Fetch all students in school via their enrollments
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('student_enrollments')
        .select('student_id, subject_offering_id')
        .eq('school_id', profile.school_id);

      if (enrollmentsError) throw enrollmentsError;

      // Get unique student IDs and fetch their profiles
      const studentIds = Array.from(new Set((enrollmentsData || []).map((e) => e.student_id).filter(Boolean)));

      if (studentIds.length === 0) {
        setStudentAchievementData([]);
        setLoading(false);
        return;
      }

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', studentIds);

      if (profilesError) throw profilesError;

      // Fetch offering information for course codes
      const offeringIds = Array.from(new Set((enrollmentsData || []).map((e) => e.subject_offering_id).filter(Boolean)));
      const { data: offeringsData, error: offeringsError } = await supabase
        .from('subject_offerings')
        .select('id, subject_id')
        .in('id', offeringIds);

      if (offeringsError) throw offeringsError;

      // Fetch subjects for course names
      const subjectIds = Array.from(new Set((offeringsData || []).map((o) => o.subject_id).filter(Boolean)));
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('id, code')
        .in('id', subjectIds);

      if (subjectsError) throw subjectsError;

      // Build maps for quick lookups
      const subjectMap = (subjectsData || []).reduce((acc, s) => {
        acc[s.id] = s.code;
        return acc;
      }, {});

      const offeringMap = (offeringsData || []).reduce((acc, o) => {
        acc[o.id] = subjectMap[o.subject_id] || 'Unknown';
        return acc;
      }, {});

      // Group badges by student
      const badgesByStudent = (badgesData || []).reduce((acc, badge) => {
        if (!acc[badge.student_id]) {
          acc[badge.student_id] = [];
        }
        acc[badge.student_id].push(badge);
        return acc;
      }, {});

      // Get latest award date per student
      const latestBadgeByStudent = {};
      Object.keys(badgesByStudent).forEach((studentId) => {
        const bestBadge = badgesByStudent[studentId].reduce((latest, current) => {
          return new Date(current.awarded_at) > new Date(latest.awarded_at) ? current : latest;
        });
        latestBadgeByStudent[studentId] = new Date(bestBadge.awarded_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      });

      // Get courses per student
      const enrollmentsByStudent = (enrollmentsData || []).reduce((acc, e) => {
        if (!acc[e.student_id]) {
          acc[e.student_id] = new Set();
        }
        acc[e.student_id].add(offeringMap[e.subject_offering_id]);
        return acc;
      }, {});

      // Build final student data
      const mappedStudents = (profilesData || []).map((profile) => {
        const badges = badgesByStudent[profile.id] || [];
        const courses = Array.from(enrollmentsByStudent[profile.id] || []);
        const primaryCourse = courses[0] || 'General';
        const lastAchieved = latestBadgeByStudent[profile.id] || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short' });

        return {
          id: profile.id,
          name: profile.full_name,
          course: primaryCourse,
          courses: courses,
          achievements: badges.length,
          badges: badges.map((b) => b.badge_title),
          lastAchieved: lastAchieved,
        };
      });

      setStudentAchievementData(mappedStudents);
    } catch (error) {
      setErrorMessage(error.message || 'Failed to load student badges.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentBadges();
    // eslint-disable-next-line
  }, [profile?.id, profile?.school_id]);

  const handleAwardBadge = async () => {
    if (selectedStudents.length === 0 || !selectedAchievement || !profile?.id || !profile?.school_id) return;

    try {
      // Award badge to each selected student
      const badgesToInsert = selectedStudents.map((studentId) => ({
        school_id: profile.school_id,
        student_id: studentId,
        teacher_id: profile.id,
        badge_title: selectedAchievement.title,
        badge_icon: selectedAchievement.icon,
        awarded_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('student_badges')
        .insert(badgesToInsert)
        .onConflict('school_id,student_id,badge_title')
        .eq.update({
          teacher_id: profile.id,
          awarded_at: new Date().toISOString(),
        });

      if (error && error.code !== '23505') throw error; // Ignore unique constraint errors

      setSelectedStudents([]);
      setShowAwardModal(false);
      setShowModal(false);
      setSelectedAchievement(null);
      await fetchStudentBadges();
    } catch (error) {
      setErrorMessage(error.message || 'Failed to award badge.');
    }
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Student Achievements Tracking</h2>
        <p className="text-gray-600 mt-1">Monitor and reward student accomplishments and badges</p>
      </div>

      {/* Awards Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-gold-500">
          <p className="text-sm text-gray-600">Total Badges Earned</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {studentAchievementData.reduce((sum, s) => sum + (s.achievements || 0), 0)}
          </p>
          <p className="text-xs text-gray-600 mt-2">Across all students</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <p className="text-sm text-gray-600">Top Performer</p>
          <p className="text-lg font-bold text-gray-900 mt-2">
            {studentAchievementData.length > 0 
              ? studentAchievementData.reduce((max, s) => (s.achievements || 0) > (max.achievements || 0) ? s : max, studentAchievementData[0]).name
              : 'N/A'}
          </p>
          <p className="text-xs text-gray-600 mt-2">
            {studentAchievementData.length > 0 
              ? studentAchievementData.reduce((max, s) => (s.achievements || 0) > (max.achievements || 0) ? s : max, studentAchievementData[0]).achievements
              : 0} badges
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <p className="text-sm text-gray-600">Most Common Badge</p>
          <p className="text-lg font-bold text-gray-900 mt-2">Top Scorer</p>
          <p className="text-xs text-gray-600 mt-2">Earned by {studentAchievementData.filter(s => s.badges.includes('Top Scorer')).length} students</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
          <p className="text-sm text-gray-600">Students with Badges</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{studentAchievementData.length}</p>
          <p className="text-xs text-gray-600 mt-2">100% of class</p>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Course</label>
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            >
              {coursesList.map(course => (
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            >
              <option value="recent">Most Recent</option>
              <option value="most">Most Badges</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Student Achievement Cards */}
      <div className="space-y-4">
        {sortedStudents.map((student, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border-l-4 border-purple-500">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{student.name}</h3>
                <p className="text-sm text-gray-600">{student.course}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-purple-600">{student.achievements}</p>
                <p className="text-xs text-gray-600">Badge(s)</p>
              </div>
            </div>

            {/* Badges Display */}
            <div className="flex flex-wrap gap-2 mb-4">
              {student.badges.map((badge, bidx) => (
                <button
                  key={bidx}
                  onClick={() => {
                    setSelectedAchievement(allAchievements.find(a => a.title === badge));
                    setShowModal(true);
                  }}
                  className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold hover:bg-yellow-200 transition-colors cursor-pointer"
                >
                  🏆 {badge}
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Last Achieved: {student.lastAchieved}</span>
              <button 
                onClick={() => {
                  setSelectedAchievement(null);
                  setSelectedStudents([student.id]);
                  setShowAwardModal(true);
                }}
                className="px-4 py-2 bg-purple-500 text-white rounded font-medium text-sm hover:bg-purple-600 transition-colors">
                Award Badge
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Available Achievement Types */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">🎖️ Available Achievements</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {allAchievements.map((achievement, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedAchievement(achievement);
                setShowModal(true);
              }}
              className="p-4 text-center bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer"
            >
              <div className="text-4xl mb-2">{achievement.icon}</div>
              <p className="font-semibold text-gray-900 text-sm">{achievement.title}</p>
              <p className="text-xs text-gray-600 mt-2">{achievement.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">💡 Recommendations</h3>
        <div className="space-y-3">
          <div className="p-3 bg-white border-l-4 border-green-500 rounded">
            <p className="font-semibold text-gray-900">Incentivize Participation</p>
            <p className="text-sm text-gray-600 mt-1">Award badges to students with high forum engagement and discussion participation</p>
          </div>
          <div className="p-3 bg-white border-l-4 border-blue-500 rounded">
            <p className="font-semibold text-gray-900">Recognize Excellence</p>
            <p className="text-sm text-gray-600 mt-1">Celebrate students who earn multiple badges and maintain consistent performance</p>
          </div>
          <div className="p-3 bg-white border-l-4 border-purple-500 rounded">
            <p className="font-semibold text-gray-900">Peer Learning</p>
            <p className="text-sm text-gray-600 mt-1">Encourage high-achieving students to mentor peers and earn "Discussion Champion" badges</p>
          </div>
        </div>
      </div>

      {/* Achievement Detail Modal */}
      <Modal
        isOpen={showModal}
        title={selectedAchievement?.title || ''}
        onClose={() => {
          setShowModal(false);
          setSelectedAchievement(null);
        }}
      >
        {selectedAchievement && (
          <div className="text-center space-y-4">
            <div className="text-6xl">{selectedAchievement.icon}</div>
            <p className="text-gray-600">{selectedAchievement.description}</p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700 font-semibold">Students Who Earned This Badge:</p>
              <p className="text-lg font-bold text-blue-600 mt-2">
                {studentAchievementData.filter(s => s.badges.includes(selectedAchievement.title)).length}/
                {studentAchievementData.length}
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <Button 
                onClick={() => setShowAwardModal(true)}
                variant="primary" 
                className="flex-1">
                Award This Badge
              </Button>
              <Button onClick={() => setShowModal(false)} variant="secondary" className="flex-1">
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Award Badge to Students Modal */}
      <Modal
        isOpen={showAwardModal}
        title={selectedAchievement ? `Award "${selectedAchievement.title}" Badge` : 'Select Badge to Award'}
        onClose={() => {
          setShowAwardModal(false);
          setSelectedStudents([]);
        }}
      >
        <div className="space-y-4">
          {!selectedAchievement ? (
            <>
              <p className="text-gray-600 text-sm mb-4">Select a badge to award:</p>
              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                {allAchievements.map((achievement, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedAchievement(achievement);
                      setSelectedStudents([]);
                    }}
                    className="p-3 text-center bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                  >
                    <div className="text-3xl mb-1">{achievement.icon}</div>
                    <p className="font-semibold text-gray-900 text-xs">{achievement.title}</p>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-4 p-3 bg-purple-50 rounded-lg">
                <p className="text-2xl">{selectedAchievement.icon}</p>
                <p className="font-bold text-gray-900 mt-1">{selectedAchievement.title}</p>
              </div>
              
              <p className="text-gray-600 text-sm">Select students to award this badge to:</p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {studentAchievementData.map((student, idx) => (
                  <label key={idx} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => toggleStudentSelection(student.id)}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <div className="ml-3 flex-1">
                      <p className="font-medium text-gray-900">{student.name}</p>
                      <p className="text-xs text-gray-600">{student.course}</p>
                    </div>
                    {student.badges.includes(selectedAchievement.title) && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Already has</span>
                    )}
                  </label>
                ))}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                <p className="text-sm text-blue-700 font-semibold">
                  {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''} selected
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <Button 
                  onClick={handleAwardBadge}
                  disabled={selectedStudents.length === 0}
                  variant="primary" 
                  className="flex-1">
                  Award Badge
                </Button>
                <Button 
                  onClick={() => {
                    setShowAwardModal(false);
                    setSelectedStudents([]);
                  }} 
                  variant="secondary" 
                  className="flex-1">
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
