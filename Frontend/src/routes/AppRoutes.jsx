import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import DashboardLayout from '../layouts/DashboardLayout.jsx';

// Public Auth Pages
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import Unauthorized from '../pages/Unauthorized.jsx';
import NotFound from '../pages/NotFound.jsx';

// Role Dashboards
import StudentDashboard from '../pages/StudentDashboard.jsx';
import CompanyDashboard from '../pages/CompanyDashboard.jsx';
import AdminDashboard from '../pages/AdminDashboard.jsx';

// Core Application Features
import Profile from '../pages/Profile.jsx';
import PlacementOpportunities from '../pages/PlacementOpportunities.jsx';
import Interviews from '../pages/Interviews.jsx';
import Applications from '../pages/Applications.jsx';
import AttendanceTracker from '../pages/AttendanceTracker.jsx';
import Notifications from '../pages/Notifications.jsx';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Student Protected Portal */}
      <Route 
        path="/student" 
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="eligible-jobs" element={<PlacementOpportunities />} />
        <Route path="jobs" element={<PlacementOpportunities />} />
        <Route path="applications" element={<StudentDashboard />} />
        <Route path="interviews" element={<Interviews />} />
        <Route path="profile" element={<Profile />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>

      {/* Company Recruiter Protected Portal */}
      <Route 
        path="/company" 
        element={
          <ProtectedRoute allowedRoles={['company']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<CompanyDashboard />} />
        <Route path="jobs" element={<CompanyDashboard />} />
        <Route path="applications" element={<Applications />} />
        <Route path="interviews" element={<Interviews />} />
        <Route path="profile" element={<Profile />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>

      {/* Coordinator Protected Portal */}
      <Route 
        path="/coordinator" 
        element={
          <ProtectedRoute allowedRoles={['coordinator']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="students" element={<AdminDashboard />} />
        <Route path="companies" element={<AdminDashboard />} />
        <Route path="jobs" element={<CompanyDashboard />} />
        <Route path="attendance" element={<AttendanceTracker />} />
        <Route path="profile" element={<Profile />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>

      {/* Admin Protected Portal */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="pending-approvals" element={<AdminDashboard />} />
        <Route path="students" element={<AdminDashboard />} />
        <Route path="companies" element={<AdminDashboard />} />
        <Route path="attendance" element={<AttendanceTracker />} />
        <Route path="profile" element={<Profile />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>

      {/* 404 Fallback page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
