import React from 'react';
import {
  Users,
  Clock,
  FileText,
  AlertCircle,
  ArrowRight,
  MoreHorizontal } from
'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Annotation } from '../components/ui/Annotation';
interface AdminDashboardProps {
  onLogout: () => void;
}
export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  return (
    <DashboardLayout
      title="Admin Overview"
      userType="admin"
      onLogout={onLogout}>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Students</p>
            <h3 className="text-2xl font-bold text-slate-900">142</h3>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Pending Hours</p>
            <h3 className="text-2xl font-bold text-slate-900">348</h3>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Docs to Review</p>
            <h3 className="text-2xl font-bold text-slate-900">18</h3>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-lg">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">At Risk</p>
            <h3 className="text-2xl font-bold text-slate-900">3</h3>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card
            title="Recent Submissions"
            action={
            <Button variant="ghost" size="sm">
                View All
              </Button>
            }>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="pb-3 font-medium">Student</th>
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                  {
                    name: 'Alice Johnson',
                    type: 'Timesheet',
                    date: 'Oct 24',
                    status: 'pending'
                  },
                  {
                    name: 'Bob Smith',
                    type: 'Right to Work',
                    date: 'Oct 24',
                    status: 'pending'
                  },
                  {
                    name: 'Charlie Brown',
                    type: 'Timesheet',
                    date: 'Oct 23',
                    status: 'approved'
                  },
                  {
                    name: 'Diana Prince',
                    type: 'Compliance Form',
                    date: 'Oct 23',
                    status: 'error'
                  },
                  {
                    name: 'Evan Wright',
                    type: 'Timesheet',
                    date: 'Oct 22',
                    status: 'approved'
                  }].
                  map((row, i) =>
                  <tr
                    key={i}
                    className="group hover:bg-slate-50 transition-colors">

                      <td className="py-3 font-medium text-slate-900">
                        {row.name}
                      </td>
                      <td className="py-3 text-slate-600">{row.type}</td>
                      <td className="py-3 text-slate-500">{row.date}</td>
                      <td className="py-3">
                        <StatusBadge
                        status={
                        row.status === 'pending' ?
                        'warning' :
                        row.status === 'approved' ?
                        'success' :
                        'error'
                        }>

                          {row.status.charAt(0).toUpperCase() +
                        row.status.slice(1)}
                        </StatusBadge>
                      </td>
                      <td className="py-3 text-right">
                        <Button size="sm" variant="outline" className="h-8">
                          Review
                        </Button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <Annotation>
            Real-time updates are pushed via WebSocket. Admin actions
            (Approve/Reject) trigger email notifications to students via
            SendGrid.
          </Annotation>
        </div>

        <div className="space-y-6">
          <Card title="Pending Approvals">
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-slate-900">
                    Weekly Timesheets
                  </h4>
                  <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    12 New
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Batch approval available for standard hours.
                </p>
                <Button size="sm" className="w-full">
                  Process Queue
                </Button>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-slate-900">
                    Document Review
                  </h4>
                  <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                    5 New
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Requires manual verification of IDs.
                </p>
                <Button size="sm" variant="outline" className="w-full">
                  Review Docs
                </Button>
              </div>
            </div>
          </Card>

          <Card title="System Status">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Database
                </span>
                <span className="text-green-600 font-medium">Operational</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  S3 Storage
                </span>
                <span className="text-green-600 font-medium">Operational</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  DocuSign API
                </span>
                <span className="text-green-600 font-medium">Operational</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>);

}