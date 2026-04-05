import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { StudentHome } from './StudentHome';
import { StudentCourses } from '../pages/StudentCoursesPage';
import { StudentAssignments } from '../pages/StudentAssignmentsPage';
import { StudentGrades } from '../pages/StudentGradesPage';
import { StudentNotifications } from '../pages/StudentNotificationsPage';
import { StudentCalendar } from '../pages/StudentCalendar';
import { StudentSchedule } from '../pages/StudentSchedule';
import { StudentPerformanceInsights } from '../pages/StudentPerformanceInsights';
import { StudentMaterials } from '../pages/StudentMaterials';
import { StudentForums } from '../pages/StudentForums';
import { StudentGroups } from '../pages/StudentGroups';
import { StudentAchievements } from '../pages/StudentAchievements';

const navItems = [
  { label: 'Dashboard', path: '/student', icon: 'Activity' },
  { label: 'My Courses', path: '/student/courses', icon: 'BookOpen' },
  { label: 'Assignments', path: '/student/assignments', icon: 'ClipboardList' },
  { label: 'Grades', path: '/student/grades', icon: 'Award' },
  { label: 'Calendar', path: '/student/calendar', icon: 'Calendar' },
  { label: 'Schedule', path: '/student/schedule', icon: 'Clock' },
  { label: 'Performance', path: '/student/performance', icon: 'TrendingUp' },
  { label: 'Materials', path: '/student/materials', icon: 'BookMarked' },
  { label: 'Forums', path: '/student/forums', icon: 'MessageCircle' },
  { label: 'Study Groups', path: '/student/groups', icon: 'Users' },
  { label: 'Achievements', path: '/student/achievements', icon: 'Trophy' },
  { label: 'Notifications', path: '/student/notifications', icon: 'Bell' },
];

export default function StudentDashboard() {
  return (
    <DashboardLayout navItems={navItems} role="Student" userName="Student">
      <Routes>
        <Route index element={<StudentHome />} />
        <Route path="courses" element={<StudentCourses />} />
        <Route path="assignments" element={<StudentAssignments />} />
        <Route path="grades" element={<StudentGrades />} />
        <Route path="calendar" element={<StudentCalendar />} />
        <Route path="schedule" element={<StudentSchedule />} />
        <Route path="performance" element={<StudentPerformanceInsights />} />
        <Route path="materials" element={<StudentMaterials />} />
        <Route path="forums" element={<StudentForums />} />
        <Route path="groups" element={<StudentGroups />} />
        <Route path="achievements" element={<StudentAchievements />} />
        <Route path="notifications" element={<StudentNotifications />} />
        <Route path="*" element={<Navigate to="/student" replace />} />
      </Routes>
    </DashboardLayout>
  );
}
