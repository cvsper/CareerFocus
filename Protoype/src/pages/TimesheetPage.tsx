import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Trash2,
  Calendar,
  Save,
  Send,
  ChevronLeft,
  ChevronRight,
  Download,
  History,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { SignaturePad, SignaturePadRef } from '@/components/ui/SignaturePad';
import { api, Timesheet, TimesheetEntry } from '@/services/api';
import { useToast } from '@/components/ui/Toast';

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

function getStatusVariant(status: string): 'success' | 'warning' | 'info' | 'destructive' | 'secondary' {
  switch (status) {
    case 'approved': return 'success';
    case 'submitted': return 'info';
    case 'rejected': return 'destructive';
    default: return 'warning';
  }
}

export function TimesheetPage() {
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

  const isEditable = !currentTimesheet || currentTimesheet.status === 'draft';

  // Loading state with skeletons
  if (loading) {
    return (
      <DashboardLayout title="Weekly Timesheet">
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-2">
              <Skeleton className="h-7 w-64" />
              <Skeleton className="h-5 w-40" />
            </div>
            <Skeleton className="h-10 w-56 rounded-lg" />
          </div>
          {/* Table skeleton */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
          {/* Bottom section skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-48 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Weekly Timesheet">
      {/* Week Header & Navigation */}
      <div className="animate-fade-in flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Week of {formatDisplayDate(currentWeek.start)} - {formatDisplayDate(currentWeek.end)}, {currentWeek.start.getFullYear()}
          </h2>
          {currentTimesheet && (
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={getStatusVariant(currentTimesheet.status)}>
                {currentTimesheet.status.charAt(0).toUpperCase() + currentTimesheet.status.slice(1)}
              </Badge>
              {currentTimesheet.submitted_at && (
                <span className="text-sm text-muted-foreground">
                  Submitted {new Date(currentTimesheet.submitted_at).toLocaleDateString()}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 glass p-1 rounded-xl border border-border shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => changeWeek('prev')}
            className="h-8 w-8"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2 px-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {formatDisplayDate(currentWeek.start)} - {formatDisplayDate(currentWeek.end)}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => changeWeek('next')}
            className="h-8 w-8"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Timesheet Table -- desktop */}
      <Card className="mb-8 overflow-visible animate-fade-in animate-delay-100">
        <CardContent className="p-0">
          {/* Desktop table view */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-primary/5 to-transparent hover:bg-muted">
                  <TableHead className="w-36">Date</TableHead>
                  <TableHead>Time In</TableHead>
                  <TableHead>Time Out</TableHead>
                  <TableHead>Time In</TableHead>
                  <TableHead>Time Out</TableHead>
                  <TableHead className="w-20">Total</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry, i) => (
                  <TableRow key={entry.date} className="group">
                    <TableCell className="font-medium text-foreground text-sm">
                      {entry.dayLabel}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="time"
                        value={entry.start_time}
                        onChange={(e) => updateEntry(i, 'start_time', e.target.value)}
                        disabled={!isEditable}
                        className="h-8 text-sm"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="time"
                        value={entry.lunch_out}
                        onChange={(e) => updateEntry(i, 'lunch_out', e.target.value)}
                        disabled={!isEditable}
                        className="h-8 text-sm"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="time"
                        value={entry.lunch_in}
                        onChange={(e) => updateEntry(i, 'lunch_in', e.target.value)}
                        disabled={!isEditable}
                        className="h-8 text-sm"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="time"
                        value={entry.end_time}
                        onChange={(e) => updateEntry(i, 'end_time', e.target.value)}
                        disabled={!isEditable}
                        className="h-8 text-sm"
                      />
                    </TableCell>
                    <TableCell className="font-bold text-foreground">
                      {entry.hours > 0 ? entry.hours.toFixed(1) : '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      {isEditable && entry.hours > 0 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            updateEntry(i, 'start_time', '');
                            updateEntry(i, 'end_time', '');
                            updateEntry(i, 'lunch_out', '');
                            updateEntry(i, 'lunch_in', '');
                            updateEntry(i, 'break_minutes', 0);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={5} className="text-right text-muted-foreground font-bold">
                    Weekly Total:
                  </TableCell>
                  <TableCell className="font-bold"><span className="text-gradient">{totalHours.toFixed(1)} Hrs</span></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>

          {/* Mobile card view */}
          <div className="md:hidden divide-y divide-border">
            {entries.map((entry, i) => (
              <div key={entry.date} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground text-sm">{entry.dayLabel}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">
                      {entry.hours > 0 ? `${entry.hours.toFixed(1)} hrs` : '-'}
                    </span>
                    {isEditable && entry.hours > 0 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          updateEntry(i, 'start_time', '');
                          updateEntry(i, 'end_time', '');
                          updateEntry(i, 'lunch_out', '');
                          updateEntry(i, 'lunch_in', '');
                          updateEntry(i, 'break_minutes', 0);
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Time In</Label>
                    <Input
                      type="time"
                      value={entry.start_time}
                      onChange={(e) => updateEntry(i, 'start_time', e.target.value)}
                      disabled={!isEditable}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Lunch Out</Label>
                    <Input
                      type="time"
                      value={entry.lunch_out}
                      onChange={(e) => updateEntry(i, 'lunch_out', e.target.value)}
                      disabled={!isEditable}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Lunch In</Label>
                    <Input
                      type="time"
                      value={entry.lunch_in}
                      onChange={(e) => updateEntry(i, 'lunch_in', e.target.value)}
                      disabled={!isEditable}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Time Out</Label>
                    <Input
                      type="time"
                      value={entry.end_time}
                      onChange={(e) => updateEntry(i, 'end_time', e.target.value)}
                      disabled={!isEditable}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
            {/* Mobile total */}
            <div className="p-4 bg-muted/50 flex items-center justify-between">
              <span className="text-sm font-bold text-muted-foreground">Weekly Total:</span>
              <span className="text-sm font-bold text-gradient">{totalHours.toFixed(1)} Hrs</span>
            </div>
          </div>
        </CardContent>

        {!showWeekend && isEditable && (
          <CardFooter className="border-t border-border p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowWeekend(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Weekend Shift
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Bottom Section: Notes + Signature + History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in animate-delay-200">
        <div className="lg:col-span-2 space-y-6">
          {/* Notes & Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notes & Comments</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={!isEditable}
                className="w-full h-32 p-3 border border-input rounded-lg bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Add any notes about your week, learning objectives achieved, or issues encountered..."
              />
            </CardContent>
          </Card>

          {/* Signature Section */}
          {isEditable && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Certification & Signature</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  I certify that the hours reported above are accurate and complete to the best of my knowledge.
                </p>
                <SignaturePad
                  ref={signatureRef}
                  label="Your Signature"
                  disabled={!isEditable}
                />
              </CardContent>
              <CardFooter className="justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={handleSave}
                  disabled={saving || submitting}
                  isLoading={saving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Draft'}
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="gradient"
                      disabled={saving || submitting || totalHours === 0}
                      isLoading={submitting}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {submitting ? 'Submitting...' : 'Submit Timesheet'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Submit Timesheet</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to submit this timesheet for approval? Once submitted, you will not be able to make changes unless it is returned to you.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleSubmit}>
                        Submit for Approval
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          )}

          {/* Download for approved/submitted timesheets */}
          {currentTimesheet && currentTimesheet.status !== 'draft' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Download Timesheet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Download the official timesheet document for your records.
                </p>
                {currentTimesheet.signature && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-2">Signed on {currentTimesheet.signature_date}</p>
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
                  isLoading={downloadingPdf}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {downloadingPdf ? 'Generating...' : 'Download Timesheet'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Workflow annotation */}
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground">
              Submitting triggers a workflow: Supervisor Approval &rarr; Admin Review &rarr;
              Payroll Integration. Calculations are handled server-side to prevent
              manipulation.
            </p>
          </div>

          {/* ADP Payroll Disclaimer */}
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-sm text-primary">
              <strong>Note:</strong> Payroll and direct deposit information are managed securely through ADP.
              This portal does not collect or store payroll data. After your timesheet is approved,
              payment will be processed through ADP according to the regular pay schedule.
            </p>
          </div>
        </div>

        {/* Submission History Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Submission History</CardTitle>
            </CardHeader>
            <CardContent>
              {timesheetHistory.length === 0 ? (
                <EmptyState
                  icon={<History className="w-6 h-6" />}
                  title="No Previous Submissions"
                  description="Your submitted timesheets will appear here."
                  className="py-8"
                />
              ) : (
                <ScrollArea className="max-h-80">
                  <div className="space-y-3">
                    {timesheetHistory.map((ts) => (
                      <div
                        key={ts.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border hover:border-primary/30 hover:bg-muted/80 transition-colors"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {new Date(ts.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(ts.week_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                          <p className="text-xs text-muted-foreground">{ts.total_hours} Hours</p>
                        </div>
                        <Badge variant={getStatusVariant(ts.status)}>
                          {ts.status.charAt(0).toUpperCase() + ts.status.slice(1)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
            <CardFooter>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground"
                onClick={() => navigate('/timesheet/history')}
              >
                View All History
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
