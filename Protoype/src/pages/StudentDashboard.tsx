import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  ArrowRight,
  BookOpen,
  ChevronRight,
  Calendar,
  Upload,
  Loader2
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { api, StudentDashboard as DashboardData, Announcement, Opportunity } from '../services/api';

interface StudentDashboardProps {
  onLogout: () => void;
}

export function StudentDashboard({ onLogout }: StudentDashboardProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      const [dashRes, annRes, oppRes] = await Promise.all([
        api.getStudentDashboard(),
        api.getAnnouncements(),
        api.getFeaturedOpportunities()
      ]);

      if (dashRes.data) setDashboardData(dashRes.data);
      if (annRes.data) setAnnouncements(annRes.data);
      if (oppRes.data) setOpportunities(oppRes.data.slice(0, 2));

      setLoading(false);
    }
    fetchData();
  }, []);

  const nextActions = [
    {
      id: 1,
      title: 'Submit weekly timesheet',
      description: dashboardData?.timesheet_status === 'Not Submitted' ? 'Due by Friday 5:00 PM' : `Status: ${dashboardData?.timesheet_status}`,
      icon: Clock,
      link: '/timesheet',
      priority: dashboardData?.timesheet_status === 'Not Submitted' ? 'high' : 'medium'
    },
    {
      id: 2,
      title: 'Upload required documents',
      description: dashboardData?.pending_documents ? `${dashboardData.pending_documents} pending` : 'All documents submitted',
      icon: Upload,
      link: '/documents',
      priority: dashboardData?.pending_documents ? 'high' : 'medium'
    },
    {
      id: 3,
      title: 'Complete Learning Hub lesson',
      description: `${dashboardData?.completed_lessons || 0} of ${dashboardData?.total_lessons || 8} completed`,
      icon: BookOpen,
      link: '/learning-hub',
      priority: 'medium'
    }
  ];

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'completed':
        return 'info';
      default:
        return 'neutral';
    }
  };

  const getTimesheetStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Submitted':
        return 'info';
      case 'Not Submitted':
        return 'warning';
      case 'Rejected':
        return 'error';
      default:
        return 'neutral';
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Dashboard" userType="student" onLogout={onLogout}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

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
              Welcome back, {dashboardData?.student_name || 'Student'}!
            </h2>
            <p className="text-blue-100 mt-1">
              {dashboardData?.program_name || 'No active program'}
            </p>
            {dashboardData?.program_status && (
              <div className="mt-3">
                <StatusBadge status={getStatusColor(dashboardData.program_status) as any}>
                  {dashboardData.program_status}
                </StatusBadge>
              </div>
            )}
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
                  <p className="font-semibold text-slate-900">
                    {dashboardData?.current_pay_period_start && dashboardData?.current_pay_period_end
                      ? `${new Date(dashboardData.current_pay_period_start).toLocaleDateString()} - ${new Date(dashboardData.current_pay_period_end).toLocaleDateString()}`
                      : 'No active timesheet'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-slate-500">Status</p>
                  <StatusBadge status={getTimesheetStatusColor(dashboardData?.timesheet_status) as any}>
                    {dashboardData?.timesheet_status || 'Unknown'}
                  </StatusBadge>
                </div>
                <Button
                  onClick={() => navigate('/timesheet')}
                  size="sm"
                  leftIcon={<Clock className="w-4 h-4" />}
                >
                  {dashboardData?.timesheet_status === 'Not Submitted' ? 'Submit Timesheet' : 'View Timesheet'}
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
                  {dashboardData?.completed_lessons === dashboardData?.total_lessons
                    ? 'All lessons completed!'
                    : `${dashboardData?.completed_lessons || 0} of ${dashboardData?.total_lessons || 8} lessons completed`}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  3-5 min per lesson • Learn how your paycheck works
                </p>
              </div>
              <Button
                onClick={() => navigate('/learning-hub')}
                variant="primary"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {dashboardData?.completed_lessons === dashboardData?.total_lessons ? 'Review Lessons' : 'Continue'}
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Announcements */}
          <Card title="Announcements">
            {announcements.length === 0 ? (
              <p className="text-sm text-slate-500">No announcements</p>
            ) : (
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="flex gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100"
                  >
                    <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                      announcement.announcement_type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-sm font-medium text-slate-900">
                          {announcement.title}
                        </h4>
                        <span className="text-xs text-slate-400 flex-shrink-0">
                          {new Date(announcement.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">
                        {announcement.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Next Opportunities */}
          <Card title="Upcoming Opportunities">
            {opportunities.length === 0 ? (
              <p className="text-sm text-slate-500">No featured opportunities</p>
            ) : (
              <div className="space-y-4">
                {opportunities.map((opportunity) => (
                  <div
                    key={opportunity.id}
                    className="p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
                    onClick={() => navigate('/job-opportunities')}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-medium text-slate-900">
                        {opportunity.title}
                      </h4>
                      <StatusBadge status="info">{opportunity.opportunity_type}</StatusBadge>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {opportunity.organization}
                    </p>
                    {opportunity.application_deadline && (
                      <p className="text-xs text-slate-400 mt-2">
                        Apply by: {new Date(opportunity.application_deadline).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
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
