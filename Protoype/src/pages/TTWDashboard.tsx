import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  ArrowRight,
  BookOpen,
  ChevronRight,
  Upload,
  Megaphone,
  ShieldCheck,
  AlertTriangle,
  FileText,
  TrendingUp,
  Phone,
  User,
  DollarSign,
  Activity,
  CheckCircle2,
  XCircle,
  CircleDot,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/ui/stat-card';
import { Progress } from '@/components/ui/progress';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useAuth } from '@/services/AuthContext';
import { api, Announcement, Enrollment, Document as DocType } from '@/services/api';

// TTW-specific dashboard data extending the student dashboard
interface TTWDashboardData {
  student_name: string;
  program_name?: string;
  program_status?: string;
  total_hours: number;
  hours_this_month: number;
  sga_monthly_limit: number;
  current_pay_period_start?: string;
  current_pay_period_end?: string;
  timesheet_status: string;
  pending_documents: number;
  completed_lessons: number;
  total_lessons: number;
  vr_counselor_name?: string;
  vr_counselor_phone?: string;
}

// Required documents for TTW participants
const TTW_REQUIRED_DOCUMENTS = [
  // Standard WBLE documents
  { type: 'W-4 Form', label: 'W-4 Form' },
  { type: 'I-9 Form', label: 'I-9 Form' },
  { type: 'Direct Deposit', label: 'Direct Deposit Form' },
  { type: 'Emergency Contact', label: 'Emergency Contact Form' },
  { type: 'Photo ID', label: 'Photo ID' },
  // TTW-specific documents
  { type: 'SSDI Award Letter', label: 'SSDI Award Letter' },
  { type: 'Benefits Counseling Cert', label: 'Benefits Counseling Certificate' },
  { type: 'VR Referral Letter', label: 'VR Referral Letter' },
];

// Assumed average hourly wage for SGA estimation
const ASSUMED_HOURLY_WAGE = 15;

