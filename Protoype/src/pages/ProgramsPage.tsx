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
  Loader2
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { api, Enrollment, Program } from '@/services/api';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

export function ProgramsPage() {
  const navigate = useNavigate();
  const toast = useToast();
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
      toast.success('Successfully enrolled in program!');
    } else {
      toast.error(error || 'Failed to enroll in program');
    }
    setEnrolling(null);
  };

  const getStatusVariant = (status: string): 'success' | 'info' | 'destructive' | 'warning' => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'info';
      case 'withdrawn': return 'destructive';
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
      <DashboardLayout title="Programs">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-56 w-full rounded-lg" />
            <Skeleton className="h-56 w-full rounded-lg" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const progressPercentage = currentEnrollment
    ? Math.round((currentEnrollment.hours_completed / currentEnrollment.program.total_hours) * 100)
    : 0;

  return (
    <DashboardLayout title="Programs">
      {/* Current Program */}
      {currentEnrollment ? (
        <div className="mb-8 animate-fade-in">
          <h2 className="text-lg font-semibold text-foreground mb-4">Current Program</h2>
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                {/* Program Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-foreground">{currentEnrollment.program.name}</h3>
                      <p className="text-muted-foreground mt-1">{currentEnrollment.program.organization}</p>
                    </div>
                    <Badge variant={getStatusVariant(currentEnrollment.status)}>
                      {currentEnrollment.status.charAt(0).toUpperCase() + currentEnrollment.status.slice(1)}
                    </Badge>
                  </div>

                  {currentEnrollment.program.description && (
                    <p className="text-sm text-muted-foreground mt-4">{currentEnrollment.program.description}</p>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Start Date</p>
                        <p className="text-sm font-medium text-foreground">
                          {formatDate(currentEnrollment.program.start_date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">End Date</p>
                        <p className="text-sm font-medium text-foreground">
                          {formatDate(currentEnrollment.program.end_date)}
                        </p>
                      </div>
                    </div>
                    {currentEnrollment.program.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Location</p>
                          <p className="text-sm font-medium text-foreground">{currentEnrollment.program.location}</p>
                        </div>
                      </div>
                    )}
                    {currentEnrollment.supervisor_name && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Supervisor</p>
                          <p className="text-sm font-medium text-foreground">{currentEnrollment.supervisor_name}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Progress */}
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-foreground">Hours Progress</span>
                      <span className="text-sm font-bold text-gradient">
                        {currentEnrollment.hours_completed} / {currentEnrollment.program.total_hours} hrs
                      </span>
                    </div>
                    <Progress value={progressPercentage} className="h-3" />
                    <p className="text-xs text-muted-foreground mt-2">{progressPercentage}% complete</p>
                  </div>
                </div>

                {/* Enrolled Info */}
                <div className="lg:w-72 lg:border-l lg:pl-6 lg:border-border">
                  <h4 className="font-semibold text-foreground mb-4">Enrollment Details</h4>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-success/10">
                        <CheckCircle className="w-4 h-4 text-success" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Enrolled</p>
                        <p className="text-xs text-muted-foreground">{formatShortDate(currentEnrollment.enrolled_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-primary/10">
                        <Clock className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-primary">In Progress</p>
                        <p className="text-xs text-muted-foreground">
                          {currentEnrollment.program.total_hours - currentEnrollment.hours_completed} hours remaining
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="mb-8 animate-fade-in">
          <Card className="border-dashed">
            <CardContent className="p-6">
              <EmptyState
                icon={<Building2 className="w-8 h-8" />}
                title="No Active Program"
                description="Enroll in a program below to get started!"
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Available Programs */}
      {availablePrograms.length > 0 && (
        <div className="mb-8 animate-fade-in animate-delay-100">
          <h2 className="text-lg font-semibold text-foreground mb-4">Available Programs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {availablePrograms.map((program, index) => (
              <Card key={program.id} className={cn("hover-lift animate-fade-in-up", index === 0 && "animate-delay-100", index === 1 && "animate-delay-200", index === 2 && "animate-delay-300", index >= 3 && "animate-delay-400")}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{program.name}</h3>
                      <p className="text-sm text-muted-foreground">{program.organization}</p>
                    </div>
                    <Badge variant="info">Open</Badge>
                  </div>

                  {program.description && (
                    <p className="text-sm text-muted-foreground mb-4">{program.description}</p>
                  )}

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Start Date</p>
                      <p className="text-sm font-medium text-foreground">{formatShortDate(program.start_date)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">End Date</p>
                      <p className="text-sm font-medium text-foreground">{formatShortDate(program.end_date)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Hours</p>
                      <p className="text-sm font-medium text-foreground">{program.total_hours} hours</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Spots Available</p>
                      <p className="text-sm font-medium text-foreground">{program.spots_available}</p>
                    </div>
                    {program.application_deadline && (
                      <div className="col-span-2">
                        <p className="text-xs text-muted-foreground">Apply By</p>
                        <p className="text-sm font-medium text-warning">{formatShortDate(program.application_deadline)}</p>
                      </div>
                    )}
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="gradient"
                        size="sm"
                        className="w-full"
                        disabled={enrolling === program.id || !!currentEnrollment}
                      >
                        {enrolling === program.id && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
                        {enrolling === program.id
                          ? 'Enrolling...'
                          : currentEnrollment
                            ? 'Complete Current Program First'
                            : 'Enroll Now'}
                        {enrolling !== program.id && !currentEnrollment && (
                          <ArrowRight className="ml-2 w-4 h-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Enrollment</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to enroll in <strong>{program.name}</strong> by {program.organization}?
                          This program runs from {formatShortDate(program.start_date)} to {formatShortDate(program.end_date)} and
                          requires {program.total_hours} hours to complete.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleEnroll(program.id)}>
                          Confirm Enrollment
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Past Programs */}
      {pastEnrollments.length > 0 && (
        <div className="animate-fade-in animate-delay-200">
          <h2 className="text-lg font-semibold text-foreground mb-4">Completed Programs</h2>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {pastEnrollments.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border hover:border-primary/30 hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-success" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{enrollment.program.name}</h4>
                        <p className="text-sm text-muted-foreground">{enrollment.program.organization}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">{enrollment.hours_completed} hours</p>
                      {enrollment.completed_at && (
                        <p className="text-xs text-muted-foreground">Completed {formatShortDate(enrollment.completed_at)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty state if no programs at all */}
      {!currentEnrollment && pastEnrollments.length === 0 && availablePrograms.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-6">
            <EmptyState
              icon={<Building2 className="w-10 h-10" />}
              title="No Programs Available"
              description="Check back later for new program opportunities."
            />
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
