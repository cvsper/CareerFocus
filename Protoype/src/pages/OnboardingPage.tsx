import React, { useEffect, useState, useRef } from 'react';
import {
  CheckCircle2,
  Upload,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Eye
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { api, Document } from '@/services/api';
import { useToast } from '@/components/ui/Toast';

const REQUIRED_DOCUMENTS = [
  { type: 'government_id', name: 'Government ID', description: 'Passport / Driver License' },
  { type: 'right_to_work', name: 'Right to Work', description: 'Visa / Citizenship Proof' },
  { type: 'emergency_contact', name: 'Emergency Contact Form', description: 'PDF Form' },
  { type: 'w4_form', name: 'W-4 Form', description: 'Tax Withholding Form' },
];

export function OnboardingPage() {
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
        return <Badge variant="success">Approved</Badge>;
      case 'pending':
        return <Badge variant="warning">Reviewing</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{doc.status}</Badge>;
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

  const progressPercentage = Math.round((completedCount / REQUIRED_DOCUMENTS.length) * 100);

  const steps = [
    { id: 1, title: 'Personal Info', status: 'completed' },
    { id: 2, title: 'Documents', status: completedCount === REQUIRED_DOCUMENTS.length ? 'completed' : 'current' },
    { id: 3, title: 'Compliance', status: completedCount === REQUIRED_DOCUMENTS.length ? 'current' : 'pending' },
    { id: 4, title: 'Review', status: 'pending' },
  ];

  if (loading) {
    return (
      <DashboardLayout title="Documents & Onboarding">
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton className="w-10 h-10 rounded-full" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="p-6 space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Skeleton className="h-32" />
              <Skeleton className="h-40" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Documents & Onboarding">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleFileChange}
      />

      {/* Progress Stepper */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gradient-to-r from-success via-primary to-border -z-10" />
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center bg-background px-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                  step.status === 'completed'
                    ? 'bg-success border-success text-success-foreground shadow-glow'
                    : step.status === 'current'
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'bg-card border-border text-muted-foreground'
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
                  step.status === 'current' ? 'text-primary' : 'text-muted-foreground'
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
          <Card className="animate-fade-in-up animate-delay-100">
            <CardHeader>
              <CardTitle className="text-base">Required Documents</CardTitle>
              <p className="text-sm text-muted-foreground">Please upload clear copies of the following documents.</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {REQUIRED_DOCUMENTS.map((reqDoc) => {
                  const doc = getDocumentStatus(reqDoc.type);
                  const isUploading = uploading === reqDoc.type;

                  return (
                    <div
                      key={reqDoc.type}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-all hover-lift"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-2 rounded-lg ${
                            doc?.status === 'approved'
                              ? 'bg-success/10 text-success'
                              : doc?.status === 'pending'
                              ? 'bg-warning/10 text-warning'
                              : doc?.status === 'rejected'
                              ? 'bg-destructive/10 text-destructive'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{reqDoc.name}</h4>
                          <p className="text-xs text-muted-foreground">{reqDoc.description}</p>
                          {doc && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {doc.file_name} &bull; Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                            </p>
                          )}
                          {doc?.rejection_reason && (
                            <p className="text-xs text-destructive mt-1">
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
                            isLoading={isUploading}
                          >
                            {!isUploading && <Upload className="w-3 h-3 mr-2" />}
                            {isUploading ? 'Uploading...' : doc ? 'Re-upload' : 'Upload'}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20 flex gap-3">
                <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    Secure Document Storage
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your documents are encrypted and stored securely. Only
                    authorized administrators can view your personal information.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in-up animate-delay-200">
            <CardHeader>
              <CardTitle className="text-base">E-Signature Required</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 border border-border rounded-lg bg-muted mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-foreground">
                    Student Code of Conduct
                  </h4>
                  <Badge variant="destructive">Action Required</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Please review and sign the code of conduct agreement for your
                  placement.
                </p>
                <Button variant="gradient" className="w-full sm:w-auto">
                  Review & Sign via DocuSign
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Workflow annotation */}
          <div className="rounded-lg border border-border bg-muted/50 p-4 animate-fade-in animate-delay-300">
            <p className="text-xs text-muted-foreground">
              Documents are uploaded to private S3 buckets. E-signature flow
              integrates with DocuSign API. Webhooks update the status
              automatically once signed.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="animate-fade-in-up animate-delay-200">
            <CardHeader>
              <CardTitle className="text-base">Progress Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Documents Approved</span>
                  <span className="font-semibold text-success">{completedCount} / {REQUIRED_DOCUMENTS.length}</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
                {pendingCount > 0 && (
                  <p className="text-xs text-warning">
                    {pendingCount} document(s) pending review
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in-up animate-delay-300">
            <CardHeader>
              <CardTitle className="text-base">Help & Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                  Files must be PDF, JPG, or PNG
                </li>
                <li className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                  Max file size is 10MB
                </li>
                <li className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                  Ensure text is legible
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-warning/10 border-warning/30 animate-fade-in-up animate-delay-400">
            <CardContent className="p-6">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-foreground text-sm">
                    Complete Your Documents
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    All onboarding documents must be submitted and approved to
                    ensure your placement start date is not delayed.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
