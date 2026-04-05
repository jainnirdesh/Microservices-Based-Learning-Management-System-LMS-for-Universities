import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { AdminHome } from './AdminHome';
import { AdminUsers } from '../pages/AdminUsersPage';
import { AdminSections } from '../pages/AdminSectionsPage';
import { AdminDepartments } from '../pages/AdminDepartmentsPage';
import { AdminPrograms } from '../pages/AdminProgramsPage';
import { AdminSubjects } from '../pages/AdminSubjectsPage';
import { AdminTeachingAssignments } from '../pages/AdminTeachingAssignmentsPage';
import { AdminAssessments } from '../pages/AdminAssessmentsPage';
import { AdminAnalytics } from '../pages/AdminAnalyticsPage';
import { AdminSettings } from '../pages/AdminSettingsPage';

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: 'Activity' },
  { label: 'Users', path: '/admin/users', icon: 'Users' },
  { label: 'Subjects', path: '/admin/courses', icon: 'BookOpen' },
  { label: 'Sections', path: '/admin/sections', icon: 'Layers' },
  { label: 'Departments', path: '/admin/departments', icon: 'Grid' },
  { label: 'Programs', path: '/admin/programs', icon: 'BookMarked' },
  { label: 'Teaching Assignments', path: '/admin/teaching', icon: 'Users' },
  { label: 'Assessments', path: '/admin/assessments', icon: 'ClipboardList' },
  { label: 'Analytics', path: '/admin/analytics', icon: 'BarChart2' },
  { label: 'Settings', path: '/admin/settings', icon: 'Settings' },
];

export default function AdminDashboard() {
  return (
    <DashboardLayout navItems={navItems} role="Admin" userName="Admin User">
      <Routes>
        <Route index element={<AdminHome />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="courses" element={<AdminSubjects />} />
        <Route path="sections" element={<AdminSections />} />
        <Route path="departments" element={<AdminDepartments />} />
        <Route path="programs" element={<AdminPrograms />} />
        <Route path="subjects" element={<Navigate to="/admin/courses" replace />} />
        <Route path="teaching" element={<AdminTeachingAssignments />} />
        <Route path="assessments" element={<AdminAssessments />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </DashboardLayout>
  );
}
