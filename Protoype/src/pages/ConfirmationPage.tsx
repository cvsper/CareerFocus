import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
export function ConfirmationPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center p-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Timesheet Submitted!
        </h1>
        <p className="text-slate-500 mb-6">
          Your timesheet for the week of Oct 21 - Oct 27 has been successfully
          submitted for approval.
        </p>

        <div className="bg-slate-50 rounded-lg p-4 mb-8 border border-slate-100">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">
            Reference Number
          </p>
          <p className="text-lg font-mono font-bold text-slate-900">
            TS-2024-8392
          </p>
        </div>

        <div className="space-y-3">
          <Button
            className="w-full"
            onClick={() => navigate('/dashboard')}
            leftIcon={<Home className="w-4 h-4" />}>

            Return to Dashboard
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => navigate('/timesheet')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}>

            Back to Timesheets
          </Button>
        </div>
      </Card>
    </div>);

}