export function TTWDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<TTWDashboardData | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [documents, setDocuments] = useState<DocType[]>([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      const [dashRes, annRes, enrollRes, docRes] = await Promise.all([
        api.getStudentDashboard(),
        api.getAnnouncements(),
        api.getCurrentEnrollment(),
        api.getDocuments(),
      ]);

      if (dashRes.data) setDashboardData(dashRes.data as unknown as TTWDashboardData);
      if (annRes.data) setAnnouncements(annRes.data);
      if (enrollRes.data) setEnrollment(enrollRes.data);
      if (docRes.data) setDocuments(docRes.data);

      setLoading(false);
    }
    fetchData();
  }, []);

  // SGA calculations
  const sgaLimit = dashboardData?.sga_monthly_limit ?? 1470;
  const hoursThisMonth = dashboardData?.hours_this_month ?? 0;
  const estimatedEarnings = hoursThisMonth * ASSUMED_HOURLY_WAGE;
  const sgaPercentage = Math.min((estimatedEarnings / sgaLimit) * 100, 100);

  const sgaStatus = useMemo(() => {
    if (sgaPercentage >= 100) return 'over';
    if (sgaPercentage >= 80) return 'warning';
    return 'safe';
  }, [sgaPercentage]);

  const sgaColor = useMemo(() => {
    switch (sgaStatus) {
      case 'over': return {
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        text: 'text-red-600 dark:text-red-400',
        progressBg: 'bg-red-500',
        icon: 'text-red-500',
        badge: 'destructive' as const,
      };
      case 'warning': return {
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        text: 'text-amber-600 dark:text-amber-400',
        progressBg: 'bg-amber-500',
        icon: 'text-amber-500',
        badge: 'warning' as const,
      };
      default: return {
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        text: 'text-emerald-600 dark:text-emerald-400',
        progressBg: 'bg-emerald-500',
        icon: 'text-emerald-500',
        badge: 'success' as const,
      };
    }
  }, [sgaStatus]);

  // Document status mapping
  const documentStatuses = useMemo(() => {
    return TTW_REQUIRED_DOCUMENTS.map((reqDoc) => {
      const uploaded = documents.find(
        (d) => d.document_type.toLowerCase() === reqDoc.type.toLowerCase()
      );
      return {
        ...reqDoc,
        status: uploaded?.status ?? 'missing',
        fileName: uploaded?.file_name,
      };
    });
  }, [documents]);

  const pendingDocCount = documentStatuses.filter(
    (d) => d.status === 'missing' || d.status === 'pending' || d.status === 'rejected'
  ).length;

  // Program progress percentage
  const programProgress = enrollment
    ? Math.min(
        Math.round((enrollment.hours_completed / enrollment.program.total_hours) * 100),
        100
      )
    : 0;

  // Quick actions
  const quickActions = [
    {
      id: 1,
      title: 'Submit Timesheet',
      description: dashboardData?.timesheet_status === 'Not Submitted'
        ? 'Due by Friday 5:00 PM'
        : `Status: ${dashboardData?.timesheet_status || 'Unknown'}`,
      icon: Clock,
      link: '/timesheet',
      priority: dashboardData?.timesheet_status === 'Not Submitted' ? 'high' : 'medium',
    },
    {
      id: 2,
      title: 'Upload Document',
      description: pendingDocCount > 0
        ? `${pendingDocCount} document${pendingDocCount > 1 ? 's' : ''} needed`
        : 'All documents submitted',
      icon: Upload,
      link: '/documents',
      priority: pendingDocCount > 0 ? 'high' : 'medium',
    },
    {
      id: 3,
      title: 'Programs',
      description: enrollment
        ? `${enrollment.program.name} - ${programProgress}% complete`
        : 'View available programs',
      icon: TrendingUp,
      link: '/programs',
      priority: 'medium',
    },
    {
      id: 4,
      title: 'Learning Hub',
      description: `${dashboardData?.completed_lessons || 0} of ${dashboardData?.total_lessons || 8} lessons completed`,
      icon: BookOpen,
      link: '/learning-hub',
      priority: 'medium',
    },
  ];

  const getDocStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'pending':
        return <CircleDot className="w-4 h-4 text-amber-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <CircleDot className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getDocStatusBadge = (status: string): 'success' | 'warning' | 'destructive' | 'secondary' => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="TTW Dashboard">
        <div className="space-y-6">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-64 w-full rounded-lg" />
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
    <DashboardLayout title="TTW Dashboard">
      {/* Welcome Card */}
      <Card className="mb-6 bg-gradient-to-r from-primary to-accent text-primary-foreground border-none shine-effect animate-fade-in">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">
                Welcome back, {dashboardData?.student_name || user?.first_name || 'Participant'}!
              </h2>
              <p className="text-primary-foreground/80 mt-1">
                Ticket to Work Program
                {dashboardData?.program_name ? ` - ${dashboardData.program_name}` : ''}
              </p>
              {dashboardData?.program_status && (
                <div className="mt-3">
                  <Badge
                    variant={
                      dashboardData.program_status === 'active' ? 'success'
                        : dashboardData.program_status === 'pending' ? 'warning'
                        : 'secondary'
                    }
                  >
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

      {/* SGA Threshold Tracker - CRITICAL FEATURE */}
      <Card className={cn(
        'mb-6 border-2 animate-fade-in-up',
        sgaColor.border,
        sgaColor.bg
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className={cn('w-5 h-5', sgaColor.icon)} />
              SGA Threshold Tracker
            </CardTitle>
            <Badge variant={sgaColor.badge}>
              {sgaStatus === 'over' ? 'Over Limit'
                : sgaStatus === 'warning' ? 'Approaching Limit'
                : 'Within Safe Zone'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Substantial Gainful Activity (SGA) limit for Social Security benefits protection
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">
                  Monthly Earnings Estimate
                </span>
                <span className={cn('font-bold', sgaColor.text)}>
                  ${estimatedEarnings.toLocaleString()} / ${sgaLimit.toLocaleString()}
                </span>
              </div>
              <div className="relative h-5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500 ease-out',
                    sgaColor.progressBg
                  )}
                  style={{ width: `${sgaPercentage}%` }}
                />
                {/* 80% marker line */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-foreground/30"
                  style={{ left: '80%' }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>$0</span>
                <span className="text-foreground/50">80% threshold</span>
                <span>${sgaLimit.toLocaleString()}/mo</span>
              </div>
            </div>

            {/* Hours and earnings breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-lg border border-border bg-card p-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Clock className="w-4 h-4" />
                  Hours This Month
                </div>
                <p className="text-xl font-bold text-foreground">{hoursThisMonth}</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <DollarSign className="w-4 h-4" />
                  Est. Earnings
                </div>
                <p className={cn('text-xl font-bold', sgaColor.text)}>
                  ${estimatedEarnings.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Activity className="w-4 h-4" />
                  Remaining
                </div>
                <p className="text-xl font-bold text-foreground">
                  ${Math.max(sgaLimit - estimatedEarnings, 0).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Warning messages */}
            {sgaStatus === 'warning' && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                    Approaching SGA Limit
                  </p>
                  <p className="text-xs text-amber-600/80 dark:text-amber-400/70 mt-1">
                    You are at {Math.round(sgaPercentage)}% of the monthly SGA limit.
                    Exceeding ${sgaLimit.toLocaleString()}/month may affect your Social Security benefits.
                    Contact your VR counselor or benefits planner for guidance.
                  </p>
                </div>
              </div>
            )}
            {sgaStatus === 'over' && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-400">
                    SGA Limit Exceeded
                  </p>
                  <p className="text-xs text-red-600/80 dark:text-red-400/70 mt-1">
                    Your estimated earnings this month exceed the SGA limit of ${sgaLimit.toLocaleString()}.
                    This may impact your SSDI/SSI benefits. Please contact your VR counselor
                    or benefits planner immediately to discuss your options and any applicable work incentives.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="animate-fade-in-up">
          <StatCard
            title="Total Hours Worked"
            value={dashboardData?.total_hours ?? 0}
            icon={<Clock className="w-5 h-5" />}
          />
        </div>
        <div className="animate-fade-in-up animate-delay-100">
          <StatCard
            title="Hours This Month"
            value={hoursThisMonth}
            icon={<Activity className="w-5 h-5" />}
          />
        </div>
        <div className="animate-fade-in-up animate-delay-200">
          <StatCard
            title="Pending Documents"
            value={pendingDocCount}
            icon={<FileText className="w-5 h-5" />}
            description={pendingDocCount === 0 ? 'All submitted' : 'Action needed'}
          />
        </div>
        <div className="animate-fade-in-up animate-delay-300">
          <StatCard
            title="Program Progress"
            value={`${programProgress}%`}
            icon={<TrendingUp className="w-5 h-5" />}
            description={enrollment ? enrollment.program.name : 'No enrollment'}
          />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in animate-delay-200">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <p className="text-sm text-muted-foreground">Tasks that need your attention</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {quickActions.map((action) => (
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

          {/* Current Program Enrollment */}
          {enrollment ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Program Enrollment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h4 className="font-semibold text-foreground">{enrollment.program.name}</h4>
                      <p className="text-sm text-muted-foreground">{enrollment.program.organization}</p>
                      {enrollment.program.location && (
                        <p className="text-xs text-muted-foreground mt-1">{enrollment.program.location}</p>
                      )}
                    </div>
                    <Badge
                      variant={
                        enrollment.status === 'active' ? 'success'
                          : enrollment.status === 'completed' ? 'info'
                          : 'warning'
                      }
                    >
                      {enrollment.status}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Hours Completed</span>
                      <span className="font-medium text-foreground">
                        {enrollment.hours_completed} / {enrollment.program.total_hours} hrs
                      </span>
                    </div>
                    <Progress value={programProgress} className="h-3" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Start Date</p>
                      <p className="font-medium text-foreground">
                        {new Date(enrollment.program.start_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">End Date</p>
                      <p className="font-medium text-foreground">
                        {new Date(enrollment.program.end_date).toLocaleDateString()}
                      </p>
                    </div>
                    {enrollment.supervisor_name && (
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Supervisor</p>
                        <p className="font-medium text-foreground">{enrollment.supervisor_name}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <EmptyState
                  icon={<TrendingUp className="w-8 h-8" />}
                  title="No Active Enrollment"
                  description="You are not currently enrolled in a program. Browse available programs to get started."
                  action={
                    <Button onClick={() => navigate('/programs')} size="sm">
                      Browse Programs
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          )}

          {/* Required Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-muted-foreground" />
                Required Documents
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                All documents must be submitted for program participation
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {documentStatuses.map((doc) => (
                  <div
                    key={doc.type}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {getDocStatusIcon(doc.status)}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{doc.label}</p>
                        {doc.fileName && (
                          <p className="text-xs text-muted-foreground truncate">{doc.fileName}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant={getDocStatusBadge(doc.status)}>
                        {doc.status === 'missing' ? 'Not Submitted' : doc.status}
                      </Badge>
                      {(doc.status === 'missing' || doc.status === 'rejected') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                          onClick={() => navigate('/documents')}
                        >
                          Upload
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* VR Counselor Contact */}
          <Card className="animate-fade-in-up animate-delay-300">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-muted-foreground" />
                VR Counselor
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData?.vr_counselor_name ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {dashboardData.vr_counselor_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Vocational Rehabilitation Counselor
                      </p>
                    </div>
                  </div>
                  {dashboardData.vr_counselor_phone && (
                    <a
                      href={`tel:${dashboardData.vr_counselor_phone}`}
                      className="flex items-center gap-2 p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 transition-colors"
                    >
                      <Phone className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">
                        {dashboardData.vr_counselor_phone}
                      </span>
                    </a>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      if (dashboardData.vr_counselor_phone) {
                        window.location.href = `tel:${dashboardData.vr_counselor_phone}`;
                      }
                    }}
                  >
                    <Phone className="mr-2 w-4 h-4" />
                    Call Counselor
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <User className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No VR counselor assigned yet.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Contact your program coordinator for assignment.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Announcements */}
          <Card className="animate-fade-in-up animate-delay-400">
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

          {/* Benefits Protection Info Card */}
          <Card className="bg-gradient-to-br from-primary to-accent text-white border-none animate-fade-in-up animate-delay-500">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="font-semibold">Benefits Protection</h3>
              </div>
              <p className="text-sm text-white/80 mb-3">
                The Ticket to Work program helps you explore employment while protecting your
                Social Security benefits. Stay below the SGA limit of ${sgaLimit.toLocaleString()}/month.
              </p>
              <p className="text-xs text-white/60 mb-4">
                Questions about your benefits? Contact your VR counselor or call the Ticket to Work helpline.
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => navigate('/learning-hub')}
              >
                Learn More
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
