import React, { useEffect, useState, useRef } from 'react';
import {
  CheckCircle2,
  Circle,
  Upload,
  FileText,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  X,
  Eye
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Annotation } from '../components/ui/Annotation';
import { api, Document } from '../services/api';
import { useToast } from '../components/ui/Toast';

interface OnboardingPageProps {
  onLogout: () => void;
}

const REQUIRED_DOCUMENTS = [
  { type: 'government_id', name: 'Government ID', description: 'Passport / Driver License' },
  { type: 'right_to_work', name: 'Right to Work', description: 'Visa / Citizenship Proof' },
  { type: 'emergency_contact', name: 'Emergency Contact Form', description: 'PDF Form' },
  { type: 'w4_form', name: 'W-4 Form', description: 'Tax Withholding Form' },
];

export function OnboardingPage({ onLogout }: OnboardingPageProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedDocType, setSelectedDocType] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
    setLoading(true);
    const { data } = await api.getDocuments();
    if (data) {
      setDocuments(data);
    }
    setLoading(false);
  }

  const getDocumentStatus = (docType: string): Document | undefined => {
    return documents.find(d => d.document_type === docType);
  };

  const handleUploadClick = (docType: string) => {
    setSelectedDocType(docType);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedDocType) return;

    setUploading(selectedDocType);

    // In a real app, you'd upload to S3/cloud storage first
    // For now, we'll create a mock URL and upload the metadata
    const mockFileUrl = `https://storage.example.com/documents/${Date.now()}_${file.name}`;

    const { data, error } = await api.uploadDocument({
      document_type: selectedDocType,
      file_name: file.name,
      file_url: mockFileUrl,
      file_size: file.size,
      mime_type: file.type,
    });

    if (data) {
      setDocuments(prev => [...prev.filter(d => d.document_type !== selectedDocType), data]);
      toast.success('Document uploaded successfully');
    } else {
      toast.error(error || 'Failed to upload document');
    }

    setUploading(null);
    setSelectedDocType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStatusBadge = (doc: Document | undefined) => {
    if (!doc) return null;
    switch (doc.status) {
      case 'approved':
        return <StatusBadge status="success">Approved</StatusBadge>;
      case 'pending':
        return <StatusBadge status="warning">Reviewing</StatusBadge>;
      case 'rejected':
        return <StatusBadge status="error">Rejected</StatusBadge>;
      default:
        return <StatusBadge status="neutral">{doc.status}</StatusBadge>;
    }
  };

  const completedCount = REQUIRED_DOCUMENTS.filter(rd => {
    const doc = getDocumentStatus(rd.type);
    return doc && doc.status === 'approved';
  }).length;

  const pendingCount = REQUIRED_DOCUMENTS.filter(rd => {
    const doc = getDocumentStatus(rd.type);
    return doc && doc.status === 'pending';
  }).length;

  const steps = [
    { id: 1, title: 'Personal Info', status: 'completed' },
    { id: 2, title: 'Documents', status: completedCount === REQUIRED_DOCUMENTS.length ? 'completed' : 'current' },
    { id: 3, title: 'Compliance', status: completedCount === REQUIRED_DOCUMENTS.length ? 'current' : 'pending' },
    { id: 4, title: 'Review', status: 'pending' },
  ];

  if (loading) {
    return (
      <DashboardLayout title="Documents & Onboarding" userType="student" onLogout={onLogout}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Documents & Onboarding"
      userType="student"
      onLogout={onLogout}
    >
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleFileChange}
      />

      {/* Progress Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-10" />
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center bg-slate-50 px-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                  step.status === 'completed'
                    ? 'bg-green-500 border-green-500 text-white'
                    : step.status === 'current'
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-slate-300 text-slate-400'
                }`}
              >
                {step.status === 'completed' ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <span>{step.id}</span>
                )}
              </div>
              <span
                className={`text-xs font-medium mt-2 ${
                  step.status === 'current' ? 'text-blue-600' : 'text-slate-500'
                }`}
              >
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card
            title="Required Documents"
            description="Please upload clear copies of the following documents."
          >
            <div className="space-y-4">
              {REQUIRED_DOCUMENTS.map((reqDoc) => {
                const doc = getDocumentStatus(reqDoc.type);
                const isUploading = uploading === reqDoc.type;

                return (
                  <div
                    key={reqDoc.type}
                    className="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-2 rounded-lg ${
                          doc?.status === 'approved'
                            ? 'bg-green-100 text-green-600'
                            : doc?.status === 'pending'
                            ? 'bg-amber-100 text-amber-600'
                            : doc?.status === 'rejected'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">{reqDoc.name}</h4>
                        <p className="text-xs text-slate-500">{reqDoc.description}</p>
                        {doc && (
                          <p className="text-xs text-slate-400 mt-1">
                            {doc.file_name} • Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                          </p>
                        )}
                        {doc?.rejection_reason && (
                          <p className="text-xs text-red-500 mt-1">
                            Reason: {doc.rejection_reason}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusBadge(doc)}
                      {doc?.file_url && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(doc.file_url, '_blank')}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                      {(!doc || doc.status === 'rejected') && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUploadClick(reqDoc.type)}
                          disabled={isUploading}
                          leftIcon={
                            isUploading ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Upload className="w-3 h-3" />
                            )
                          }
                        >
                          {isUploading ? 'Uploading...' : doc ? 'Re-upload' : 'Upload'}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
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

          <Annotation>
            Documents are uploaded to private S3 buckets. E-signature flow
            integrates with DocuSign API. Webhooks update the status
            automatically once signed.
          </Annotation>
        </div>

        <div className="space-y-6">
          <Card title="Progress Summary">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Documents Approved</span>
                <span className="font-semibold text-green-600">{completedCount} / {REQUIRED_DOCUMENTS.length}</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-green-500 h-full rounded-full transition-all"
                  style={{ width: `${(completedCount / REQUIRED_DOCUMENTS.length) * 100}%` }}
                />
              </div>
              {pendingCount > 0 && (
                <p className="text-xs text-amber-600">
                  {pendingCount} document(s) pending review
                </p>
              )}
            </div>
          </Card>

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
                  Complete Your Documents
                </h4>
                <p className="text-xs text-amber-700 mt-1">
                  All onboarding documents must be submitted and approved to
                  ensure your placement start date is not delayed.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
