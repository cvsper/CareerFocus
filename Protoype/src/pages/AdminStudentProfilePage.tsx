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
  CheckCircle,
  XCircle,
  Loader2,
  Download,
  ExternalLink
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useToast } from '../components/ui/Toast';
import { api, StudentProfile } from '../services/api';

interface AdminStudentProfilePageProps {
  onLogout: () => void;
}

export function AdminStudentProfilePage({ onLogout }: AdminStudentProfilePageProps) {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'timesheets' | 'documents' | 'programs'>('overview');

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
        return <StatusBadge status="success">Approved</StatusBadge>;
      case 'submitted':
      case 'pending':
        return <StatusBadge status="warning">Pending</StatusBadge>;
      case 'rejected':
        return <StatusBadge status="error">Rejected</StatusBadge>;
      case 'draft':
        return <StatusBadge status="neutral">Draft</StatusBadge>;
      case 'active':
        return <StatusBadge status="success">Active</StatusBadge>;
      case 'completed':
        return <StatusBadge status="info">Completed</StatusBadge>;
      default:
        return <StatusBadge status="neutral">{status}</StatusBadge>;
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
      <DashboardLayout title="Student Profile" userType="admin" onLogout={onLogout}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout title="Student Profile" userType="admin" onLogout={onLogout}>
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900">Student not found</h3>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/admin/students')}>
            Back to Students
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Student Profile" userType="admin" onLogout={onLogout}>
      {/* Back Button */}
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate('/admin/students')}
        leftIcon={<ArrowLeft className="w-4 h-4" />}
      >
        Back to Students
      </Button>

      {/* Profile Header */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
            {profile.first_name[0]}{profile.last_name[0]}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-slate-900">
                {profile.first_name} {profile.last_name}
              </h1>
              <StatusBadge status={profile.is_active ? 'success' : 'neutral'}>
                {profile.is_active ? 'Active' : 'Inactive'}
              </StatusBadge>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-slate-500">
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
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none">
          <div className="text-center">
            <p className="text-blue-100 text-sm mb-1">Total Hours</p>
            <h3 className="text-3xl font-bold">{profile.total_hours_worked.toFixed(1)}</h3>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-none">
          <div className="text-center">
            <p className="text-green-100 text-sm mb-1">Approved Timesheets</p>
            <h3 className="text-3xl font-bold">{profile.approved_timesheets}</h3>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-none">
          <div className="text-center">
            <p className="text-amber-100 text-sm mb-1">Pending Review</p>
            <h3 className="text-3xl font-bold">{profile.pending_timesheets}</h3>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none">
          <div className="text-center">
            <p className="text-purple-100 text-sm mb-1">Documents</p>
            <h3 className="text-3xl font-bold">{profile.approved_documents}/{profile.documents.length}</h3>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200 pb-2">
        {(['overview', 'timesheets', 'documents', 'programs'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card title="Personal Information">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">Full Name</p>
                  <p className="font-medium">{profile.first_name} {profile.last_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">Email</p>
                  <p className="font-medium">{profile.email}</p>
                </div>
              </div>
              {profile.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-500">Phone</p>
                    <p className="font-medium">{profile.phone}</p>
                  </div>
                </div>
              )}
              {profile.address && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-500">Address</p>
                    <p className="font-medium">{profile.address}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">Joined</p>
                  <p className="font-medium">{new Date(profile.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Work Information */}
          <Card title="Work Information">
            <div className="space-y-4">
              {profile.case_id && (
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-500">Case ID</p>
                    <p className="font-medium">{profile.case_id}</p>
                  </div>
                </div>
              )}
              {profile.job_title && (
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-500">Job Title</p>
                    <p className="font-medium">{profile.job_title}</p>
                  </div>
                </div>
              )}
              {profile.current_program && (
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-500">Current Program</p>
                    <p className="font-medium">{profile.current_program}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">Total Hours Worked</p>
                  <p className="font-medium">{profile.total_hours_worked.toFixed(1)} hours</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Emergency Contact */}
          <Card title="Emergency Contact">
            {profile.emergency_contact_name ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-500">Name</p>
                    <p className="font-medium">{profile.emergency_contact_name}</p>
                  </div>
                </div>
                {profile.emergency_contact_phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-500">Phone</p>
                      <p className="font-medium">{profile.emergency_contact_phone}</p>
                    </div>
                  </div>
                )}
                {profile.emergency_contact_relationship && (
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-500">Relationship</p>
                      <p className="font-medium">{profile.emergency_contact_relationship}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">No emergency contact on file</p>
            )}
          </Card>

          {/* Recent Activity */}
          <Card title="Recent Timesheets">
            {profile.timesheets.length === 0 ? (
              <p className="text-slate-500 text-sm">No timesheets submitted yet</p>
            ) : (
              <div className="space-y-3">
                {profile.timesheets.slice(0, 5).map((ts) => (
                  <div key={ts.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">
                        {new Date(ts.week_start).toLocaleDateString()} - {new Date(ts.week_end).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-slate-500">{ts.total_hours} hours</p>
                    </div>
                    {getStatusBadge(ts.status)}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === 'timesheets' && (
        <Card title={`All Timesheets (${profile.timesheets.length})`}>
          {profile.timesheets.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No timesheets submitted yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200">
                  <tr className="text-slate-500">
                    <th className="text-left py-3 font-medium">Week</th>
                    <th className="text-left py-3 font-medium">Hours</th>
                    <th className="text-left py-3 font-medium">Submitted</th>
                    <th className="text-left py-3 font-medium">Status</th>
                    <th className="text-right py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {profile.timesheets.map((ts) => (
                    <tr key={ts.id} className="hover:bg-slate-50">
                      <td className="py-3">
                        {new Date(ts.week_start).toLocaleDateString()} - {new Date(ts.week_end).toLocaleDateString()}
                      </td>
                      <td className="py-3 font-medium">{ts.total_hours} hrs</td>
                      <td className="py-3 text-slate-500">
                        {ts.submitted_at ? new Date(ts.submitted_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-3">
                        {getStatusBadge(ts.status)}
                        {ts.rejection_reason && (
                          <p className="text-xs text-red-500 mt-1">{ts.rejection_reason}</p>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        {ts.status === 'approved' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadTimesheet(ts.id)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'documents' && (
        <Card title={`All Documents (${profile.documents.length})`}>
          {profile.documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No documents uploaded yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200">
                  <tr className="text-slate-500">
                    <th className="text-left py-3 font-medium">Document Type</th>
                    <th className="text-left py-3 font-medium">File Name</th>
                    <th className="text-left py-3 font-medium">Uploaded</th>
                    <th className="text-left py-3 font-medium">Status</th>
                    <th className="text-right py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {profile.documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50">
                      <td className="py-3 font-medium">{doc.document_type}</td>
                      <td className="py-3 text-slate-600">{doc.file_name}</td>
                      <td className="py-3 text-slate-500">
                        {new Date(doc.uploaded_at).toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        {getStatusBadge(doc.status)}
                        {doc.rejection_reason && (
                          <p className="text-xs text-red-500 mt-1">{doc.rejection_reason}</p>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-600 hover:text-blue-700"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'programs' && (
        <Card title={`Program Enrollments (${profile.enrollments.length})`}>
          {profile.enrollments.length === 0 ? (
            <div className="text-center py-8">
              <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Not enrolled in any programs yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {profile.enrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="p-4 border border-slate-200 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-slate-900">{enrollment.program_name}</h4>
                      <p className="text-sm text-slate-500">{enrollment.organization}</p>
                    </div>
                    {getStatusBadge(enrollment.status)}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500">Enrolled</p>
                      <p className="font-medium">{new Date(enrollment.enrolled_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Hours Completed</p>
                      <p className="font-medium">{enrollment.hours_completed}</p>
                    </div>
                    {enrollment.supervisor_name && (
                      <div>
                        <p className="text-slate-500">Supervisor</p>
                        <p className="font-medium">{enrollment.supervisor_name}</p>
                      </div>
                    )}
                    {enrollment.worksite_phone && (
                      <div>
                        <p className="text-slate-500">Worksite Phone</p>
                        <p className="font-medium">{enrollment.worksite_phone}</p>
                      </div>
                    )}
                  </div>
                  {enrollment.completed_at && (
                    <p className="text-sm text-green-600 mt-3">
                      Completed on {new Date(enrollment.completed_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </DashboardLayout>
  );
}
