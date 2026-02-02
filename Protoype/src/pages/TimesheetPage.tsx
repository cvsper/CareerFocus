import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Calendar, Save, Send, Loader2, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Annotation } from '../components/ui/Annotation';
import { SignaturePad, SignaturePadRef } from '../components/ui/SignaturePad';
import { api, Timesheet, TimesheetEntry } from '../services/api';
import { useToast } from '../components/ui/Toast';

interface TimesheetPageProps {
  onLogout: () => void;
}

interface DayEntry {
  date: string;
  dayLabel: string;
  start_time: string;
  end_time: string;
  lunch_out: string;
  lunch_in: string;
  break_minutes: number;
  hours: number;
}

function getWeekDates(date: Date): { start: Date; end: Date } {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const start = new Date(d.setDate(diff));
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDayLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function calculateHours(start: string, end: string, lunchOut: string, lunchIn: string): number {
  if (!start || !end) return 0;
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  const startMins = startH * 60 + startM;
  const endMins = endH * 60 + endM;

  // Calculate lunch duration if both lunch times provided
  let lunchMins = 0;
  if (lunchOut && lunchIn) {
    const [lunchOutH, lunchOutM] = lunchOut.split(':').map(Number);
    const [lunchInH, lunchInM] = lunchIn.split(':').map(Number);
    lunchMins = (lunchInH * 60 + lunchInM) - (lunchOutH * 60 + lunchOutM);
  }

  const totalMins = endMins - startMins - lunchMins;
  return Math.max(0, totalMins / 60);
}

export function TimesheetPage({ onLogout }: TimesheetPageProps) {
  const navigate = useNavigate();
  const toast = useToast();
  const signatureRef = useRef<SignaturePadRef>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(() => getWeekDates(new Date()));
  const [currentTimesheet, setCurrentTimesheet] = useState<Timesheet | null>(null);
  const [timesheetHistory, setTimesheetHistory] = useState<Timesheet[]>([]);
  const [notes, setNotes] = useState('');
  const [entries, setEntries] = useState<DayEntry[]>([]);
  const [showWeekend, setShowWeekend] = useState(false);

  // Initialize entries for the week
  const initializeEntries = (weekStart: Date, existingEntries?: TimesheetEntry[]) => {
    const newEntries: DayEntry[] = [];
    const numDays = showWeekend ? 7 : 5;

    for (let i = 0; i < numDays; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const dateStr = formatDate(date);

      const existing = existingEntries?.find(e => e.date === dateStr);

      newEntries.push({
        date: dateStr,
        dayLabel: formatDayLabel(date),
        start_time: existing?.start_time || '',
        end_time: existing?.end_time || '',
        lunch_out: existing?.lunch_out || '',
        lunch_in: existing?.lunch_in || '',
        break_minutes: existing?.break_minutes || 0,
        hours: existing?.hours || 0,
      });
    }

    setEntries(newEntries);
  };

  useEffect(() => {
    async function fetchTimesheets() {
      setLoading(true);

      const weekStartStr = formatDate(currentWeek.start);
      const weekEndStr = formatDate(currentWeek.end);

      // Fetch all timesheets
      const { data: allTimesheets } = await api.getTimesheets();

      if (allTimesheets) {
        // Find timesheet for current week
        const current = allTimesheets.find(ts =>
          ts.week_start === weekStartStr || ts.week_end === weekEndStr
        );

        if (current) {
          setCurrentTimesheet(current);
          setNotes(current.notes || '');
          initializeEntries(currentWeek.start, current.entries);
        } else {
          setCurrentTimesheet(null);
          setNotes('');
          initializeEntries(currentWeek.start);
        }

        // Get history (completed timesheets)
        const history = allTimesheets
          .filter(ts => ts.status === 'approved' || ts.status === 'rejected')
          .sort((a, b) => new Date(b.week_start).getTime() - new Date(a.week_start).getTime())
          .slice(0, 5);
        setTimesheetHistory(history);
      } else {
        initializeEntries(currentWeek.start);
      }

      setLoading(false);
    }

    fetchTimesheets();
  }, [currentWeek, showWeekend]);

  const updateEntry = (index: number, field: keyof DayEntry, value: string | number) => {
    setEntries(prev => {
      const updated = [...prev];
      (updated[index] as any)[field] = value;

      // Recalculate hours
      if (field === 'start_time' || field === 'end_time' || field === 'lunch_out' || field === 'lunch_in') {
        updated[index].hours = calculateHours(
          updated[index].start_time,
          updated[index].end_time,
          updated[index].lunch_out,
          updated[index].lunch_in
        );
      }

      return updated;
    });
  };

  const totalHours = entries.reduce((sum, e) => sum + e.hours, 0);

  const handleSave = async () => {
    setSaving(true);

    const timesheetData = {
      week_start: formatDate(currentWeek.start),
      week_end: formatDate(currentWeek.end),
      notes,
      entries: entries.map(e => ({
        date: e.date,
        start_time: e.start_time || undefined,
        end_time: e.end_time || undefined,
        lunch_out: e.lunch_out || undefined,
        lunch_in: e.lunch_in || undefined,
        break_minutes: e.break_minutes,
        hours: e.hours,
      })),
    };

    const { data, error } = await api.createTimesheet(timesheetData);

    if (data) {
      setCurrentTimesheet(data);
      toast.success('Timesheet saved as draft');
    } else if (error) {
      toast.error('Failed to save timesheet');
      console.error('Failed to save timesheet:', error);
    }

    setSaving(false);
  };

  const handleSubmit = async () => {
    // Validate signature is provided
    if (signatureRef.current?.isEmpty()) {
      toast.error('Please sign the timesheet before submitting');
      return;
    }

    setSubmitting(true);

    // Save first if no current timesheet
    if (!currentTimesheet) {
      await handleSave();
    }

    if (currentTimesheet) {
      const signature = signatureRef.current?.getSignature() || undefined;
      const { data, error } = await api.submitTimesheet(currentTimesheet.id, signature);

      if (data) {
        setCurrentTimesheet(data);
        toast.success('Timesheet submitted for approval');
        navigate('/confirmation');
      } else if (error) {
        toast.error('Failed to submit timesheet');
        console.error('Failed to submit timesheet:', error);
      }
    }

    setSubmitting(false);
  };

  const handleDownloadPDF = async () => {
    if (!currentTimesheet) return;

    setDownloadingPdf(true);
    const { data, error } = await api.downloadTimesheetPDF(currentTimesheet.id);

    if (data) {
      // Create download link
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `timesheet_${formatDate(currentWeek.start)}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Timesheet downloaded successfully');
    } else if (error) {
      toast.error('Failed to download PDF');
      console.error('Failed to download PDF:', error);
    }

    setDownloadingPdf(false);
  };

  const changeWeek = (direction: 'prev' | 'next') => {
    const newStart = new Date(currentWeek.start);
    newStart.setDate(newStart.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(getWeekDates(newStart));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'submitted': return 'info';
      case 'rejected': return 'error';
      default: return 'warning';
    }
  };

  const isEditable = !currentTimesheet || currentTimesheet.status === 'draft';

  if (loading) {
    return (
      <DashboardLayout title="Weekly Timesheet" userType="student" onLogout={onLogout}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Weekly Timesheet"
      userType="student"
      onLogout={onLogout}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Week of {formatDisplayDate(currentWeek.start)} - {formatDisplayDate(currentWeek.end)}, {currentWeek.start.getFullYear()}
          </h2>
          {currentTimesheet && (
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={getStatusColor(currentTimesheet.status) as any}>
                {currentTimesheet.status.charAt(0).toUpperCase() + currentTimesheet.status.slice(1)}
              </StatusBadge>
              {currentTimesheet.submitted_at && (
                <span className="text-sm text-slate-500">
                  Submitted {new Date(currentTimesheet.submitted_at).toLocaleDateString()}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
          <button
            onClick={() => changeWeek('prev')}
            className="p-2 hover:bg-slate-100 rounded-md text-slate-500"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 px-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium">
              {formatDisplayDate(currentWeek.start)} - {formatDisplayDate(currentWeek.end)}
            </span>
          </div>
          <button
            onClick={() => changeWeek('next')}
            className="p-2 hover:bg-slate-100 rounded-md text-slate-500"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <Card className="mb-8 overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-3 py-3 w-36">Date</th>
                <th className="px-2 py-3">Time In</th>
                <th className="px-2 py-3">Time Out</th>
                <th className="px-2 py-3">Time In</th>
                <th className="px-2 py-3">Time Out</th>
                <th className="px-3 py-3 w-20">Total</th>
                <th className="px-2 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entries.map((entry, i) => (
                <tr key={entry.date} className="group hover:bg-slate-50">
                  <td className="px-3 py-3 font-medium text-slate-900 text-sm">
                    {entry.dayLabel}
                  </td>
                  <td className="px-2 py-3">
                    <input
                      type="time"
                      value={entry.start_time}
                      onChange={(e) => updateEntry(i, 'start_time', e.target.value)}
                      disabled={!isEditable}
                      className="border border-slate-300 rounded px-1.5 py-1 w-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />
                  </td>
                  <td className="px-2 py-3">
                    <input
                      type="time"
                      value={entry.lunch_out}
                      onChange={(e) => updateEntry(i, 'lunch_out', e.target.value)}
                      disabled={!isEditable}
                      className="border border-slate-300 rounded px-1.5 py-1 w-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />
                  </td>
                  <td className="px-2 py-3">
                    <input
                      type="time"
                      value={entry.lunch_in}
                      onChange={(e) => updateEntry(i, 'lunch_in', e.target.value)}
                      disabled={!isEditable}
                      className="border border-slate-300 rounded px-1.5 py-1 w-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />
                  </td>
                  <td className="px-2 py-3">
                    <input
                      type="time"
                      value={entry.end_time}
                      onChange={(e) => updateEntry(i, 'end_time', e.target.value)}
                      disabled={!isEditable}
                      className="border border-slate-300 rounded px-1.5 py-1 w-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />
                  </td>
                  <td className="px-3 py-3 font-bold text-slate-900">
                    {entry.hours > 0 ? entry.hours.toFixed(1) : '-'}
                  </td>
                  <td className="px-2 py-3 text-center">
                    {isEditable && entry.hours > 0 && (
                      <button
                        onClick={() => {
                          updateEntry(i, 'start_time', '');
                          updateEntry(i, 'end_time', '');
                          updateEntry(i, 'lunch_out', '');
                          updateEntry(i, 'lunch_in', '');
                          updateEntry(i, 'break_minutes', 0);
                        }}
                        className="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 border-t border-slate-200 font-bold">
              <tr>
                <td colSpan={5} className="px-4 py-3 text-right text-slate-600">
                  Weekly Total:
                </td>
                <td className="px-3 py-3 text-blue-600">{totalHours.toFixed(1)} Hrs</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {!showWeekend && isEditable && (
          <div className="p-4 border-t border-slate-100">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowWeekend(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Weekend Shift
            </Button>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card title="Notes & Comments">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={!isEditable}
              className="w-full h-32 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-sm disabled:bg-slate-100 disabled:cursor-not-allowed"
              placeholder="Add any notes about your week, learning objectives achieved, or issues encountered..."
            />
          </Card>

          {/* Signature Section */}
          {isEditable && (
            <Card title="Certification & Signature" className="mt-6">
              <p className="text-sm text-slate-600 mb-4">
                I certify that the hours reported above are accurate and complete to the best of my knowledge.
              </p>
              <SignaturePad
                ref={signatureRef}
                label="Your Signature"
                disabled={!isEditable}
              />
              <div className="mt-6 flex justify-end gap-3">
                <Button
                  variant="outline"
                  leftIcon={saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  onClick={handleSave}
                  disabled={saving || submitting}
                >
                  {saving ? 'Saving...' : 'Save Draft'}
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={saving || submitting || totalHours === 0}
                  leftIcon={submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                >
                  {submitting ? 'Submitting...' : 'Submit Timesheet'}
                </Button>
              </div>
            </Card>
          )}

          {/* Download for approved/submitted timesheets */}
          {currentTimesheet && currentTimesheet.status !== 'draft' && (
            <Card title="Download Timesheet" className="mt-6">
              <p className="text-sm text-slate-600 mb-4">
                Download the official timesheet document for your records.
              </p>
              {currentTimesheet.signature && (
                <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 mb-2">Signed on {currentTimesheet.signature_date}</p>
                  <img
                    src={currentTimesheet.signature}
                    alt="Signature"
                    className="h-12 object-contain"
                  />
                </div>
              )}
              <Button
                variant="outline"
                onClick={handleDownloadPDF}
                disabled={downloadingPdf}
                leftIcon={downloadingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              >
                {downloadingPdf ? 'Generating...' : 'Download Timesheet'}
              </Button>
            </Card>
          )}

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
            {timesheetHistory.length === 0 ? (
              <p className="text-sm text-slate-500">No previous submissions</p>
            ) : (
              <div className="space-y-3">
                {timesheetHistory.map((ts) => (
                  <div
                    key={ts.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {new Date(ts.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(ts.week_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-xs text-slate-500">{ts.total_hours} Hours</p>
                    </div>
                    <StatusBadge status={getStatusColor(ts.status) as any}>
                      {ts.status.charAt(0).toUpperCase() + ts.status.slice(1)}
                    </StatusBadge>
                  </div>
                ))}
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-4 text-slate-500"
              onClick={() => navigate('/timesheet/history')}
            >
              View All History
            </Button>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
