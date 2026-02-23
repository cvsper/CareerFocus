import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Clock,
  FileText,
  ArrowRight,
  CheckCircle,
  Megaphone,
  Plus,
  Edit2,
  Trash2,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/ui/stat-card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/Toast';
import {
  api,
  AdminDashboard as AdminDashboardData,
  Timesheet,
  Document,
  Announcement,
} from '@/services/api';

export function AdminDashboard() {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [pendingTimesheets, setPendingTimesheets] = useState<Timesheet[]>([]);
  const [pendingDocuments, setPendingDocuments] = useState<Document[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    message: '',
    announcement_type: 'info',
  });
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);
  const [deletingAnnouncementId, setDeletingAnnouncementId] = useState<number | null>(null);

  const fetchAnnouncements = async () => {
    const { data } = await api.getAllAnnouncementsAdmin();
    if (data) setAnnouncements(data);
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      const [dashRes, tsRes, docRes] = await Promise.all([
        api.getAdminDashboard(),
        api.getPendingTimesheets(),
        api.getPendingDocuments(),
      ]);

      if (dashRes.data) setDashboardData(dashRes.data);
      if (tsRes.data) setPendingTimesheets(tsRes.data.slice(0, 5));
      if (docRes.data) setPendingDocuments(docRes.data.slice(0, 5));

      await fetchAnnouncements();
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleOpenAnnouncementModal = (announcement?: Announcement) => {
    if (announcement) {
      setEditingAnnouncement(announcement);
      setAnnouncementForm({
        title: announcement.title,
        message: announcement.message,
        announcement_type: announcement.announcement_type,
      });
    } else {
      setEditingAnnouncement(null);
      setAnnouncementForm({ title: '', message: '', announcement_type: 'info' });
    }
    setShowAnnouncementModal(true);
  };

  const handleSaveAnnouncement = async () => {
    if (!announcementForm.title || !announcementForm.message) {
      toast.error('Please fill in all fields');
      return;
    }

    setSavingAnnouncement(true);

    if (editingAnnouncement) {
      const { data, error } = await api.updateAnnouncement(
        editingAnnouncement.id,
        announcementForm
      );
      if (data) {
        toast.success('Announcement updated');
        await fetchAnnouncements();
        setShowAnnouncementModal(false);
      } else {
        toast.error(error || 'Failed to update announcement');
      }
    } else {
      const { data, error } = await api.createAnnouncement(announcementForm);
      if (data) {
        toast.success('Announcement created');
        await fetchAnnouncements();
        setShowAnnouncementModal(false);
      } else {
        toast.error(error || 'Failed to create announcement');
      }
    }

    setSavingAnnouncement(false);
  };

  const handleDeleteAnnouncement = async (id: number) => {
    const { error } = await api.deleteAnnouncement(id);
    if (!error) {
      toast.success('Announcement deleted');
      await fetchAnnouncements();
    } else {
      toast.error(error || 'Failed to delete announcement');
    }
    setDeletingAnnouncementId(null);
  };

  const handleToggleActive = async (announcement: Announcement) => {
    const { data, error } = await api.updateAnnouncement(announcement.id, {
      is_active: !announcement.is_active,
    });
    if (data) {
      toast.success(data.is_active ? 'Announcement activated' : 'Announcement deactivated');
      await fetchAnnouncements();
    } else {
      toast.error(error || 'Failed to update announcement');
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Admin Dashboard">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[120px] rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="h-[300px] rounded-lg" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-[180px] rounded-lg" />
            <Skeleton className="h-[140px] rounded-lg" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Admin Dashboard">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 [&>*:nth-child(1)]:animate-fade-in-up [&>*:nth-child(2)]:animate-fade-in-up [&>*:nth-child(2)]:animate-delay-100 [&>*:nth-child(3)]:animate-fade-in-up [&>*:nth-child(3)]:animate-delay-200 [&>*:nth-child(4)]:animate-fade-in-up [&>*:nth-child(4)]:animate-delay-300">
        <StatCard
          title="Total Users"
          value={dashboardData?.total_users || 0}
          icon={<Users className="h-5 w-5" />}
          description={`${dashboardData?.total_wble || 0} WBLE | ${dashboardData?.total_contractors || 0} Contractors | ${dashboardData?.total_ttw || 0} TTW | ${dashboardData?.total_employees || 0} Employees`}
        />

        <StatCard
          title="Pending Hours"
          value={dashboardData?.total_hours_pending || 0}
          icon={<Clock className="h-5 w-5" />}
          description={`${dashboardData?.pending_timesheets || 0} timesheets to review`}
        />

        <StatCard
          title="Docs to Review"
          value={dashboardData?.pending_documents || 0}
          icon={<FileText className="h-5 w-5" />}
          description="Awaiting verification"
        />

        <StatCard
          title="System Status"
          value="All Systems Go"
          icon={<CheckCircle className="h-5 w-5" />}
          description="API & Database connected"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 animate-fade-in animate-delay-200">
        {/* Pending Timesheets */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base font-semibold">Pending Timesheets</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin/approvals')}
              >
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {pendingTimesheets.length === 0 ? (
                <EmptyState
                  icon={<CheckCircle className="h-6 w-6" />}
                  title="No pending timesheets"
                  description="All timesheets have been reviewed."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-border">
                      <tr className="text-muted-foreground">
                        <th className="text-left py-3 font-medium">Week</th>
                        <th className="text-left py-3 font-medium">Hours</th>
                        <th className="text-left py-3 font-medium hidden sm:table-cell">
                          Submitted
                        </th>
                        <th className="text-left py-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {pendingTimesheets.map((ts) => (
                        <tr key={ts.id} className="hover:bg-muted/50 transition-colors">
                          <td className="py-3 text-foreground">
                            {new Date(ts.week_start).toLocaleDateString()} -{' '}
                            {new Date(ts.week_end).toLocaleDateString()}
                          </td>
                          <td className="py-3 font-medium text-foreground">
                            {ts.total_hours} hrs
                          </td>
                          <td className="py-3 text-muted-foreground hidden sm:table-cell">
                            {ts.submitted_at
                              ? new Date(ts.submitted_at).toLocaleDateString()
                              : '-'}
                          </td>
                          <td className="py-3">
                            <Badge variant="warning">Pending</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pending Approvals */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <button
                onClick={() => navigate('/admin/approvals')}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-warning/10 border border-warning/20 hover:bg-warning/15 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-warning" />
                  <span className="font-medium text-foreground">Timesheets</span>
                </div>
                <Badge variant="warning">{dashboardData?.pending_timesheets || 0}</Badge>
              </button>

              <button
                onClick={() => navigate('/admin/approvals')}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="font-medium text-foreground">Documents</span>
                </div>
                <Badge>{dashboardData?.pending_documents || 0}</Badge>
              </button>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/admin/students')}
              >
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/admin/approvals')}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Review Approvals
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Announcements Section */}
      <div className="mt-8 animate-fade-in animate-delay-300">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-base font-semibold">Announcements</CardTitle>
            <Button size="sm" variant="gradient" onClick={() => handleOpenAnnouncementModal()}>
              <Plus className="mr-2 h-4 w-4" />
              New Announcement
            </Button>
          </CardHeader>
          <CardContent>
            {announcements.length === 0 ? (
              <EmptyState
                icon={<Megaphone className="h-6 w-6" />}
                title="No announcements yet"
                description="Create your first announcement to notify students."
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenAnnouncementModal()}
                  >
                    Create your first announcement
                  </Button>
                }
              />
            ) : (
              <div className="space-y-3">
                {announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className={`flex flex-col sm:flex-row sm:items-start justify-between gap-3 p-4 rounded-lg border ${
                      ann.is_active
                        ? 'bg-card border-border border-l-2 border-l-primary'
                        : 'bg-muted/50 border-border opacity-60 border-l-2 border-l-muted-foreground'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="font-medium text-foreground">{ann.title}</h4>
                        <Badge
                          variant={
                            ann.announcement_type === 'warning'
                              ? 'warning'
                              : ann.announcement_type === 'error'
                              ? 'destructive'
                              : 'info'
                          }
                        >
                          {ann.announcement_type}
                        </Badge>
                        {!ann.is_active && (
                          <span className="text-xs text-muted-foreground">(inactive)</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{ann.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Created {new Date(ann.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(ann)}
                      >
                        {ann.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenAnnouncementModal(ann)}
                      >
                        <Edit2 className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeletingAnnouncementId(ann.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Announcement Create/Edit Dialog */}
      <Dialog open={showAnnouncementModal} onOpenChange={setShowAnnouncementModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}
            </DialogTitle>
            <DialogDescription>
              {editingAnnouncement
                ? 'Update the announcement details below.'
                : 'Fill in the details to create a new announcement.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="announcement-title">Title</Label>
              <Input
                id="announcement-title"
                value={announcementForm.title}
                onChange={(e) =>
                  setAnnouncementForm({ ...announcementForm, title: e.target.value })
                }
                placeholder="Announcement title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="announcement-message">Message</Label>
              <Textarea
                id="announcement-message"
                value={announcementForm.message}
                onChange={(e) =>
                  setAnnouncementForm({ ...announcementForm, message: e.target.value })
                }
                placeholder="Announcement message..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="announcement-type">Type</Label>
              <Select
                value={announcementForm.announcement_type}
                onValueChange={(value) =>
                  setAnnouncementForm({
                    ...announcementForm,
                    announcement_type: value,
                  })
                }
              >
                <SelectTrigger id="announcement-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error / Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAnnouncementModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveAnnouncement}
              disabled={savingAnnouncement}
              isLoading={savingAnnouncement}
            >
              {savingAnnouncement
                ? 'Saving...'
                : editingAnnouncement
                ? 'Update'
                : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog
        open={deletingAnnouncementId !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingAnnouncementId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this announcement? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deletingAnnouncementId !== null) {
                  handleDeleteAnnouncement(deletingAnnouncementId);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
