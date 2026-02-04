import React, { useEffect, useState } from 'react';
import {
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  User,
  Loader2
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/ui/stat-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { api, Timesheet, Document } from '@/services/api';
import { useToast } from '@/components/ui/Toast';

interface TimesheetWithStudent extends Timesheet {
  student_name?: string;
  student_email?: string;
}

interface DocumentWithStudent extends Document {
  student_name?: string;
  student_email?: string;
}

export function AdminApprovalsPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'timesheets' | 'documents'>('timesheets');
  const [loading, setLoading] = useState(true);
  const [pendingTimesheets, setPendingTimesheets] = useState<TimesheetWithStudent[]>([]);
  const [pendingDocuments, setPendingDocuments] = useState<DocumentWithStudent[]>([]);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [rejectModal, setRejectModal] = useState<{ id: number; type: 'timesheet' | 'document' } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approveConfirm, setApproveConfirm] = useState<{ id: number; type: 'timesheet' | 'document' } | null>(null);

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
        toast.success('Timesheet approved successfully');
      } else {
        toast.error(error || 'Failed to approve timesheet');
      }
    } else {
      const { data, error } = await api.reviewDocument(id, true);
      if (data) {
        setPendingDocuments(prev => prev.filter(doc => doc.id !== id));
        toast.success('Document approved successfully');
      } else {
        toast.error(error || 'Failed to approve document');
      }
    }

    setProcessingId(null);
    setApproveConfirm(null);
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
        toast.success('Timesheet rejected');
      } else {
        toast.error(error || 'Failed to reject timesheet');
      }
    } else {
      const { data, error } = await api.reviewDocument(rejectModal.id, false, rejectionReason);
      if (data) {
        setPendingDocuments(prev => prev.filter(doc => doc.id !== rejectModal.id));
        toast.success('Document rejected');
      } else {
        toast.error(error || 'Failed to reject document');
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
      <DashboardLayout title="Approvals">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
          <Skeleton className="h-10 w-64" />
          <div className="space-y-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Approvals">
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-fade-in">
        <StatCard
          title="Pending Timesheets"
          value={pendingTimesheets.length}
          icon={<Clock className="w-6 h-6" />}
          description="Awaiting your review"
        />
        <StatCard
          title="Pending Documents"
          value={pendingDocuments.length}
          icon={<FileText className="w-6 h-6" />}
          description="Require verification"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'timesheets' | 'documents')} className="animate-fade-in animate-delay-100">
        <TabsList className="mb-6">
          <TabsTrigger value="timesheets" className="gap-2">
            <Clock className="w-4 h-4" />
            Timesheets ({pendingTimesheets.length})
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-2">
            <FileText className="w-4 h-4" />
            Documents ({pendingDocuments.length})
          </TabsTrigger>
        </TabsList>

        {/* Timesheets Tab */}
        <TabsContent value="timesheets">
          <div className="space-y-4">
            {pendingTimesheets.length === 0 ? (
              <Card>
                <CardContent className="p-6">
                  <EmptyState
                    icon={<CheckCircle className="w-8 h-8" />}
                    title="All caught up!"
                    description="No pending timesheets to review."
                  />
                </CardContent>
              </Card>
            ) : (
              pendingTimesheets.map((timesheet) => (
                <Card key={timesheet.id} className="hover:border-primary/30 transition-all hover:shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Student Info */}
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center flex-shrink-0 ring-1 ring-primary/10">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-foreground">
                            {timesheet.student_name || `Student #${timesheet.student_id}`}
                          </h3>
                          {timesheet.student_email && (
                            <p className="text-sm text-muted-foreground">{timesheet.student_email}</p>
                          )}
                        </div>
                      </div>

                      {/* Timesheet Details */}
                      <div className="flex flex-wrap gap-6 text-sm">
                        <div>
                          <p className="text-muted-foreground">Week</p>
                          <p className="font-medium text-foreground">
                            {formatDate(timesheet.week_start)} - {formatDate(timesheet.week_end)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Hours</p>
                          <p className="font-medium text-foreground">{timesheet.total_hours} hrs</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Submitted</p>
                          <p className="font-medium text-foreground">
                            {timesheet.submitted_at ? formatTimeAgo(timesheet.submitted_at) : 'Unknown'}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <AlertDialog
                          open={approveConfirm?.id === timesheet.id && approveConfirm?.type === 'timesheet'}
                          onOpenChange={(open) => !open && setApproveConfirm(null)}
                        >
                          <Button
                            variant="gradient"
                            size="sm"
                            onClick={() => setApproveConfirm({ id: timesheet.id, type: 'timesheet' })}
                            disabled={processingId === timesheet.id}
                          >
                            {processingId === timesheet.id ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4 mr-2" />
                            )}
                            Approve
                          </Button>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Approve Timesheet</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to approve this timesheet from{' '}
                                {timesheet.student_name || `Student #${timesheet.student_id}`} for{' '}
                                {timesheet.total_hours} hours?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleApprove(timesheet.id, 'timesheet')}>
                                Approve
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openRejectModal(timesheet.id, 'timesheet')}
                          disabled={processingId === timesheet.id}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <div className="space-y-4">
            {pendingDocuments.length === 0 ? (
              <Card>
                <CardContent className="p-6">
                  <EmptyState
                    icon={<CheckCircle className="w-8 h-8" />}
                    title="All caught up!"
                    description="No pending documents to review."
                  />
                </CardContent>
              </Card>
            ) : (
              pendingDocuments.map((doc) => (
                <Card key={doc.id} className="hover:border-primary/30 transition-all hover:shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Student Info */}
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center flex-shrink-0 ring-1 ring-primary/10">
                          <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-foreground">
                            {doc.student_name || `Student #${doc.student_id}`}
                          </h3>
                          {doc.student_email && (
                            <p className="text-sm text-muted-foreground">{doc.student_email}</p>
                          )}
                        </div>
                      </div>

                      {/* Document Details */}
                      <div className="flex flex-wrap gap-6 text-sm">
                        <div>
                          <p className="text-muted-foreground">Document Type</p>
                          <p className="font-medium text-foreground">{doc.document_type}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">File</p>
                          <p className="font-medium text-primary">{doc.file_name}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Uploaded</p>
                          <p className="font-medium text-foreground">{formatTimeAgo(doc.uploaded_at)}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {doc.file_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(doc.file_url, '_blank')}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        )}

                        <AlertDialog
                          open={approveConfirm?.id === doc.id && approveConfirm?.type === 'document'}
                          onOpenChange={(open) => !open && setApproveConfirm(null)}
                        >
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => setApproveConfirm({ id: doc.id, type: 'document' })}
                            disabled={processingId === doc.id}
                          >
                            {processingId === doc.id ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4 mr-2" />
                            )}
                            Approve
                          </Button>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Approve Document</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to approve this {doc.document_type} from{' '}
                                {doc.student_name || `Student #${doc.student_id}`}?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleApprove(doc.id, 'document')}>
                                Approve
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openRejectModal(doc.id, 'document')}
                          disabled={processingId === doc.id}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Rejection Dialog */}
      <Dialog open={rejectModal !== null} onOpenChange={(open) => !open && setRejectModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Reject {rejectModal?.type === 'timesheet' ? 'Timesheet' : 'Document'}
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for rejection (optional):
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="rejection-reason">Reason</Label>
            <Textarea
              id="rejection-reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="resize-none"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectModal(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processingId !== null}
              isLoading={processingId !== null}
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
