import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  BookOpen,
  Briefcase,
  Bell,
  ChevronRight,
  Calendar,
  Upload
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';

interface StudentDashboardProps {
  onLogout: () => void;
}

export function StudentDashboard({ onLogout }: StudentDashboardProps) {
  const navigate = useNavigate();

  // Mock data - in production, this would come from API
  const studentData = {
    name: 'John',
    programName: 'Summer Internship Program 2024',
    programStatus: 'Active' as const,
    currentPayPeriod: 'Oct 21 - Oct 27, 2024',
    timesheetStatus: 'Not Submitted' as const,
  };

  const nextActions = [
    {
      id: 1,
      title: 'Submit weekly timesheet',
      description: 'Due by Friday 5:00 PM',
      icon: Clock,
      link: '/timesheet',
      priority: 'high'
    },
    {
      id: 2,
      title: 'Upload W-4 form',
      description: 'Required for payroll setup',
      icon: Upload,
      link: '/documents',
      priority: 'high'
    },
    {
      id: 3,
      title: 'Complete Learning Hub lesson',
      description: 'Understanding Your Paycheck',
      icon: BookOpen,
      link: '/learning-hub',
      priority: 'medium'
    }
  ];

  const announcements = [
    {
      id: 1,
      title: 'Payroll Processing Update',
      message: 'Timesheets for this period must be submitted by Friday 5PM.',
      date: 'Today',
      type: 'warning'
    },
    {
      id: 2,
      title: 'New Learning Content Available',
      message: 'Check out our new lesson on reading pay stubs.',
      date: 'Yesterday',
      type: 'info'
    }
  ];

  const upcomingOpportunities = [
    {
      id: 1,
      title: 'Fall Internship Program',
      organization: 'Career Focus',
      deadline: 'Nov 15, 2024',
      type: 'Internship'
    },
    {
      id: 2,
      title: 'Healthcare Career Pathway',
      organization: 'Regional Medical Center',
      deadline: 'Dec 01, 2024',
      type: 'Pathway'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Completed':
        return 'info';
      default:
        return 'neutral';
    }
  };

  const getTimesheetStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Submitted':
        return 'info';
      case 'Not Submitted':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  return (
    <DashboardLayout
      title="Dashboard"
      userType="student"
      onLogout={onLogout}
    >
      {/* Welcome Card */}
      <Card className="mb-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">
              Welcome back, {studentData.name}!
            </h2>
            <p className="text-blue-100 mt-1">
              {studentData.programName}
            </p>
            <div className="mt-3">
              <StatusBadge status={getStatusColor(studentData.programStatus) as any}>
                {studentData.programStatus}
              </StatusBadge>
            </div>
          </div>
          <div className="flex-shrink-0">
            <Button
              variant="secondary"
              onClick={() => navigate('/programs')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              View Program Details
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Next Actions Card */}
          <Card title="Next Actions" description="Tasks that need your attention">
            <div className="space-y-3">
              {nextActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => navigate(action.link)}
                  className="w-full flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group text-left"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    action.priority === 'high'
                      ? 'bg-red-100 group-hover:bg-red-200'
                      : 'bg-blue-100 group-hover:bg-blue-200'
                  }`}>
                    <action.icon className={`w-5 h-5 ${
                      action.priority === 'high' ? 'text-red-600' : 'text-blue-600'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 group-hover:text-blue-600">
                      {action.title}
                    </h4>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {action.description}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-500 flex-shrink-0" />
                </button>
              ))}
            </div>
          </Card>

          {/* Timesheet Status Card */}
          <Card title="Timesheet Status">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Current Pay Period</p>
                  <p className="font-semibold text-slate-900">{studentData.currentPayPeriod}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-slate-500">Status</p>
                  <StatusBadge status={getTimesheetStatusColor(studentData.timesheetStatus) as any}>
                    {studentData.timesheetStatus}
                  </StatusBadge>
                </div>
                <Button
                  onClick={() => navigate('/timesheet')}
                  size="sm"
                  leftIcon={<Clock className="w-4 h-4" />}
                >
                  Submit Timesheet
                </Button>
              </div>
            </div>
          </Card>

          {/* Learning Hub Highlight */}
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">Continue Learning</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Next up: <span className="font-medium">Understanding Your Paycheck</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  3-5 min read • Learn how your paycheck works
                </p>
              </div>
              <Button
                onClick={() => navigate('/learning-hub')}
                variant="primary"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Start Lesson
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Announcements */}
          <Card title="Announcements">
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="flex gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100"
                >
                  <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                    announcement.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-sm font-medium text-slate-900">
                        {announcement.title}
                      </h4>
                      <span className="text-xs text-slate-400 flex-shrink-0">
                        {announcement.date}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      {announcement.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Next Opportunities */}
          <Card title="Upcoming Opportunities">
            <div className="space-y-4">
              {upcomingOpportunities.map((opportunity) => (
                <div
                  key={opportunity.id}
                  className="p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
                  onClick={() => navigate('/job-opportunities')}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-medium text-slate-900">
                      {opportunity.title}
                    </h4>
                    <StatusBadge status="info">{opportunity.type}</StatusBadge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {opportunity.organization}
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    Apply by: {opportunity.deadline}
                  </p>
                </div>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-4 text-slate-500"
              onClick={() => navigate('/job-opportunities')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              View All Opportunities
            </Button>
          </Card>

          {/* Help Card */}
          <Card className="bg-slate-900 text-slate-300">
            <h3 className="text-white font-semibold mb-2">Need Help?</h3>
            <p className="text-sm mb-4">
              Contact your placement coordinator for support.
            </p>
            <Button variant="secondary" size="sm" className="w-full">
              Contact Support
            </Button>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
