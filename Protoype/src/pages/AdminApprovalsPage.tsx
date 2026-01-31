import React, { useState } from 'react';
import {
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  User,
  Calendar,
  Filter
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';

interface AdminApprovalsPageProps {
  onLogout: () => void;
}

export function AdminApprovalsPage({ onLogout }: AdminApprovalsPageProps) {
  const [activeTab, setActiveTab] = useState<'timesheets' | 'documents'>('timesheets');

  // Mock data - would come from API in production
  const pendingTimesheets = [
    {
      id: 1,
      studentName: 'John Smith',
      email: 'john.smith@email.com',
      weekOf: 'Oct 21 - Oct 27, 2024',
      hoursSubmitted: 35.0,
      submittedAt: '2 hours ago',
      placement: 'TechCorp Solutions'
    },
    {
      id: 2,
      studentName: 'Emily Johnson',
      email: 'emily.j@email.com',
      weekOf: 'Oct 21 - Oct 27, 2024',
      hoursSubmitted: 28.5,
      submittedAt: '5 hours ago',
      placement: 'Regional Medical Center'
    },
    {
      id: 3,
      studentName: 'Marcus Williams',
      email: 'm.williams@email.com',
      weekOf: 'Oct 21 - Oct 27, 2024',
      hoursSubmitted: 40.0,
      submittedAt: '1 day ago',
      placement: 'City Chamber of Commerce'
    }
  ];

  const pendingDocuments = [
    {
      id: 1,
      studentName: 'Sarah Chen',
      email: 's.chen@email.com',
      documentType: 'W-4 Form',
      uploadedAt: '3 hours ago',
      fileName: 'w4_sarah_chen.pdf'
    },
    {
      id: 2,
      studentName: 'John Smith',
      email: 'john.smith@email.com',
      documentType: 'Photo ID',
      uploadedAt: '1 day ago',
      fileName: 'id_john_smith.jpg'
    },
    {
      id: 3,
      studentName: 'Alex Rivera',
      email: 'a.rivera@email.com',
      documentType: 'Work Permit',
      uploadedAt: '2 days ago',
      fileName: 'permit_rivera.pdf'
    },
    {
      id: 4,
      studentName: 'Emily Johnson',
      email: 'emily.j@email.com',
      documentType: 'Emergency Contact Form',
      uploadedAt: '2 days ago',
      fileName: 'emergency_emily.pdf'
    }
  ];

  const handleApprove = (id: number, type: 'timesheet' | 'document') => {
    // In production, this would call an API
    console.log(`Approved ${type} ${id}`);
  };

  const handleReject = (id: number, type: 'timesheet' | 'document') => {
    // In production, this would call an API
    console.log(`Rejected ${type} ${id}`);
  };

  return (
    <DashboardLayout
      title="Approvals"
      userType="admin"
      onLogout={onLogout}
    >
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-none">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-amber-100 font-medium mb-1">Pending Timesheets</p>
              <h3 className="text-3xl font-bold">{pendingTimesheets.length}</h3>
            </div>
            <div className="p-2 bg-white/20 rounded-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-amber-100 text-sm mt-2">Awaiting your review</p>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-purple-100 font-medium mb-1">Pending Documents</p>
              <h3 className="text-3xl font-bold">{pendingDocuments.length}</h3>
            </div>
            <div className="p-2 bg-white/20 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-purple-100 text-sm mt-2">Require verification</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('timesheets')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'timesheets'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          Timesheets ({pendingTimesheets.length})
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'documents'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          Documents ({pendingDocuments.length})
        </button>
      </div>

      {/* Timesheets Tab */}
      {activeTab === 'timesheets' && (
        <div className="space-y-4">
          {pendingTimesheets.length === 0 ? (
            <Card>
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">All caught up!</h3>
                <p className="text-slate-500">No pending timesheets to review.</p>
              </div>
            </Card>
          ) : (
            pendingTimesheets.map((timesheet) => (
              <Card key={timesheet.id}>
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Student Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900">{timesheet.studentName}</h3>
                      <p className="text-sm text-slate-500">{timesheet.email}</p>
                      <p className="text-xs text-slate-400">{timesheet.placement}</p>
                    </div>
                  </div>

                  {/* Timesheet Details */}
                  <div className="flex flex-wrap gap-6 text-sm">
                    <div>
                      <p className="text-slate-500">Week</p>
                      <p className="font-medium text-slate-900">{timesheet.weekOf}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Hours</p>
                      <p className="font-medium text-slate-900">{timesheet.hoursSubmitted} hrs</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Submitted</p>
                      <p className="font-medium text-slate-900">{timesheet.submittedAt}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Eye className="w-4 h-4" />}
                    >
                      View
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<CheckCircle className="w-4 h-4" />}
                      onClick={() => handleApprove(timesheet.id, 'timesheet')}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      leftIcon={<XCircle className="w-4 h-4" />}
                      onClick={() => handleReject(timesheet.id, 'timesheet')}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          {pendingDocuments.length === 0 ? (
            <Card>
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">All caught up!</h3>
                <p className="text-slate-500">No pending documents to review.</p>
              </div>
            </Card>
          ) : (
            pendingDocuments.map((doc) => (
              <Card key={doc.id}>
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Student Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900">{doc.studentName}</h3>
                      <p className="text-sm text-slate-500">{doc.email}</p>
                    </div>
                  </div>

                  {/* Document Details */}
                  <div className="flex flex-wrap gap-6 text-sm">
                    <div>
                      <p className="text-slate-500">Document Type</p>
                      <p className="font-medium text-slate-900">{doc.documentType}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">File</p>
                      <p className="font-medium text-blue-600">{doc.fileName}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Uploaded</p>
                      <p className="font-medium text-slate-900">{doc.uploadedAt}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Eye className="w-4 h-4" />}
                    >
                      View
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<CheckCircle className="w-4 h-4" />}
                      onClick={() => handleApprove(doc.id, 'document')}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      leftIcon={<XCircle className="w-4 h-4" />}
                      onClick={() => handleReject(doc.id, 'document')}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
