import React from 'react';
import {
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Eye,
  CheckCircle } from
'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { StatusBadge } from '../components/ui/StatusBadge';
interface AdminStudentListProps {
  onLogout: () => void;
}
export function AdminStudentList({ onLogout }: AdminStudentListProps) {
  return (
    <DashboardLayout
      title="Student Management"
      userType="admin"
      onLogout={onLogout}>

      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search students by name, email, or ID..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />

            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" leftIcon={<Filter className="w-4 h-4" />}>
              Filter Status
            </Button>
            <Button variant="outline" leftIcon={<Filter className="w-4 h-4" />}>
              Department
            </Button>
            <Button>Add Student</Button>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Onboarding</th>
                <th className="px-6 py-4">Last Active</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
              {
                name: 'John Smith',
                email: 'john.smith@edu.com',
                status: 'active',
                progress: 100,
                lastActive: '2 mins ago'
              },
              {
                name: 'Sarah Connor',
                email: 's.connor@edu.com',
                status: 'active',
                progress: 85,
                lastActive: '1 hour ago'
              },
              {
                name: 'Michael Chen',
                email: 'm.chen@edu.com',
                status: 'pending',
                progress: 40,
                lastActive: '2 days ago'
              },
              {
                name: 'Emily Davis',
                email: 'e.davis@edu.com',
                status: 'warning',
                progress: 10,
                lastActive: '1 week ago'
              },
              {
                name: 'David Wilson',
                email: 'd.wilson@edu.com',
                status: 'active',
                progress: 100,
                lastActive: '5 hours ago'
              },
              {
                name: 'Jessica Lee',
                email: 'j.lee@edu.com',
                status: 'active',
                progress: 95,
                lastActive: 'Yesterday'
              }].
              map((student, i) =>
              <tr
                key={i}
                className="group hover:bg-slate-50 transition-colors">

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                        {student.name.
                      split(' ').
                      map((n) => n[0]).
                      join('')}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {student.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {student.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge
                    status={
                    student.status === 'active' ?
                    'success' :
                    student.status === 'pending' ?
                    'warning' :
                    'error'
                    }>

                      {student.status.charAt(0).toUpperCase() +
                    student.status.slice(1)}
                    </StatusBadge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                        className={`h-full rounded-full ${student.progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                        style={{
                          width: `${student.progress}%`
                        }} />

                      </div>
                      <span className="text-xs text-slate-500">
                        {student.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {student.lastActive}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                      className="p-1 text-slate-400 hover:text-blue-600"
                      title="View Details">

                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                      className="p-1 text-slate-400 hover:text-blue-600"
                      title="Message">

                        <Mail className="w-4 h-4" />
                      </button>
                      <button
                      className="p-1 text-slate-400 hover:text-green-600"
                      title="Approve">

                        <CheckCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100 flex justify-between items-center text-sm text-slate-500">
          <span>Showing 1-6 of 142 students</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </Card>
    </DashboardLayout>);

}