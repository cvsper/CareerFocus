import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  ArrowRight,
  ChevronRight,
  Upload,
  Megaphone,
  FileText,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ClipboardList,
  Briefcase,
  ShieldCheck,
  UserCircle,
  HelpCircle,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/ui/stat-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useAuth } from '@/services/AuthContext';
import { api, StudentDashboard as DashboardData, Announcement, Document } from '@/services/api';

interface OnboardingDocument {
  name: string;
  type: string;
  required: boolean;
}

const REQUIRED_DOCUMENTS: OnboardingDocument[] = [
  { name: 'Background Check', type: 'background_check', required: true },
  { name: "Driver's License", type: 'drivers_license', required: true },
  { name: 'SSN Card', type: 'ssn_card', required: true },
  { name: 'CPR Certification', type: 'cpr_cert', required: true },
  { name: 'Zero Tolerance', type: 'zero_tolerance', required: true },
  { name: 'HIPAA Training', type: 'hipaa_training', required: true },
  { name: 'Direct Deposit', type: 'direct_deposit', required: true },
  { name: 'W-9', type: 'w9', required: true },
  { name: 'Contractor Agreement', type: 'contractor_agreement', required: true },
];

type DocumentStatus = 'uploaded' | 'pending' | 'missing';

function getDocumentStatus(docType: string, documents: Document[]): DocumentStatus {
  const doc = documents.find(
    (d) => d.document_type.toLowerCase().replace(/[\s-]/g, '_') === docType
  );
  if (!doc) return 'missing';
  if (doc.status === 'approved') return 'uploaded';
  return 'pending';
}

function getDocumentStatusBadge(status: DocumentStatus) {
  switch (status) {
    case 'uploaded':
      return (
        <Badge variant="success" className="gap-1">
          <CheckCircle2 className="w-3 h-3" />
          Uploaded
        </Badge>
      );
    case 'pending':
      return (
        <Badge variant="warning" className="gap-1">
          <AlertCircle className="w-3 h-3" />
          Pending
        </Badge>
      );
    case 'missing':
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="w-3 h-3" />
          Missing
        </Badge>
      );
  }
}

function getOnboardingStatusLabel(percentage: number): string {
  if (percentage === 100) return 'Complete';
  if (percentage >= 75) return 'Almost Done';
  if (percentage >= 50) return 'In Progress';
  if (percentage > 0) return 'Getting Started';
  return 'Not Started';
}

function getOnboardingVariant(percentage: number): 'success' | 'warning' | 'info' | 'destructive' {
  if (percentage === 100) return 'success';
  if (percentage >= 50) return 'info';
  if (percentage > 0) return 'warning';
  return 'destructive';
}

