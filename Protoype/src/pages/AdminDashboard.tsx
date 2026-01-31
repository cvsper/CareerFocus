import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Clock,
  FileText,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { api, AdminDashboard as AdminDashboardData, Timesheet, Document } from '../services/api';

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [pendingTimesheets, setPendingTimesheets] = useState<Timesheet[]>([]);
  const [pendingDocuments, setPendingDocuments] = useState<Document[]>([]);

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

      setLoading(false);
    }
    fetchData();
  }, []);

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
    </DashboardLayout>
  );
}
