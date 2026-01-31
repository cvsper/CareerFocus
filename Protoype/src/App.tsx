import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './services/AuthContext';
import { ToastProvider } from './components/ui/Toast';
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
import { AdminApprovalsPage } from './pages/AdminApprovalsPage';

// Loading spinner component
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500">Loading...</p>
      </div>
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({
  children,
  allowedRole,
}: {
  children: React.ReactNode;
  allowedRole: 'student' | 'admin';
}) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (user?.role !== allowedRole) {
    // Redirect to appropriate dashboard based on role
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return <>{children}</>;
}

// Main App Routes
function AppRoutes() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? (
            <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
          ) : (
            <LoginPage />
          )
        }
      />

      {/* Student Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentDashboard onLogout={logout} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/documents"
        element={
          <ProtectedRoute allowedRole="student">
            <OnboardingPage onLogout={logout} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/timesheet"
        element={
          <ProtectedRoute allowedRole="student">
            <TimesheetPage onLogout={logout} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRole="student">
            <ProfilePage onLogout={logout} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/programs"
        element={
          <ProtectedRoute allowedRole="student">
            <ProgramsPage onLogout={logout} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/job-opportunities"
        element={
          <ProtectedRoute allowedRole="student">
            <JobOpportunitiesPage onLogout={logout} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/learning-hub"
        element={
          <ProtectedRoute allowedRole="student">
            <LearningHubPage onLogout={logout} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/confirmation"
        element={
          <ProtectedRoute allowedRole="student">
            <ConfirmationPage />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard onLogout={logout} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/students"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminStudentList onLogout={logout} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/approvals"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminApprovalsPage onLogout={logout} />
          </ProtectedRoute>
        }
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
