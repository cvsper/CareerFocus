import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  ArrowRight,
  BookOpen,
  ChevronRight,
  Calendar,
  Upload,
  Megaphone,
  Briefcase,
  HelpCircle,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/ui/stat-card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { api, StudentDashboard as DashboardData, Announcement, Opportunity } from '@/services/api';

export function StudentDashboard() {
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

  const getStatusVariant = (status: string | undefined): 'success' | 'warning' | 'info' | 'secondary' => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'completed':
        return 'info';
      default:
        return 'secondary';
    }
  };

  const getTimesheetVariant = (status: string | undefined): 'success' | 'info' | 'warning' | 'destructive' | 'secondary' => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Submitted':
        return 'info';
      case 'Not Submitted':
        return 'warning';
      case 'Rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="space-y-6">
          {/* Welcome skeleton */}
          <Skeleton className="h-32 w-full rounded-lg" />

          {/* Stats row skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>

          {/* Content skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-40 w-full rounded-lg" />
              <Skeleton className="h-40 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard">
      {/* Welcome Card */}
      <Card className="mb-6 bg-gradient-to-r from-primary to-accent text-primary-foreground border-none shine-effect animate-fade-in">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">
                Welcome back, {dashboardData?.student_name || 'Student'}!
              </h2>
              <p className="text-primary-foreground/80 mt-1">
                {dashboardData?.program_name || 'No active program'}
              </p>
              {dashboardData?.program_status && (
                <div className="mt-3">
                  <Badge variant={getStatusVariant(dashboardData.program_status)}>
                    {dashboardData.program_status}
                  </Badge>
                </div>
              )}
            </div>
            <div className="flex-shrink-0">
              <Button
                variant="secondary"
                onClick={() => navigate('/programs')}
              >
                View Program Details
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="animate-fade-in-up">
          <StatCard
            title="Timesheet Status"
            value={dashboardData?.timesheet_status || 'Unknown'}
            icon={<Clock className="w-5 h-5" />}
          />
        </div>
        <div className="animate-fade-in-up animate-delay-100">
          <StatCard
            title="Pending Documents"
            value={dashboardData?.pending_documents || 0}
            icon={<Upload className="w-5 h-5" />}
          />
        </div>
        <div className="animate-fade-in-up animate-delay-200">
          <StatCard
            title="Lessons Completed"
            value={`${dashboardData?.completed_lessons || 0} / ${dashboardData?.total_lessons || 8}`}
            icon={<BookOpen className="w-5 h-5" />}
          />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in animate-delay-200">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Next Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Next Actions</CardTitle>
              <p className="text-sm text-muted-foreground">Tasks that need your attention</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {nextActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => navigate(action.link)}
                    className="w-full flex items-center gap-4 p-4 border border-border rounded-xl hover:border-primary/30 hover:bg-primary/5 transition-all group text-left hover-lift"
                  >
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                      action.priority === 'high'
                        ? 'bg-destructive/10 group-hover:bg-destructive/20'
                        : 'bg-gradient-to-br from-primary/10 to-accent/10 group-hover:from-primary/20 group-hover:to-accent/20'
                    )}>
                      <action.icon className={cn(
                        'w-5 h-5',
                        action.priority === 'high' ? 'text-destructive' : 'text-primary'
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground group-hover:text-primary">
                        {action.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {action.description}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary flex-shrink-0" />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Timesheet Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Timesheet Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current Pay Period</p>
                    <p className="font-semibold text-foreground">
                      {dashboardData?.current_pay_period_start && dashboardData?.current_pay_period_end
                        ? `${new Date(dashboardData.current_pay_period_start).toLocaleDateString()} - ${new Date(dashboardData.current_pay_period_end).toLocaleDateString()}`
                        : 'No active timesheet'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={getTimesheetVariant(dashboardData?.timesheet_status)}>
                      {dashboardData?.timesheet_status || 'Unknown'}
                    </Badge>
                  </div>
                  <Button
                    onClick={() => navigate('/timesheet')}
                    size="sm"
                  >
                    <Clock className="mr-2 w-4 h-4" />
                    {dashboardData?.timesheet_status === 'Not Submitted' ? 'Submit Timesheet' : 'View Timesheet'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Learning Hub Highlight */}
          <Card className="bg-primary/5 border-primary/20 shine-effect">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-7 h-7 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Continue Learning</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {dashboardData?.completed_lessons === dashboardData?.total_lessons
                      ? 'All lessons completed!'
                      : `${dashboardData?.completed_lessons || 0} of ${dashboardData?.total_lessons || 8} lessons completed`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    3-5 min per lesson - Learn how your paycheck works
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/learning-hub')}
                >
                  {dashboardData?.completed_lessons === dashboardData?.total_lessons ? 'Review Lessons' : 'Continue'}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Announcements */}
          <Card className="animate-fade-in-up animate-delay-300">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-muted-foreground" />
                Announcements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {announcements.length === 0 ? (
                <p className="text-sm text-muted-foreground">No announcements</p>
              ) : (
                <div className="space-y-4">
                  {announcements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className="flex gap-3 p-3 rounded-lg bg-muted/50 border border-border"
                    >
                      <div className={cn(
                        'w-2 h-2 mt-2 rounded-full flex-shrink-0',
                        announcement.announcement_type === 'warning' ? 'bg-warning' : 'bg-primary'
                      )} />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-sm font-medium text-foreground">
                            {announcement.title}
                          </h4>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {new Date(announcement.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {announcement.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Opportunities */}
          <Card className="animate-fade-in-up animate-delay-400">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-muted-foreground" />
                Upcoming Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              {opportunities.length === 0 ? (
                <p className="text-sm text-muted-foreground">No featured opportunities</p>
              ) : (
                <div className="space-y-4">
                  {opportunities.map((opportunity) => (
                    <div
                      key={opportunity.id}
                      className="p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer"
                      onClick={() => navigate('/job-opportunities')}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-medium text-foreground">
                          {opportunity.title}
                        </h4>
                        <Badge variant="info">{opportunity.opportunity_type}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {opportunity.organization}
                      </p>
                      {opportunity.application_deadline && (
                        <p className="text-xs text-muted-foreground mt-2">
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
                className="w-full mt-4 text-muted-foreground"
                onClick={() => navigate('/job-opportunities')}
              >
                View All Opportunities
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Help Card */}
          <Card className="bg-gradient-to-br from-primary to-accent text-white border-none animate-fade-in-up animate-delay-500">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle className="w-5 h-5" />
                <h3 className="font-semibold">Need Help?</h3>
              </div>
              <p className="text-sm text-white/80 mb-4">
                Contact your placement coordinator for support.
              </p>
              <Button variant="secondary" size="sm" className="w-full">
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
