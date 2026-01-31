import React, { useEffect, useState } from 'react';
import {
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  User,
  Calendar,
  Filter,
  Loader2
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { api, Timesheet, Document } from '../services/api';

interface AdminApprovalsPageProps {
  onLogout: () => void;
}

interface TimesheetWithStudent extends Timesheet {
  student_name?: string;
  student_email?: string;
}

interface DocumentWithStudent extends Document {
  student_name?: string;
  student_email?: string;
}

export function AdminApprovalsPage({ onLogout }: AdminApprovalsPageProps) {
  const [activeTab, setActiveTab] = useState<'timesheets' | 'documents'>('timesheets');
  const [loading, setLoading] = useState(true);
  const [pendingTimesheets, setPendingTimesheets] = useState<TimesheetWithStudent[]>([]);
  const [pendingDocuments, setPendingDocuments] = useState<DocumentWithStudent[]>([]);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [rejectModal, setRejectModal] = useState<{ id: number; type: 'timesheet' | 'document' } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);

    const [tsRes, docRes] = await Promise.all([
      api.getPendingTimesheets(),
      api.getPendingDocuments()
    ]);

    if (tsRes.data) {
      setPendingTimesheets(tsRes.data);
    }

    if (docRes.data) {
      setPendingDocuments(docRes.data);
    }

    setLoading(false);
  }

  const handleApprove = async (id: number, type: 'timesheet' | 'document') => {
    setProcessingId(id);

    if (type === 'timesheet') {
      const { data, error } = await api.reviewTimesheet(id, true);
      if (data) {
        setPendingTimesheets(prev => prev.filter(ts => ts.id !== id));
      }
    } else {
      const { data, error } = await api.reviewDocument(id, true);
      if (data) {
        setPendingDocuments(prev => prev.filter(doc => doc.id !== id));
      }
    }

    setProcessingId(null);
  };

  const openRejectModal = (id: number, type: 'timesheet' | 'document') => {
    setRejectModal({ id, type });
    setRejectionReason('');
  };

  const handleReject = async () => {
    if (!rejectModal) return;

    setProcessingId(rejectModal.id);

    if (rejectModal.type === 'timesheet') {
      const { data, error } = await api.reviewTimesheet(rejectModal.id, false, rejectionReason);
      if (data) {
        setPendingTimesheets(prev => prev.filter(ts => ts.id !== rejectModal.id));
      }
    } else {
      const { data, error } = await api.reviewDocument(rejectModal.id, false, rejectionReason);
      if (data) {
        setPendingDocuments(prev => prev.filter(doc => doc.id !== rejectModal.id));
      }
    }

    setProcessingId(null);
    setRejectModal(null);
    setRejectionReason('');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <DashboardLayout title="Approvals" userType="admin" onLogout={onLogout}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

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
                      <h3 className="font-semibold text-slate-900">
                        {timesheet.student_name || `Student #${timesheet.student_id}`}
                      </h3>
                      {timesheet.student_email && (
                        <p className="text-sm text-slate-500">{timesheet.student_email}</p>
                      )}
                    </div>
                  </div>

                  {/* Timesheet Details */}
                  <div className="flex flex-wrap gap-6 text-sm">
                    <div>
                      <p className="text-slate-500">Week</p>
                      <p className="font-medium text-slate-900">
                        {formatDate(timesheet.week_start)} - {formatDate(timesheet.week_end)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Hours</p>
                      <p className="font-medium text-slate-900">{timesheet.total_hours} hrs</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Submitted</p>
                      <p className="font-medium text-slate-900">
                        {timesheet.submitted_at ? formatTimeAgo(timesheet.submitted_at) : 'Unknown'}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={processingId === timesheet.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      onClick={() => handleApprove(timesheet.id, 'timesheet')}
                      disabled={processingId === timesheet.id}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      leftIcon={<XCircle className="w-4 h-4" />}
                      onClick={() => openRejectModal(timesheet.id, 'timesheet')}
                      disabled={processingId === timesheet.id}
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
                      <h3 className="font-semibold text-slate-900">
                        {doc.student_name || `Student #${doc.student_id}`}
                      </h3>
                      {doc.student_email && (
                        <p className="text-sm text-slate-500">{doc.student_email}</p>
                      )}
                    </div>
                  </div>

                  {/* Document Details */}
                  <div className="flex flex-wrap gap-6 text-sm">
                    <div>
                      <p className="text-slate-500">Document Type</p>
                      <p className="font-medium text-slate-900">{doc.document_type}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">File</p>
                      <p className="font-medium text-blue-600">{doc.file_name}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Uploaded</p>
                      <p className="font-medium text-slate-900">{formatTimeAgo(doc.uploaded_at)}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {doc.file_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Eye className="w-4 h-4" />}
                        onClick={() => window.open(doc.file_url, '_blank')}
                      >
                        View
                      </Button>
                    )}
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={processingId === doc.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      onClick={() => handleApprove(doc.id, 'document')}
                      disabled={processingId === doc.id}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      leftIcon={<XCircle className="w-4 h-4" />}
                      onClick={() => openRejectModal(doc.id, 'document')}
                      disabled={processingId === doc.id}
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

      {/* Rejection Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Reject {rejectModal.type === 'timesheet' ? 'Timesheet' : 'Document'}
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Please provide a reason for rejection (optional):
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full h-24 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-sm mb-4"
              placeholder="Enter rejection reason..."
            />
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setRejectModal(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleReject}
                disabled={processingId !== null}
                leftIcon={processingId !== null ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
