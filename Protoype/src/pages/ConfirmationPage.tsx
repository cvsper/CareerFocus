import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ConfirmationState {
  weekStart?: string;
  weekEnd?: string;
  referenceId?: number;
}

export function ConfirmationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as ConfirmationState) || {};

  const formatWeek = () => {
    if (state.weekStart && state.weekEnd) {
      const start = new Date(state.weekStart);
      const end = new Date(state.weekEnd);
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }
    return 'this week';
  };

  const refNumber = state.referenceId
    ? `TS-${new Date().getFullYear()}-${String(state.referenceId).padStart(4, '0')}`
    : `TS-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Radial gradient background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-success/5 rounded-full blur-3xl" />
      </div>

      <Card className="max-w-md w-full glass-card shadow-xl animate-scale-in relative">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow animate-scale-in">
            <CheckCircle className="w-10 h-10 text-success" />
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2 animate-fade-in-up animate-delay-100">
            Timesheet Submitted!
          </h1>
          <p className="text-muted-foreground mb-6 animate-fade-in-up animate-delay-200">
            Your timesheet for the week of {formatWeek()} has been successfully
            submitted for approval.
          </p>

          <div className="bg-muted rounded-lg p-4 mb-8 border border-border animate-fade-in-up animate-delay-300">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Reference Number
            </p>
            <p className="text-lg font-mono font-bold text-foreground">
              {refNumber}
            </p>
          </div>

          <div className="space-y-3 animate-fade-in-up animate-delay-400">
            <Button
              variant="gradient"
              className="w-full"
              onClick={() => navigate('/dashboard')}
            >
              <Home className="w-4 h-4 mr-2" />
              Return to Dashboard
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => navigate('/timesheet')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Timesheets
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
