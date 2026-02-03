import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Clock,
  FileText,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Loader2,
  Megaphone,
  Plus,
  Edit2,
  Trash2,
  X
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useToast } from '../components/ui/Toast';
import { api, AdminDashboard as AdminDashboardData, Timesheet, Document, Announcement } from '../services/api';

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
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
        api.getPendingDocuments()
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
      const { data, error } = await api.updateAnnouncement(editingAnnouncement.id, announcementForm);
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
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    const { error } = await api.deleteAnnouncement(id);
    if (!error) {
      toast.success('Announcement deleted');
      await fetchAnnouncements();
    } else {
      toast.error(error || 'Failed to delete announcement');
    }
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
      <DashboardLayout title="Admin Dashboard" userType="admin" onLogout={onLogout}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Admin Dashboard"
      userType="admin"
      onLogout={onLogout}
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 font-medium mb-1">Total Students</p>
              <h3 className="text-3xl font-bold">{dashboardData?.total_students || 0}</h3>
            </div>
            <div className="p-2 bg-white/20 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-blue-100 text-sm mt-2">
            {dashboardData?.active_students || 0} currently active
          </p>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-none">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-amber-100 font-medium mb-1">Pending Hours</p>
              <h3 className="text-3xl font-bold">{dashboardData?.total_hours_pending || 0}</h3>
            </div>
            <div className="p-2 bg-white/20 rounded-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-amber-100 text-sm mt-2">
            {dashboardData?.pending_timesheets || 0} timesheets to review
          </p>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-purple-100 font-medium mb-1">Docs to Review</p>
              <h3 className="text-3xl font-bold">{dashboardData?.pending_documents || 0}</h3>
            </div>
            <div className="p-2 bg-white/20 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-purple-100 text-sm mt-2">Awaiting verification</p>
        </Card>

        <Card>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 font-medium mb-1">System Status</p>
              <h3 className="text-xl font-bold text-green-600">All Systems Go</h3>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-slate-500 text-sm mt-2">API & Database connected</p>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Submissions */}
        <div className="lg:col-span-2">
          <Card
            title="Pending Timesheets"
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin/approvals')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                View All
              </Button>
            }
          >
            {pendingTimesheets.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-4" />
                <p className="text-slate-500">No pending timesheets</p>
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingTimesheets.map((ts) => (
                      <tr key={ts.id} className="hover:bg-slate-50">
                        <td className="py-3">
                          {new Date(ts.week_start).toLocaleDateString()} - {new Date(ts.week_end).toLocaleDateString()}
                        </td>
                        <td className="py-3 font-medium">{ts.total_hours} hrs</td>
                        <td className="py-3 text-slate-500">
                          {ts.submitted_at ? new Date(ts.submitted_at).toLocaleDateString() : '-'}
                        </td>
                        <td className="py-3">
                          <StatusBadge status="warning">Pending</StatusBadge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card title="Pending Approvals">
            <div className="space-y-4">
              <button
                onClick={() => navigate('/admin/approvals')}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-100 hover:bg-amber-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <span className="font-medium text-slate-900">Timesheets</span>
                </div>
                <span className="px-2 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
                  {dashboardData?.pending_timesheets || 0}
                </span>
              </button>

              <button
                onClick={() => navigate('/admin/approvals')}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-purple-50 border border-purple-100 hover:bg-purple-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-slate-900">Documents</span>
                </div>
                <span className="px-2 py-1 bg-purple-500 text-white text-xs font-bold rounded-full">
                  {dashboardData?.pending_documents || 0}
                </span>
              </button>
            </div>
          </Card>

          <Card title="Quick Links">
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/admin/students')}
              >
                <Users className="w-4 h-4 mr-2" />
                Manage Students
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/admin/approvals')}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Review Approvals
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Announcements Section */}
      <div className="mt-8">
        <Card
          title="Announcements"
          action={
            <Button
              size="sm"
              onClick={() => handleOpenAnnouncementModal()}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              New Announcement
            </Button>
          }
        >
          {announcements.length === 0 ? (
            <div className="text-center py-8">
              <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No announcements yet</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => handleOpenAnnouncementModal()}
              >
                Create your first announcement
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className={`flex items-start justify-between p-4 rounded-lg border ${
                    ann.is_active
                      ? 'bg-white border-slate-200'
                      : 'bg-slate-50 border-slate-100 opacity-60'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-slate-900">{ann.title}</h4>
                      <StatusBadge
                        status={
                          ann.announcement_type === 'warning'
                            ? 'warning'
                            : ann.announcement_type === 'error'
                            ? 'error'
                            : 'info'
                        }
                      >
                        {ann.announcement_type}
                      </StatusBadge>
                      {!ann.is_active && (
                        <span className="text-xs text-slate-400">(inactive)</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">{ann.message}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Created {new Date(ann.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(ann)}
                    >
                      {ann.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <button
                      onClick={() => handleOpenAnnouncementModal(ann)}
                      className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-blue-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                      className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Announcement Modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">
                {editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}
              </h3>
              <button
                onClick={() => setShowAnnouncementModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <Input
                label="Title"
                value={announcementForm.title}
                onChange={(e) =>
                  setAnnouncementForm({ ...announcementForm, title: e.target.value })
                }
                placeholder="Announcement title"
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Message
                </label>
                <textarea
                  value={announcementForm.message}
                  onChange={(e) =>
                    setAnnouncementForm({ ...announcementForm, message: e.target.value })
                  }
                  placeholder="Announcement message..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Type
                </label>
                <select
                  value={announcementForm.announcement_type}
                  onChange={(e) =>
                    setAnnouncementForm({
                      ...announcementForm,
                      announcement_type: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error/Urgent</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-slate-200">
              <Button variant="outline" onClick={() => setShowAnnouncementModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveAnnouncement}
                disabled={savingAnnouncement}
                leftIcon={
                  savingAnnouncement ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : undefined
                }
              >
                {savingAnnouncement ? 'Saving...' : editingAnnouncement ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
