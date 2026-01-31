import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  Clock,
  Calendar,
  MapPin,
  Building2,
  Users,
  ArrowRight,
  FileText,
  Loader2
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { api, Enrollment, Program } from '../services/api';

interface ProgramsPageProps {
  onLogout: () => void;
}

export function ProgramsPage({ onLogout }: ProgramsPageProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<number | null>(null);
  const [currentEnrollment, setCurrentEnrollment] = useState<Enrollment | null>(null);
  const [pastEnrollments, setPastEnrollments] = useState<Enrollment[]>([]);
  const [availablePrograms, setAvailablePrograms] = useState<Program[]>([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      const [enrollmentsRes, availableRes] = await Promise.all([
        api.getMyEnrollments(),
        api.getAvailablePrograms()
      ]);

      if (enrollmentsRes.data) {
        const active = enrollmentsRes.data.find(e => e.status === 'active');
        const completed = enrollmentsRes.data.filter(e => e.status === 'completed');
        setCurrentEnrollment(active || null);
        setPastEnrollments(completed);
      }

      if (availableRes.data) {
        setAvailablePrograms(availableRes.data);
      }

      setLoading(false);
    }

    fetchData();
  }, []);

  const handleEnroll = async (programId: number) => {
    setEnrolling(programId);
    const { data, error } = await api.enrollInProgram(programId);
    if (data) {
      setCurrentEnrollment(data);
      setAvailablePrograms(prev => prev.filter(p => p.id !== programId));
    }
    setEnrolling(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'info';
      case 'withdrawn': return 'error';
      default: return 'warning';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatShortDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <DashboardLayout title="Programs" userType="student" onLogout={onLogout}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  const progressPercentage = currentEnrollment
    ? Math.round((currentEnrollment.hours_completed / currentEnrollment.program.total_hours) * 100)
    : 0;

  return (
    <DashboardLayout
      title="Programs"
      userType="student"
      onLogout={onLogout}
    >
      {/* Current Program */}
      {currentEnrollment ? (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Current Program</h2>
          <Card>
            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
              {/* Program Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{currentEnrollment.program.name}</h3>
                    <p className="text-slate-600 mt-1">{currentEnrollment.program.organization}</p>
                  </div>
                  <StatusBadge status={getStatusColor(currentEnrollment.status) as any}>
                    {currentEnrollment.status.charAt(0).toUpperCase() + currentEnrollment.status.slice(1)}
                  </StatusBadge>
                </div>

                {currentEnrollment.program.description && (
                  <p className="text-sm text-slate-500 mt-4">{currentEnrollment.program.description}</p>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Start Date</p>
                      <p className="text-sm font-medium text-slate-900">
                        {formatDate(currentEnrollment.program.start_date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">End Date</p>
                      <p className="text-sm font-medium text-slate-900">
                        {formatDate(currentEnrollment.program.end_date)}
                      </p>
                    </div>
                  </div>
                  {currentEnrollment.program.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500">Location</p>
                        <p className="text-sm font-medium text-slate-900">{currentEnrollment.program.location}</p>
                      </div>
                    </div>
                  )}
                  {currentEnrollment.supervisor_name && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500">Supervisor</p>
                        <p className="text-sm font-medium text-slate-900">{currentEnrollment.supervisor_name}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Progress */}
                <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700">Hours Progress</span>
                    <span className="text-sm font-bold text-blue-600">
                      {currentEnrollment.hours_completed} / {currentEnrollment.program.total_hours} hrs
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">{progressPercentage}% complete</p>
                </div>
              </div>

              {/* Enrolled Info */}
              <div className="lg:w-72 lg:border-l lg:pl-6 lg:border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-4">Enrollment Details</h4>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-green-100">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Enrolled</p>
                      <p className="text-xs text-slate-400">{formatShortDate(currentEnrollment.enrolled_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-100">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-600">In Progress</p>
                      <p className="text-xs text-slate-400">
                        {currentEnrollment.program.total_hours - currentEnrollment.hours_completed} hours remaining
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <div className="mb-8">
          <Card className="bg-slate-50 border-dashed">
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Active Program</h3>
              <p className="text-sm text-slate-500">Enroll in a program below to get started!</p>
            </div>
          </Card>
        </div>
      )}

      {/* Available Programs */}
      {availablePrograms.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Available Programs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {availablePrograms.map((program) => (
              <Card key={program.id}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">{program.name}</h3>
                    <p className="text-sm text-slate-500">{program.organization}</p>
                  </div>
                  <StatusBadge status="info">Open</StatusBadge>
                </div>

                {program.description && (
                  <p className="text-sm text-slate-600 mb-4">{program.description}</p>
                )}

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <p className="text-xs text-slate-500">Start Date</p>
                    <p className="text-sm font-medium text-slate-900">{formatShortDate(program.start_date)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">End Date</p>
                    <p className="text-sm font-medium text-slate-900">{formatShortDate(program.end_date)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Total Hours</p>
                    <p className="text-sm font-medium text-slate-900">{program.total_hours} hours</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Spots Available</p>
                    <p className="text-sm font-medium text-slate-900">{program.spots_available}</p>
                  </div>
                  {program.application_deadline && (
                    <div className="col-span-2">
                      <p className="text-xs text-slate-500">Apply By</p>
                      <p className="text-sm font-medium text-amber-600">{formatShortDate(program.application_deadline)}</p>
                    </div>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleEnroll(program.id)}
                  disabled={enrolling === program.id || !!currentEnrollment}
                  leftIcon={enrolling === program.id ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
                  rightIcon={enrolling !== program.id ? <ArrowRight className="w-4 h-4" /> : undefined}
                >
                  {enrolling === program.id ? 'Enrolling...' : currentEnrollment ? 'Complete Current Program First' : 'Enroll Now'}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Past Programs */}
      {pastEnrollments.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Completed Programs</h2>
          <Card>
            <div className="space-y-4">
              {pastEnrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">{enrollment.program.name}</h4>
                      <p className="text-sm text-slate-500">{enrollment.program.organization}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900">{enrollment.hours_completed} hours</p>
                    {enrollment.completed_at && (
                      <p className="text-xs text-slate-500">Completed {formatShortDate(enrollment.completed_at)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Empty state if no programs at all */}
      {!currentEnrollment && pastEnrollments.length === 0 && availablePrograms.length === 0 && (
        <Card className="bg-slate-50 border-dashed">
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Programs Available</h3>
            <p className="text-sm text-slate-500">Check back later for new program opportunities.</p>
          </div>
        </Card>
      )}
    </DashboardLayout>
  );
}
