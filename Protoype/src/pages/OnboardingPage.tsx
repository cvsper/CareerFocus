import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Upload,
  FileText,
  ChevronRight,
  ShieldCheck,
  AlertTriangle } from
'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Annotation } from '../components/ui/Annotation';
interface OnboardingPageProps {
  onLogout: () => void;
}
export function OnboardingPage({ onLogout }: OnboardingPageProps) {
  const [activeStep, setActiveStep] = useState(2); // 1-based index
  const steps = [
  {
    id: 1,
    title: 'Personal Info',
    status: 'completed'
  },
  {
    id: 2,
    title: 'Documents',
    status: 'current'
  },
  {
    id: 3,
    title: 'Compliance',
    status: 'pending'
  },
  {
    id: 4,
    title: 'Review',
    status: 'pending'
  }];

  const documents = [
  {
    id: 1,
    name: 'Government ID',
    type: 'Passport / Driver License',
    status: 'approved',
    date: 'Oct 12, 2024'
  },
  {
    id: 2,
    name: 'Right to Work',
    type: 'Visa / Citizenship Proof',
    status: 'pending',
    date: 'Oct 14, 2024'
  },
  {
    id: 3,
    name: 'Emergency Contact Form',
    type: 'PDF Form',
    status: 'missing',
    date: '-'
  },
  {
    id: 4,
    name: 'Direct Deposit Info',
    type: 'Void Cheque',
    status: 'missing',
    date: '-'
  }];

  return (
    <DashboardLayout
      title="Onboarding & Compliance"
      userType="student"
      onLogout={onLogout}>

      {/* Progress Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-10" />
          {steps.map((step) =>
          <div
            key={step.id}
            className="flex flex-col items-center bg-slate-50 px-2">

              <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${step.status === 'completed' ? 'bg-green-500 border-green-500 text-white' : step.status === 'current' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300 text-slate-400'}`}>

                {step.status === 'completed' ?
              <CheckCircle2 className="w-6 h-6" /> :

              <span>{step.id}</span>
              }
              </div>
              <span
              className={`text-xs font-medium mt-2 ${step.status === 'current' ? 'text-blue-600' : 'text-slate-500'}`}>

                {step.title}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card
            title="Required Documents"
            description="Please upload clear copies of the following documents.">

            <div className="space-y-4">
              {documents.map((doc) =>
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">

                  <div className="flex items-center gap-4">
                    <div
                    className={`p-2 rounded-lg ${doc.status === 'approved' ? 'bg-green-100 text-green-600' : doc.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>

                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">{doc.name}</h4>
                      <p className="text-xs text-slate-500">{doc.type}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {doc.status === 'approved' &&
                  <StatusBadge status="success">Approved</StatusBadge>
                  }
                    {doc.status === 'pending' &&
                  <StatusBadge status="warning">Reviewing</StatusBadge>
                  }
                    {doc.status === 'missing' &&
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<Upload className="w-3 h-3" />}>

                        Upload
                      </Button>
                  }
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100 flex gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-blue-900">
                  Secure Document Storage
                </h4>
                <p className="text-xs text-blue-700 mt-1">
                  Your documents are encrypted and stored securely. Only
                  authorized administrators can view your personal information.
                </p>
              </div>
            </div>
          </Card>

          <Card title="E-Signature Required">
            <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-slate-900">
                  Student Code of Conduct
                </h4>
                <StatusBadge status="error">Action Required</StatusBadge>
              </div>
              <p className="text-sm text-slate-500 mb-4">
                Please review and sign the code of conduct agreement for your
                placement.
              </p>
              <Button variant="primary" className="w-full sm:w-auto">
                Review & Sign via DocuSign
              </Button>
            </div>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline">Save Draft</Button>
            <Button rightIcon={<ChevronRight className="w-4 h-4" />}>
              Continue to Compliance
            </Button>
          </div>

          <Annotation>
            Documents are uploaded to private S3 buckets. E-signature flow
            integrates with DocuSign API. Webhooks update the status
            automatically once signed.
          </Annotation>
        </div>

        <div className="space-y-6">
          <Card title="Help & Guidelines">
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5" />
                Files must be PDF, JPG, or PNG
              </li>
              <li className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5" />
                Max file size is 10MB
              </li>
              <li className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5" />
                Ensure text is legible
              </li>
            </ul>
          </Card>

          <Card className="bg-amber-50 border-amber-100">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-amber-900 text-sm">
                  Deadline Approaching
                </h4>
                <p className="text-xs text-amber-700 mt-1">
                  All onboarding documents must be submitted by Oct 25th to
                  ensure your placement start date is not delayed.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>);

}