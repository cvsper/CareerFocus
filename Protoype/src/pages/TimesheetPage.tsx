import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Calendar, Save, Send } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Annotation } from '../components/ui/Annotation';
interface TimesheetPageProps {
  onLogout: () => void;
}
export function TimesheetPage({ onLogout }: TimesheetPageProps) {
  const navigate = useNavigate();
  const handleSubmit = () => {
    navigate('/confirmation');
  };
  return (
    <DashboardLayout
      title="Weekly Timesheet"
      userType="student"
      onLogout={onLogout}>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Week of Oct 21 - Oct 27, 2024
          </h2>
          <p className="text-slate-500 text-sm">TechCorp Solutions Inc.</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
          <button className="p-2 hover:bg-slate-100 rounded-md text-slate-500">
            <Calendar className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium px-2">Oct 21 - Oct 27</span>
        </div>
      </div>

      <Card className="mb-8 overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 w-40">Date</th>
                <th className="px-4 py-3">Start Time</th>
                <th className="px-4 py-3">End Time</th>
                <th className="px-4 py-3">Break (mins)</th>
                <th className="px-4 py-3 w-24">Total</th>
                <th className="px-4 py-3 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
              {
                day: 'Mon, Oct 21',
                start: '09:00',
                end: '17:00',
                break: '60',
                total: '7.0'
              },
              {
                day: 'Tue, Oct 22',
                start: '09:00',
                end: '17:00',
                break: '60',
                total: '7.0'
              },
              {
                day: 'Wed, Oct 23',
                start: '09:00',
                end: '17:00',
                break: '60',
                total: '7.0'
              },
              {
                day: 'Thu, Oct 24',
                start: '',
                end: '',
                break: '',
                total: '-'
              },
              {
                day: 'Fri, Oct 25',
                start: '',
                end: '',
                break: '',
                total: '-'
              }].
              map((row, i) =>
              <tr key={i} className="group hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {row.day}
                  </td>
                  <td className="px-4 py-3">
                    <input
                    type="time"
                    defaultValue={row.start}
                    className="border border-slate-300 rounded px-2 py-1 w-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />

                  </td>
                  <td className="px-4 py-3">
                    <input
                    type="time"
                    defaultValue={row.end}
                    className="border border-slate-300 rounded px-2 py-1 w-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />

                  </td>
                  <td className="px-4 py-3">
                    <input
                    type="number"
                    defaultValue={row.break}
                    placeholder="0"
                    className="border border-slate-300 rounded px-2 py-1 w-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />

                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900">
                    {row.total}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button className="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-slate-50 border-t border-slate-200 font-bold">
              <tr>
                <td colSpan={4} className="px-4 py-3 text-right text-slate-600">
                  Weekly Total:
                </td>
                <td className="px-4 py-3 text-blue-600">21.0 Hrs</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}>

            Add Weekend Shift
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card title="Notes & Comments">
            <textarea
              className="w-full h-32 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-sm"
              placeholder="Add any notes about your week, learning objectives achieved, or issues encountered...">
            </textarea>
            <div className="mt-4 flex justify-end gap-3">
              <Button variant="outline" leftIcon={<Save className="w-4 h-4" />}>
                Save Draft
              </Button>
              <Button
                onClick={handleSubmit}
                leftIcon={<Send className="w-4 h-4" />}>

                Submit Timesheet
              </Button>
            </div>
          </Card>

          <Annotation>
            Submitting triggers a workflow: Supervisor Approval → Admin Review →
            Payroll Integration. Calculations are handled server-side to prevent
            manipulation.
          </Annotation>

          {/* ADP Payroll Disclaimer */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Payroll and direct deposit information are managed securely through ADP.
              This portal does not collect or store payroll data. After your timesheet is approved,
              payment will be processed through ADP according to the regular pay schedule.
            </p>
          </div>
        </div>

        <div>
          <Card title="Submission History">
            <div className="space-y-3">
              {[
              {
                week: 'Oct 14 - Oct 20',
                hours: '35.0',
                status: 'success'
              },
              {
                week: 'Oct 07 - Oct 13',
                hours: '32.5',
                status: 'success'
              },
              {
                week: 'Sep 30 - Oct 06',
                hours: '35.0',
                status: 'success'
              }].
              map((item, i) =>
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">

                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {item.week}
                    </p>
                    <p className="text-xs text-slate-500">{item.hours} Hours</p>
                  </div>
                  <StatusBadge status={item.status as any}>
                    Approved
                  </StatusBadge>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-4 text-slate-500">

              View All History
            </Button>
          </Card>
        </div>
      </div>
    </DashboardLayout>);

}