import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Megaphone,
  FileText,
  BookOpen,
  Upload,
  User,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
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
import { api, Announcement, Document, LearningProgress } from '@/services/api';

// Onboarding document types that W-2 employees need
const REQUIRED_DOCUMENTS = [
  { type: 'w4', label: 'W-4 Form', description: 'Federal tax withholding' },
  { type: 'i9', label: 'I-9 Form', description: 'Employment eligibility' },
  { type: 'photo_id', label: 'Photo ID', description: 'Government-issued ID' },
  { type: 'direct_deposit', label: 'Direct Deposit', description: 'Bank account details' },
];

function getDocumentStatus(
  docType: string,
  documents: Document[]
): { status: 'uploaded' | 'pending' | 'approved' | 'rejected' | 'missing'; doc?: Document } {
  const match = documents.find(
    (d) => d.document_type.toLowerCase() === docType.toLowerCase()
  );
  if (!match) return { status: 'missing' };
  const normalizedStatus = match.status.toLowerCase();
  if (normalizedStatus === 'approved') return { status: 'approved', doc: match };
  if (normalizedStatus === 'rejected') return { status: 'rejected', doc: match };
  if (normalizedStatus === 'pending') return { status: 'pending', doc: match };
  return { status: 'uploaded', doc: match };
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'approved':
      return <CheckCircle2 className="w-4 h-4 text-success" />;
    case 'pending':
      return <Clock className="w-4 h-4 text-warning" />;
    case 'rejected':
      return <AlertCircle className="w-4 h-4 text-destructive" />;
    default:
      return <Upload className="w-4 h-4 text-muted-foreground" />;
  }
}

function getStatusBadgeVariant(status: string): 'success' | 'warning' | 'destructive' | 'secondary' {
  switch (status) {
    case 'approved':
      return 'success';
    case 'pending':
      return 'warning';
    case 'rejected':
      return 'destructive';
    default:
      return 'secondary';
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'approved':
      return 'Approved';
    case 'pending':
      return 'Under Review';
    case 'rejected':
      return 'Rejected';
    case 'uploaded':
      return 'Uploaded';
    default:
      return 'Not Uploaded';
  }
}

