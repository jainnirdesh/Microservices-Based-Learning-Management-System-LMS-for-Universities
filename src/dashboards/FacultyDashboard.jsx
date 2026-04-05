import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { FacultyHome } from './FacultyHome';
import { FacultyCourses } from '../pages/FacultyCoursesPage';
import { FacultyAssignments } from '../pages/FacultyAssignmentsPage';
import { FacultyStudents } from '../pages/FacultyStudentsPage';
import { FacultyAnalytics } from '../pages/FacultyAnalyticsPage';
import { FacultyCalendar } from '../pages/FacultyCalendar';
import { FacultySchedule } from '../pages/FacultySchedule';
import { FacultyClassPerformance } from '../pages/FacultyClassPerformance';
import { FacultyTeachingMaterials } from '../pages/FacultyTeachingMaterials';
import { FacultyForumsModeration } from '../pages/FacultyForumsModeration';
import { FacultyStudyGroupMonitoring } from '../pages/FacultyStudyGroupMonitoring';
import { FacultyStudentAchievements } from '../pages/FacultyStudentAchievements';

const navItems = [
  { label: 'Dashboard', path: '/faculty', icon: 'Activity' },
  { label: 'My Courses', path: '/faculty/courses', icon: 'BookOpen' },
  { label: 'Assignments', path: '/faculty/assignments', icon: 'ClipboardList' },
  { label: 'Students', path: '/faculty/students', icon: 'Users' },
  { label: 'Calendar', path: '/faculty/calendar', icon: 'Calendar' },
  { label: 'Schedule', path: '/faculty/schedule', icon: 'Clock' },
  { label: 'Class Performance', path: '/faculty/performance', icon: 'TrendingUp' },
  { label: 'Teaching Materials', path: '/faculty/materials', icon: 'BookMarked' },
  { label: 'Forums', path: '/faculty/forums', icon: 'MessageCircle' },
  { label: 'Study Groups', path: '/faculty/groups', icon: 'Users' },
  { label: 'Student Achievements', path: '/faculty/achievements', icon: 'Trophy' },
  { label: 'Analytics', path: '/faculty/analytics', icon: 'BarChart2' },
];

export default function FacultyDashboard() {
  return (
    <DashboardLayout navItems={navItems} role="Faculty" userName="Dr. Vikram Singh">
      <Routes>
        <Route index element={<FacultyHome />} />
        <Route path="courses" element={<FacultyCourses />} />
        <Route path="assignments" element={<FacultyAssignments />} />
        <Route path="students" element={<FacultyStudents />} />
        <Route path="calendar" element={<FacultyCalendar />} />
        <Route path="schedule" element={<FacultySchedule />} />
        <Route path="performance" element={<FacultyClassPerformance />} />
        <Route path="materials" element={<FacultyTeachingMaterials />} />
        <Route path="forums" element={<FacultyForumsModeration />} />
        <Route path="groups" element={<FacultyStudyGroupMonitoring />} />
        <Route path="achievements" element={<FacultyStudentAchievements />} />
        <Route path="analytics" element={<FacultyAnalytics />} />
        <Route path="*" element={<Navigate to="/faculty" replace />} />
      </Routes>
    </DashboardLayout>
  );
}
