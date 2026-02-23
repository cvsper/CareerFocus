import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './services/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import { ThemeProvider } from './components/providers/ThemeProvider';
import { Toaster } from './components/ui/sonner';
import { TooltipProvider } from './components/ui/tooltip';
import { Skeleton } from './components/ui/skeleton';

// Lazy-loaded pages
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard').then(m => ({ default: m.StudentDashboard })));
const ContractorDashboard = lazy(() => import('./pages/ContractorDashboard').then(m => ({ default: m.ContractorDashboard })));
const EmployeeDashboard = lazy(() => import('./pages/EmployeeDashboard').then(m => ({ default: m.EmployeeDashboard })));
const TTWDashboard = lazy(() => import('./pages/TTWDashboard').then(m => ({ default: m.TTWDashboard })));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage').then(m => ({ default: m.OnboardingPage })));
const TimesheetPage = lazy(() => import('./pages/TimesheetPage').then(m => ({ default: m.TimesheetPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const ConfirmationPage = lazy(() => import('./pages/ConfirmationPage').then(m => ({ default: m.ConfirmationPage })));
const ProgramsPage = lazy(() => import('./pages/ProgramsPage').then(m => ({ default: m.ProgramsPage })));
const JobOpportunitiesPage = lazy(() => import('./pages/JobOpportunitiesPage').then(m => ({ default: m.JobOpportunitiesPage })));
const LearningHubPage = lazy(() => import('./pages/LearningHubPage').then(m => ({ default: m.LearningHubPage })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminStudentList = lazy(() => import('./pages/AdminStudentList').then(m => ({ default: m.AdminStudentList })));
const AdminStudentProfilePage = lazy(() => import('./pages/AdminStudentProfilePage').then(m => ({ default: m.AdminStudentProfilePage })));
const AdminApprovalsPage = lazy(() => import('./pages/AdminApprovalsPage').then(m => ({ default: m.AdminApprovalsPage })));
const AdminProgramsPage = lazy(() => import('./pages/AdminProgramsPage').then(m => ({ default: m.AdminProgramsPage })));
const AdminOpportunitiesPage = lazy(() => import('./pages/AdminOpportunitiesPage').then(m => ({ default: m.AdminOpportunitiesPage })));

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
      </div>
      <div className="text-center space-y-4 relative">
        <div className="w-14 h-14 mx-auto relative">
          <div className="absolute inset-0 rounded-full bg-gradient-conic from-primary via-accent to-primary animate-spin" style={{ background: 'conic-gradient(from 0deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--primary)))' }}></div>
          <div className="absolute inset-[3px] rounded-full bg-background"></div>
        </div>
        <p className="text-sm font-medium text-gradient animate-pulse">Career Focus</p>
      </div>
    </div>
  );
}

function PageFallback() {
  return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
      <div className="grid gap-4 md:grid-cols-3 mt-6">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    </div>
  );
}

// Roles that get non-admin portal access
const PORTAL_ROLES = ['student', 'wble_participant', 'ttw_participant', 'contractor', 'employee'];

function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(user?.role || '')) {
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return <>{children}</>;
}

// Dashboard router — renders the right dashboard based on user role
function DashboardRouter() {
  const { user } = useAuth();
  switch (user?.role) {
    case 'contractor':
      return <ContractorDashboard />;
    case 'employee':
      return <EmployeeDashboard />;
    case 'ttw_participant':
      return <TTWDashboard />;
    default:
      return <StudentDashboard />;
  }
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Suspense fallback={<PageFallback />}>
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

        {/* Universal Portal Routes (all non-admin roles) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={PORTAL_ROLES}>
              <DashboardRouter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents"
          element={
            <ProtectedRoute allowedRoles={PORTAL_ROLES}>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/timesheet"
          element={
            <ProtectedRoute allowedRoles={['student', 'wble_participant', 'ttw_participant', 'contractor']}>
              <TimesheetPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={PORTAL_ROLES}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/programs"
          element={
            <ProtectedRoute allowedRoles={['student', 'wble_participant', 'ttw_participant']}>
              <ProgramsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/job-opportunities"
          element={
            <ProtectedRoute allowedRoles={['student', 'wble_participant', 'ttw_participant', 'contractor']}>
              <JobOpportunitiesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/learning-hub"
          element={
            <ProtectedRoute allowedRoles={PORTAL_ROLES}>
              <LearningHubPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/confirmation"
          element={
            <ProtectedRoute allowedRoles={PORTAL_ROLES}>
              <ConfirmationPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminStudentList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students/:studentId"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminStudentProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/approvals"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminApprovalsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/programs"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminProgramsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/opportunities"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminOpportunitiesPage />
            </ProtectedRoute>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <TooltipProvider>
          <ToastProvider>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </ToastProvider>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