export function ContractorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      const [dashRes, docRes, annRes] = await Promise.all([
        api.getStudentDashboard(),
        api.getDocuments(),
        api.getAnnouncements(),
      ]);

      if (dashRes.data) setDashboardData(dashRes.data);
      if (docRes.data) setDocuments(docRes.data);
      if (annRes.data) setAnnouncements(annRes.data);

      setLoading(false);
    }
    fetchData();
  }, []);

  // Calculate onboarding progress from documents
  const documentStatuses = REQUIRED_DOCUMENTS.map((doc) => ({
    ...doc,
    status: getDocumentStatus(doc.type, documents),
  }));

  const uploadedCount = documentStatuses.filter((d) => d.status === 'uploaded').length;
  const pendingCount = documentStatuses.filter((d) => d.status === 'pending').length;
  const onboardingPercentage = Math.round(
    (uploadedCount / REQUIRED_DOCUMENTS.length) * 100
  );

  const contractorName =
    dashboardData?.student_name ||
    (user ? `${user.first_name} ${user.last_name}` : 'Contractor');

  const quickActions = [
    {
      id: 1,
      title: 'Submit Timesheet',
      description:
        dashboardData?.timesheet_status === 'Not Submitted'
          ? 'Due by Friday 5:00 PM'
          : `Status: ${dashboardData?.timesheet_status || 'Unknown'}`,
      icon: Clock,
      link: '/timesheet',
      priority:
        dashboardData?.timesheet_status === 'Not Submitted' ? 'high' : 'medium',
    },
    {
      id: 2,
      title: 'Upload Document',
      description:
        pendingCount + (REQUIRED_DOCUMENTS.length - uploadedCount - pendingCount) > 0
          ? `${REQUIRED_DOCUMENTS.length - uploadedCount} documents still needed`
          : 'All documents submitted',
      icon: Upload,
      link: '/documents',
      priority:
        REQUIRED_DOCUMENTS.length - uploadedCount > 0 ? 'high' : 'medium',
    },
    {
      id: 3,
      title: 'View Profile',
      description: 'Review your contractor profile and details',
      icon: UserCircle,
      link: '/profile',
      priority: 'medium',
    },
  ];

  if (loading) {
    return (
      <DashboardLayout title="Contractor Dashboard">
        <div className="space-y-6">
          {/* Welcome skeleton */}
          <Skeleton className="h-32 w-full rounded-lg" />

          {/* Stats row skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>

          {/* Content skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-64 w-full rounded-lg" />
              <Skeleton className="h-48 w-full rounded-lg" />
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
    <DashboardLayout title="Contractor Dashboard">
      {/* Welcome Card */}
      <Card className="mb-6 bg-gradient-to-r from-primary to-accent text-primary-foreground border-none shine-effect animate-fade-in">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">
                Welcome back, {contractorName}!
              </h2>
              <p className="text-primary-foreground/80 mt-1">
                1099 Home Health Contractor
              </p>
              {onboardingPercentage < 100 && (
                <div className="mt-3">
                  <Badge variant="warning">Onboarding Incomplete</Badge>
                </div>
              )}
              {onboardingPercentage === 100 && (
                <div className="mt-3">
                  <Badge variant="success">Fully Onboarded</Badge>
                </div>
              )}
            </div>
            <div className="flex-shrink-0">
              <Button
                variant="secondary"
                onClick={() => navigate('/profile')}
              >
                View Profile
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="animate-fade-in-up">
          <StatCard
            title="Total Hours Worked"
            value={dashboardData?.total_hours || 0}
            icon={<Clock className="w-5 h-5" />}
          />
        </div>
        <div className="animate-fade-in-up animate-delay-100">
          <StatCard
            title="Pending Documents"
            value={REQUIRED_DOCUMENTS.length - uploadedCount}
            icon={<FileText className="w-5 h-5" />}
          />
        </div>
        <div className="animate-fade-in-up animate-delay-200">
          <StatCard
            title="Onboarding Status"
            value={getOnboardingStatusLabel(onboardingPercentage)}
            description={`${onboardingPercentage}% complete`}
            icon={<ShieldCheck className="w-5 h-5" />}
          />
        </div>
        <div className="animate-fade-in-up animate-delay-300">
          <StatCard
            title="Active Assignments"
            value={dashboardData?.program_status === 'active' ? 1 : 0}
            icon={<Briefcase className="w-5 h-5" />}
          />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in animate-delay-200">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Onboarding Checklist */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-muted-foreground" />
                    Onboarding Checklist
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {uploadedCount} of {REQUIRED_DOCUMENTS.length} required documents completed
                  </p>
                </div>
                <Badge variant={getOnboardingVariant(onboardingPercentage)}>
                  {onboardingPercentage}%
                </Badge>
              </div>
              <Progress value={onboardingPercentage} className="h-2 mt-3" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {documentStatuses.map((doc) => (
                  <div
                    key={doc.type}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg border border-border transition-colors',
                      doc.status === 'uploaded'
                        ? 'bg-success/5 border-success/20'
                        : doc.status === 'pending'
                        ? 'bg-warning/5 border-warning/20'
                        : 'bg-muted/30 hover:bg-muted/50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                          doc.status === 'uploaded'
                            ? 'bg-success/10'
                            : doc.status === 'pending'
                            ? 'bg-warning/10'
                            : 'bg-muted'
                        )}
                      >
                        {doc.status === 'uploaded' ? (
                          <CheckCircle2 className="w-4 h-4 text-success" />
                        ) : doc.status === 'pending' ? (
                          <AlertCircle className="w-4 h-4 text-warning" />
                        ) : (
                          <FileText className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <span
                        className={cn(
                          'text-sm font-medium',
                          doc.status === 'uploaded'
                            ? 'text-foreground'
                            : 'text-foreground'
                        )}
                      >
                        {doc.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getDocumentStatusBadge(doc.status)}
                      {doc.status === 'missing' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7 px-2"
                          onClick={() => navigate('/documents')}
                        >
                          <Upload className="w-3 h-3 mr-1" />
                          Upload
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {REQUIRED_DOCUMENTS.length - uploadedCount > 0 && (
                <Button
                  className="w-full mt-4"
                  onClick={() => navigate('/documents')}
                >
                  <Upload className="mr-2 w-4 h-4" />
                  Upload Missing Documents
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <p className="text-sm text-muted-foreground">
                Tasks that need your attention
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => navigate(action.link)}
                    className="w-full flex items-center gap-4 p-4 border border-border rounded-xl hover:border-primary/30 hover:bg-primary/5 transition-all group text-left hover-lift"
                  >
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                        action.priority === 'high'
                          ? 'bg-destructive/10 group-hover:bg-destructive/20'
                          : 'bg-gradient-to-br from-primary/10 to-accent/10 group-hover:from-primary/20 group-hover:to-accent/20'
                      )}
                    >
                      <action.icon
                        className={cn(
                          'w-5 h-5',
                          action.priority === 'high'
                            ? 'text-destructive'
                            : 'text-primary'
                        )}
                      />
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
                <EmptyState
                  icon={<Megaphone className="w-6 h-6" />}
                  title="No Announcements"
                  description="Check back later for updates from your coordinator."
                  className="py-8"
                />
              ) : (
                <div className="space-y-4">
                  {announcements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className="flex gap-3 p-3 rounded-lg bg-muted/50 border border-border"
                    >
                      <div
                        className={cn(
                          'w-2 h-2 mt-2 rounded-full flex-shrink-0',
                          announcement.announcement_type === 'warning'
                            ? 'bg-warning'
                            : 'bg-primary'
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-sm font-medium text-foreground">
                            {announcement.title}
                          </h4>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {new Date(
                              announcement.created_at
                            ).toLocaleDateString()}
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

          {/* Timesheet Status */}
          <Card className="animate-fade-in-up animate-delay-400">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-foreground" />
                Timesheet Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Current Period
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {dashboardData?.current_pay_period_start &&
                    dashboardData?.current_pay_period_end
                      ? `${new Date(
                          dashboardData.current_pay_period_start
                        ).toLocaleDateString()} - ${new Date(
                          dashboardData.current_pay_period_end
                        ).toLocaleDateString()}`
                      : 'No active period'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge
                    variant={
                      dashboardData?.timesheet_status === 'Approved'
                        ? 'success'
                        : dashboardData?.timesheet_status === 'Submitted'
                        ? 'info'
                        : dashboardData?.timesheet_status === 'Rejected'
                        ? 'destructive'
                        : 'warning'
                    }
                  >
                    {dashboardData?.timesheet_status || 'Not Submitted'}
                  </Badge>
                </div>
                <Button
                  className="w-full mt-2"
                  size="sm"
                  onClick={() => navigate('/timesheet')}
                >
                  <Clock className="mr-2 w-4 h-4" />
                  {dashboardData?.timesheet_status === 'Not Submitted'
                    ? 'Submit Timesheet'
                    : 'View Timesheet'}
                </Button>
              </div>
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
                Contact your placement coordinator for support with documents,
                timesheets, or assignments.
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