export function EmployeeDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [learningProgress, setLearningProgress] = useState<LearningProgress[]>([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      const [annRes, docRes, learnRes] = await Promise.all([
        api.getAnnouncements(),
        api.getDocuments(),
        api.getLearningProgress(),
      ]);

      if (annRes.data) setAnnouncements(annRes.data);
      if (docRes.data) setDocuments(docRes.data);
      if (learnRes.data) setLearningProgress(learnRes.data);

      setLoading(false);
    }
    fetchData();
  }, []);

  const employeeName = user
    ? `${user.first_name} ${user.last_name}`
    : 'Employee';

  // Compute onboarding document completion
  const docStatuses = REQUIRED_DOCUMENTS.map((rd) => ({
    ...rd,
    ...getDocumentStatus(rd.type, documents),
  }));
  const completedDocs = docStatuses.filter(
    (d) => d.status === 'approved' || d.status === 'pending' || d.status === 'uploaded'
  ).length;
  const totalRequiredDocs = REQUIRED_DOCUMENTS.length;

  // Learning progress
  const completedLessons = learningProgress.filter((lp) => lp.completed).length;
  const totalLessons = learningProgress.length || 8; // fallback
  const learningPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Quick actions
  const quickActions = [
    {
      id: 'upload',
      title: 'Upload Document',
      description: completedDocs < totalRequiredDocs
        ? `${totalRequiredDocs - completedDocs} document${totalRequiredDocs - completedDocs !== 1 ? 's' : ''} remaining`
        : 'All documents submitted',
      icon: Upload,
      link: '/documents',
      priority: completedDocs < totalRequiredDocs ? 'high' : 'low',
    },
    {
      id: 'learning',
      title: 'Learning Hub',
      description: `${completedLessons} of ${totalLessons} lessons completed`,
      icon: BookOpen,
      link: '/learning-hub',
      priority: completedLessons < totalLessons ? 'medium' : 'low',
    },
    {
      id: 'profile',
      title: 'View Profile',
      description: 'Review your personal information',
      icon: User,
      link: '/profile',
      priority: 'low',
    },
  ];

  if (loading) {
    return (
      <DashboardLayout title="Employee Dashboard">
        <div className="space-y-6">
          <Skeleton className="h-28 w-full rounded-lg" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
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
    <DashboardLayout title="Employee Dashboard">
      {/* Welcome Card */}
      <Card className="mb-6 bg-gradient-to-r from-primary to-accent text-primary-foreground border-none shine-effect animate-fade-in">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">
                Welcome, {employeeName}!
              </h2>
              <p className="text-primary-foreground/80 mt-1">
                {user?.job_title || 'W-2 Employee'} at Career Focus
              </p>
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="animate-fade-in-up">
          <StatCard
            title="Announcements"
            value={announcements.length}
            icon={<Megaphone className="w-5 h-5" />}
            description={announcements.length > 0 ? 'Active announcements' : 'No announcements'}
          />
        </div>
        <div className="animate-fade-in-up animate-delay-100">
          <StatCard
            title="Documents"
            value={`${completedDocs} / ${totalRequiredDocs}`}
            icon={<FileText className="w-5 h-5" />}
            description={completedDocs === totalRequiredDocs ? 'All submitted' : 'Onboarding documents'}
          />
        </div>
        <div className="animate-fade-in-up animate-delay-200">
          <StatCard
            title="Learning Progress"
            value={`${learningPercent}%`}
            icon={<BookOpen className="w-5 h-5" />}
            description={`${completedLessons} of ${totalLessons} lessons`}
          />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in animate-delay-200">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Announcements — Primary view for employees */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-muted-foreground" />
                Company Announcements
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Latest updates from Career Focus
              </p>
            </CardHeader>
            <CardContent>
              {announcements.length === 0 ? (
                <EmptyState
                  icon={<Megaphone className="w-8 h-8" />}
                  title="No Announcements"
                  description="There are no company announcements at this time. Check back later."
                  className="py-10"
                />
              ) : (
                <div className="space-y-3">
                  {announcements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className="flex gap-3 p-4 rounded-xl bg-muted/50 border border-border"
                    >
                      <div
                        className={cn(
                          'w-2 h-2 mt-2 rounded-full flex-shrink-0',
                          announcement.announcement_type === 'warning'
                            ? 'bg-warning'
                            : announcement.announcement_type === 'urgent'
                              ? 'bg-destructive'
                              : 'bg-primary'
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-sm font-semibold text-foreground">
                            {announcement.title}
                          </h4>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {announcement.announcement_type === 'urgent' && (
                              <Badge variant="destructive">Urgent</Badge>
                            )}
                            {announcement.announcement_type === 'warning' && (
                              <Badge variant="warning">Important</Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {new Date(announcement.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                          {announcement.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Onboarding Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-muted-foreground" />
                Onboarding Documents
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Required employment documents
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {docStatuses.map((doc) => (
                  <div
                    key={doc.type}
                    className="flex items-center gap-4 p-4 border border-border rounded-xl hover:border-primary/30 hover:bg-primary/5 transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-muted/60 flex items-center justify-center flex-shrink-0">
                      {getStatusIcon(doc.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-foreground">
                        {doc.label}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {doc.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Badge variant={getStatusBadgeVariant(doc.status)}>
                        {getStatusLabel(doc.status)}
                      </Badge>
                      {(doc.status === 'missing' || doc.status === 'rejected') && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate('/documents')}
                        >
                          <Upload className="w-3 h-3 mr-1.5" />
                          Upload
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Document completion progress */}
              <div className="mt-5 pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Completion</span>
                  <span className="text-sm font-medium text-foreground">
                    {completedDocs} of {totalRequiredDocs}
                  </span>
                </div>
                <Progress
                  value={totalRequiredDocs > 0 ? (completedDocs / totalRequiredDocs) * 100 : 0}
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Learning Hub Access */}
          <Card className="bg-primary/5 border-primary/20 shine-effect animate-fade-in-up animate-delay-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Learning Hub</h3>
                  <p className="text-xs text-muted-foreground">
                    {completedLessons === totalLessons
                      ? 'All lessons completed!'
                      : `${completedLessons} of ${totalLessons} lessons done`}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-muted-foreground">Progress</span>
                  <span className="text-xs font-medium text-foreground">{learningPercent}%</span>
                </div>
                <Progress value={learningPercent} className="h-2" />
              </div>

              <Button
                className="w-full"
                onClick={() => navigate('/learning-hub')}
              >
                {completedLessons === totalLessons ? 'Review Lessons' : 'Continue Learning'}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="animate-fade-in-up animate-delay-400">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => navigate(action.link)}
                    className="w-full flex items-center gap-3 p-3 border border-border rounded-xl hover:border-primary/30 hover:bg-primary/5 transition-all group text-left hover-lift"
                  >
                    <div
                      className={cn(
                        'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0',
                        action.priority === 'high'
                          ? 'bg-destructive/10 group-hover:bg-destructive/20'
                          : 'bg-gradient-to-br from-primary/10 to-accent/10 group-hover:from-primary/20 group-hover:to-accent/20'
                      )}
                    >
                      <action.icon
                        className={cn(
                          'w-4 h-4',
                          action.priority === 'high' ? 'text-destructive' : 'text-primary'
                        )}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-foreground group-hover:text-primary">
                        {action.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {action.description}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary flex-shrink-0" />
                  </button>
                ))}
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
                Contact HR or your supervisor for questions about your employment, benefits, or documents.
              </p>
              <Button variant="secondary" size="sm" className="w-full">
                Contact HR
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
