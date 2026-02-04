import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Clock,
  FileText,
  GraduationCap,
  AlertCircle,
  Download,
  ExternalLink
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/ui/stat-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/Toast';
import { api, StudentProfile } from '@/services/api';

export function AdminStudentProfilePage() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<StudentProfile | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      if (!studentId) return;

      setLoading(true);
      const { data, error } = await api.getStudentProfile(parseInt(studentId));

      if (data) {
        setProfile(data);
      } else {
        toast.error(error || 'Failed to load student profile');
        navigate('/admin/students');
      }

      setLoading(false);
    }

    fetchProfile();
  }, [studentId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'submitted':
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'completed':
        return <Badge variant="info">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleDownloadTimesheet = async (timesheetId: number) => {
    const { data, error } = await api.downloadTimesheetPDF(timesheetId);
    if (data) {
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `timesheet_${timesheetId}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      toast.error(error || 'Failed to download timesheet');
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Student Profile">
        <div className="space-y-6">
          <Skeleton className="h-9 w-40" />
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <Skeleton className="w-20 h-20 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-7 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-[100px]" />
            ))}
          </div>
          <Skeleton className="h-10 w-full max-w-md" />
          <Skeleton className="h-64" />
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout title="Student Profile">
        <EmptyState
          icon={<AlertCircle className="w-8 h-8" />}
          title="Student not found"
          description="The student profile could not be loaded."
          action={
            <Button variant="outline" onClick={() => navigate('/admin/students')}>
              Back to Students
            </Button>
          }
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Student Profile">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="mb-6 animate-fade-in"
        onClick={() => navigate('/admin/students')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Students
      </Button>

      {/* Profile Header */}
      <Card className="mb-6 border-l-4 border-l-primary animate-fade-in animate-delay-100">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <Avatar className="w-20 h-20 ring-4 ring-primary/10">
              <AvatarFallback className="bg-gradient-to-br from-primary/10 to-accent/10 text-primary text-2xl font-bold">
                {profile.first_name[0]}{profile.last_name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-foreground">
                  {profile.first_name} {profile.last_name}
                </h1>
                <Badge variant={profile.is_active ? 'success' : 'secondary'}>
                  {profile.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4" /> {profile.email}
                </span>
                {profile.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-4 h-4" /> {profile.phone}
                  </span>
                )}
                {profile.current_program && (
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-4 h-4" /> {profile.current_program}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => window.location.href = `mailto:${profile.email}`}>
                <Mail className="w-4 h-4 mr-2" /> Email
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-fade-in animate-delay-200">
        <StatCard
          title="Total Hours"
          value={profile.total_hours_worked.toFixed(1)}
          icon={<Clock className="w-5 h-5" />}
        />
        <StatCard
          title="Approved Timesheets"
          value={profile.approved_timesheets}
          icon={<FileText className="w-5 h-5" />}
        />
        <StatCard
          title="Pending Review"
          value={profile.pending_timesheets}
          icon={<Clock className="w-5 h-5" />}
        />
        <StatCard
          title="Documents"
          value={`${profile.approved_documents}/${profile.documents.length}`}
          icon={<FileText className="w-5 h-5" />}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="animate-fade-in animate-delay-300">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timesheets">Timesheets</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p className="font-medium">{profile.first_name} {profile.last_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{profile.email}</p>
                    </div>
                  </div>
                  {profile.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{profile.phone}</p>
                      </div>
                    </div>
                  )}
                  {profile.address && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p className="font-medium">{profile.address}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Joined</p>
                      <p className="font-medium">{new Date(profile.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Work Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Work Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile.case_id && (
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Case ID</p>
                        <p className="font-medium">{profile.case_id}</p>
                      </div>
                    </div>
                  )}
                  {profile.job_title && (
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Job Title</p>
                        <p className="font-medium">{profile.job_title}</p>
                      </div>
                    </div>
                  )}
                  {profile.current_program && (
                    <div className="flex items-center gap-3">
                      <GraduationCap className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Current Program</p>
                        <p className="font-medium">{profile.current_program}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Hours Worked</p>
                      <p className="font-medium">{profile.total_hours_worked.toFixed(1)} hours</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent>
                {profile.emergency_contact_name ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">{profile.emergency_contact_name}</p>
                      </div>
                    </div>
                    {profile.emergency_contact_phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="font-medium">{profile.emergency_contact_phone}</p>
                        </div>
                      </div>
                    )}
                    {profile.emergency_contact_relationship && (
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Relationship</p>
                          <p className="font-medium">{profile.emergency_contact_relationship}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No emergency contact on file</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Timesheets */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Timesheets</CardTitle>
              </CardHeader>
              <CardContent>
                {profile.timesheets.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No timesheets submitted yet</p>
                ) : (
                  <div className="space-y-3">
                    {profile.timesheets.slice(0, 5).map((ts) => (
                      <div key={ts.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/50 hover:bg-muted transition-colors">
                        <div>
                          <p className="font-medium text-sm">
                            {new Date(ts.week_start).toLocaleDateString()} - {new Date(ts.week_end).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-muted-foreground">{ts.total_hours} hours</p>
                        </div>
                        {getStatusBadge(ts.status)}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timesheets">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">All Timesheets ({profile.timesheets.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.timesheets.length === 0 ? (
                <EmptyState
                  icon={<Clock className="w-8 h-8" />}
                  title="No timesheets submitted"
                  description="This student hasn't submitted any timesheets yet."
                />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Week</TableHead>
                        <TableHead>Hours</TableHead>
                        <TableHead className="hidden sm:table-cell">Submitted</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profile.timesheets.map((ts) => (
                        <TableRow key={ts.id}>
                          <TableCell>
                            {new Date(ts.week_start).toLocaleDateString()} - {new Date(ts.week_end).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="font-medium">{ts.total_hours} hrs</TableCell>
                          <TableCell className="text-muted-foreground hidden sm:table-cell">
                            {ts.submitted_at ? new Date(ts.submitted_at).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(ts.status)}
                            {ts.rejection_reason && (
                              <p className="text-xs text-destructive mt-1">{ts.rejection_reason}</p>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {ts.status === 'approved' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadTimesheet(ts.id)}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">All Documents ({profile.documents.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.documents.length === 0 ? (
                <EmptyState
                  icon={<FileText className="w-8 h-8" />}
                  title="No documents uploaded"
                  description="This student hasn't uploaded any documents yet."
                />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document Type</TableHead>
                        <TableHead className="hidden sm:table-cell">File Name</TableHead>
                        <TableHead className="hidden sm:table-cell">Uploaded</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profile.documents.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium">{doc.document_type}</TableCell>
                          <TableCell className="text-muted-foreground hidden sm:table-cell">{doc.file_name}</TableCell>
                          <TableCell className="text-muted-foreground hidden sm:table-cell">
                            {new Date(doc.uploaded_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(doc.status)}
                            {doc.rejection_reason && (
                              <p className="text-xs text-destructive mt-1">{doc.rejection_reason}</p>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <a
                              href={doc.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-primary hover:text-primary/80"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="programs">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Program Enrollments ({profile.enrollments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.enrollments.length === 0 ? (
                <EmptyState
                  icon={<GraduationCap className="w-8 h-8" />}
                  title="Not enrolled in any programs"
                  description="This student hasn't enrolled in any programs yet."
                />
              ) : (
                <div className="space-y-4">
                  {profile.enrollments.map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className="p-4 border border-border rounded-lg hover:border-primary/20 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-foreground">{enrollment.program_name}</h4>
                          <p className="text-sm text-muted-foreground">{enrollment.organization}</p>
                        </div>
                        {getStatusBadge(enrollment.status)}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Enrolled</p>
                          <p className="font-medium">{new Date(enrollment.enrolled_at).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Hours Completed</p>
                          <p className="font-medium">{enrollment.hours_completed}</p>
                        </div>
                        {enrollment.supervisor_name && (
                          <div>
                            <p className="text-muted-foreground">Supervisor</p>
                            <p className="font-medium">{enrollment.supervisor_name}</p>
                          </div>
                        )}
                        {enrollment.worksite_phone && (
                          <div>
                            <p className="text-muted-foreground">Worksite Phone</p>
                            <p className="font-medium">{enrollment.worksite_phone}</p>
                          </div>
                        )}
                      </div>
                      {enrollment.completed_at && (
                        <p className="text-sm text-success mt-3">
                          Completed on {new Date(enrollment.completed_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
