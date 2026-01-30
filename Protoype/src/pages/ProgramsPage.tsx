import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  Clock,
  Calendar,
  MapPin,
  Building2,
  Users,
  ArrowRight,
  FileText
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';

interface ProgramsPageProps {
  onLogout: () => void;
}

export function ProgramsPage({ onLogout }: ProgramsPageProps) {
  const navigate = useNavigate();

  // Mock data - would come from API in production
  const currentProgram = {
    id: 1,
    name: 'Summer Internship Program 2024',
    organization: 'TechCorp Solutions Inc.',
    status: 'Active',
    startDate: 'June 3, 2024',
    endDate: 'August 23, 2024',
    hoursCompleted: 124.5,
    totalHours: 320,
    location: 'Downtown Campus - Building A',
    supervisor: 'Sarah Johnson',
    description: 'Gain hands-on experience in software development while working on real projects with a dedicated team of mentors.',
    milestones: [
      { name: 'Orientation Complete', status: 'completed', date: 'June 3, 2024' },
      { name: 'First Month Review', status: 'completed', date: 'July 3, 2024' },
      { name: 'Mid-Program Evaluation', status: 'in_progress', date: 'July 15, 2024' },
      { name: 'Final Presentation', status: 'pending', date: 'August 20, 2024' },
    ]
  };

  const availablePrograms = [
    {
      id: 2,
      name: 'Fall Healthcare Pathway',
      organization: 'Regional Medical Center',
      startDate: 'September 9, 2024',
      duration: '12 weeks',
      spots: 15,
      spotsRemaining: 8,
      deadline: 'August 15, 2024',
      description: 'Explore careers in healthcare through job shadowing and hands-on training.'
    },
    {
      id: 3,
      name: 'Business Administration Internship',
      organization: 'City Chamber of Commerce',
      startDate: 'October 1, 2024',
      duration: '10 weeks',
      spots: 10,
      spotsRemaining: 6,
      deadline: 'September 1, 2024',
      description: 'Learn business fundamentals while supporting local economic development initiatives.'
    }
  ];

  const pastPrograms = [
    {
      id: 4,
      name: 'Spring Job Readiness Workshop',
      organization: 'Career Focus',
      completedDate: 'May 15, 2024',
      hoursCompleted: 40,
      status: 'Completed'
    }
  ];

  const progressPercentage = Math.round((currentProgram.hoursCompleted / currentProgram.totalHours) * 100);

  return (
    <DashboardLayout
      title="Programs"
      userType="student"
      onLogout={onLogout}
    >
      {/* Current Program */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Current Program</h2>
        <Card>
          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            {/* Program Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{currentProgram.name}</h3>
                  <p className="text-slate-600 mt-1">{currentProgram.organization}</p>
                </div>
                <StatusBadge status="success">{currentProgram.status}</StatusBadge>
              </div>

              <p className="text-sm text-slate-500 mt-4">{currentProgram.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Start Date</p>
                    <p className="text-sm font-medium text-slate-900">{currentProgram.startDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">End Date</p>
                    <p className="text-sm font-medium text-slate-900">{currentProgram.endDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Location</p>
                    <p className="text-sm font-medium text-slate-900">{currentProgram.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Supervisor</p>
                    <p className="text-sm font-medium text-slate-900">{currentProgram.supervisor}</p>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700">Hours Progress</span>
                  <span className="text-sm font-bold text-blue-600">{currentProgram.hoursCompleted} / {currentProgram.totalHours} hrs</span>
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

            {/* Milestones */}
            <div className="lg:w-72 lg:border-l lg:pl-6 lg:border-slate-200">
              <h4 className="font-semibold text-slate-900 mb-4">Program Milestones</h4>
              <div className="space-y-4">
                {currentProgram.milestones.map((milestone, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      milestone.status === 'completed'
                        ? 'bg-green-100'
                        : milestone.status === 'in_progress'
                          ? 'bg-blue-100'
                          : 'bg-slate-100'
                    }`}>
                      {milestone.status === 'completed' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : milestone.status === 'in_progress' ? (
                        <Clock className="w-4 h-4 text-blue-600" />
                      ) : (
                        <div className="w-2 h-2 bg-slate-300 rounded-full" />
                      )}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${
                        milestone.status === 'completed'
                          ? 'text-slate-900'
                          : milestone.status === 'in_progress'
                            ? 'text-blue-600'
                            : 'text-slate-500'
                      }`}>
                        {milestone.name}
                      </p>
                      <p className="text-xs text-slate-400">{milestone.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Available Programs */}
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

              <p className="text-sm text-slate-600 mb-4">{program.description}</p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <p className="text-xs text-slate-500">Start Date</p>
                  <p className="text-sm font-medium text-slate-900">{program.startDate}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Duration</p>
                  <p className="text-sm font-medium text-slate-900">{program.duration}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Spots Available</p>
                  <p className="text-sm font-medium text-slate-900">{program.spotsRemaining} of {program.spots}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Apply By</p>
                  <p className="text-sm font-medium text-amber-600">{program.deadline}</p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Learn More & Apply
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* Past Programs */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Completed Programs</h2>
        <Card>
          <div className="space-y-4">
            {pastPrograms.map((program) => (
              <div
                key={program.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">{program.name}</h4>
                    <p className="text-sm text-slate-500">{program.organization}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">{program.hoursCompleted} hours</p>
                  <p className="text-xs text-slate-500">Completed {program.completedDate}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
