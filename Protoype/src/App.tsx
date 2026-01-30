import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { OnboardingPage } from './pages/OnboardingPage';
import { TimesheetPage } from './pages/TimesheetPage';
import { ProfilePage } from './pages/ProfilePage';
import { ConfirmationPage } from './pages/ConfirmationPage';
import { ProgramsPage } from './pages/ProgramsPage';
import { JobOpportunitiesPage } from './pages/JobOpportunitiesPage';
import { LearningHubPage } from './pages/LearningHubPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminStudentList } from './pages/AdminStudentList';
export function App() {
  // Simple state to track user type for the prototype
  // In a real app, this would be handled by an auth provider
  const [userType, setUserType] = useState<'student' | 'admin' | null>(null);
  const handleLogin = (type: 'student' | 'admin') => {
    setUserType(type);
  };
  const handleLogout = () => {
    setUserType(null);
  };
  // Protected Route Wrapper
  const ProtectedRoute = ({
    children,
    allowedType



  }: {children: React.ReactNode;allowedType: 'student' | 'admin';}) => {
    if (!userType) return <Navigate to="/" replace />;
    if (userType !== allowedType) return <Navigate to="/" replace />;
    return <>{children}</>;
  };
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage onLogin={handleLogin} />} />

        {/* Student Routes */}
        <Route
          path="/dashboard"
          element={
          <ProtectedRoute allowedType="student">
              <StudentDashboard onLogout={handleLogout} />
            </ProtectedRoute>
          } />

        <Route
          path="/documents"
          element={
          <ProtectedRoute allowedType="student">
              <OnboardingPage onLogout={handleLogout} />
            </ProtectedRoute>
          } />

        <Route
          path="/timesheet"
          element={
          <ProtectedRoute allowedType="student">
              <TimesheetPage onLogout={handleLogout} />
            </ProtectedRoute>
          } />

        <Route
          path="/profile"
          element={
          <ProtectedRoute allowedType="student">
              <ProfilePage onLogout={handleLogout} />
            </ProtectedRoute>
          } />

        <Route
          path="/programs"
          element={
          <ProtectedRoute allowedType="student">
              <ProgramsPage onLogout={handleLogout} />
            </ProtectedRoute>
          } />

        <Route
          path="/job-opportunities"
          element={
          <ProtectedRoute allowedType="student">
              <JobOpportunitiesPage onLogout={handleLogout} />
            </ProtectedRoute>
          } />

        <Route
          path="/learning-hub"
          element={
          <ProtectedRoute allowedType="student">
              <LearningHubPage onLogout={handleLogout} />
            </ProtectedRoute>
          } />

        <Route
          path="/confirmation"
          element={
          <ProtectedRoute allowedType="student">
              <ConfirmationPage />
            </ProtectedRoute>
          } />


        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
          <ProtectedRoute allowedType="admin">
              <AdminDashboard onLogout={handleLogout} />
            </ProtectedRoute>
          } />

        <Route
          path="/admin/students"
          element={
          <ProtectedRoute allowedType="admin">
              <AdminStudentList onLogout={handleLogout} />
            </ProtectedRoute>
          } />


        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>);

}