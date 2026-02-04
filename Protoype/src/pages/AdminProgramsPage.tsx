import React, { useEffect, useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Building2,
  Calendar,
  Users,
  MapPin,
  Clock,
  Loader2,
  Search
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/ui/stat-card';
import { EmptyState } from '@/components/ui/empty-state';
import { FilterBar } from '@/components/ui/filter-bar';
import { PageHeader } from '@/components/ui/page-header';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api, Program, ProgramCreate, ProgramUpdate } from '@/services/api';
import { useToast } from '@/components/ui/Toast';

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'open', label: 'Open for Enrollment' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const getStatusVariant = (status: string): 'success' | 'info' | 'secondary' | 'destructive' | 'warning' => {
  switch (status) {
    case 'open': return 'success';
    case 'in_progress': return 'info';
    case 'completed': return 'secondary';
    case 'cancelled': return 'destructive';
    default: return 'warning';
  }
};

export function AdminProgramsPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState<ProgramCreate>({
    name: '',
    description: '',
    organization: '',
    location: '',
    start_date: '',
    end_date: '',
    total_hours: 0,
    spots_available: 0,
    application_deadline: '',
  });
  const [formStatus, setFormStatus] = useState('open');

  useEffect(() => {
    fetchPrograms();
  }, []);

  async function fetchPrograms() {
    setLoading(true);
    const { data } = await api.getAllProgramsAdmin();
    if (data) {
      setPrograms(data);
    }
    setLoading(false);
  }

  const filteredPrograms = programs.filter((program) => {
    const matchesSearch =
      program.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.organization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || program.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openCreateModal = () => {
    setEditingProgram(null);
    setFormData({
      name: '',
      description: '',
      organization: '',
      location: '',
      start_date: '',
      end_date: '',
      total_hours: 0,
      spots_available: 0,
      application_deadline: '',
    });
    setFormStatus('open');
    setShowModal(true);
  };

  const openEditModal = (program: Program) => {
    setEditingProgram(program);
    setFormData({
      name: program.name,
      description: program.description || '',
      organization: program.organization,
      location: program.location || '',
      start_date: program.start_date,
      end_date: program.end_date,
      total_hours: program.total_hours,
      spots_available: program.spots_available,
      application_deadline: program.application_deadline || '',
    });
    setFormStatus(program.status);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (editingProgram) {
      // Update existing program
      const updateData: ProgramUpdate = {
        ...formData,
        status: formStatus,
        application_deadline: formData.application_deadline || undefined,
      };
      const { data, error } = await api.updateProgram(editingProgram.id, updateData);
      if (data) {
        setPrograms(prev => prev.map(p => p.id === editingProgram.id ? data : p));
        toast.success('Program updated successfully');
        setShowModal(false);
      } else {
        toast.error(error || 'Failed to update program');
      }
    } else {
      // Create new program
      const createData: ProgramCreate = {
        ...formData,
        application_deadline: formData.application_deadline || undefined,
      };
      const { data, error } = await api.createProgram(createData);
      if (data) {
        setPrograms(prev => [data, ...prev]);
        toast.success('Program created successfully');
        setShowModal(false);
      } else {
        toast.error(error || 'Failed to create program');
      }
    }

    setSaving(false);
  };

  const handleDelete = async (program: Program) => {
    setDeleting(program.id);
    const { data, error } = await api.deleteProgram(program.id);
    if (data) {
      setPrograms(prev => prev.filter(p => p.id !== program.id));
      toast.success('Program deleted successfully');
    } else {
      toast.error(error || 'Failed to delete program');
    }
    setDeleting(null);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <DashboardLayout title="Program Management">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-40" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <Skeleton className="h-14" />
          <div className="space-y-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Program Management">
      {/* Header */}
      <PageHeader
        description="Create and manage work-based learning programs"
        title=""
        actions={
          <Button variant="gradient" onClick={openCreateModal}>
            <Plus className="w-4 h-4 mr-2" />
            Create Program
          </Button>
        }
        className="mb-6 animate-fade-in"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-fade-in animate-delay-100">
        <StatCard
          title="Total Programs"
          value={programs.length}
          icon={<Building2 className="w-5 h-5" />}
        />
        <StatCard
          title="Open"
          value={programs.filter(p => p.status === 'open').length}
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          title="In Progress"
          value={programs.filter(p => p.status === 'in_progress').length}
          icon={<Clock className="w-5 h-5" />}
        />
        <StatCard
          title="Completed"
          value={programs.filter(p => p.status === 'completed').length}
          icon={<Calendar className="w-5 h-5" />}
        />
      </div>

      {/* Search and Filters */}
      <Card className="mb-6 animate-fade-in animate-delay-200">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search programs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                All
              </Button>
              {STATUS_OPTIONS.map(opt => (
                <Button
                  key={opt.value}
                  variant={statusFilter === opt.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Programs List */}
      <div className="space-y-4 animate-fade-in animate-delay-300">
        {filteredPrograms.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <EmptyState
                icon={<Building2 className="w-8 h-8" />}
                title="No programs found"
                description={
                  programs.length === 0 ? 'Create your first program to get started.' : 'Try adjusting your search or filters.'
                }
                action={
                  programs.length === 0 ? (
                    <Button onClick={openCreateModal}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Program
                    </Button>
                  ) : undefined
                }
              />
            </CardContent>
          </Card>
        ) : (
          filteredPrograms.map((program) => (
            <Card key={program.id} className="hover:border-primary/30 transition-all hover:shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground">{program.name}</h3>
                        <p className="text-sm text-muted-foreground">{program.organization}</p>
                      </div>
                      <Badge variant={getStatusVariant(program.status)}>
                        {STATUS_OPTIONS.find(o => o.value === program.status)?.label || program.status}
                      </Badge>
                    </div>

                    {program.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{program.description}</p>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(program.start_date)} - {formatDate(program.end_date)}
                      </span>
                      {program.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {program.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {program.total_hours} hours
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {program.spots_available} spots
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(program)}
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={deleting === program.id}
                        >
                          {deleting === program.id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 mr-2" />
                          )}
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Program</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{program.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(program)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProgram ? 'Edit Program' : 'Create Program'}
            </DialogTitle>
            <DialogDescription>
              {editingProgram ? 'Update the program details below.' : 'Fill in the details to create a new program.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="program-name">Program Name</Label>
                <Input
                  id="program-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="e.g., Summer Internship Program 2024"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="organization">Organization</Label>
                <Input
                  id="organization"
                  value={formData.organization}
                  onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
                  required
                  placeholder="e.g., TechCorp Solutions"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., Downtown Campus"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the program..."
                  className="resize-none"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="total-hours">Total Hours</Label>
                <Input
                  id="total-hours"
                  type="number"
                  value={formData.total_hours}
                  onChange={(e) => setFormData(prev => ({ ...prev, total_hours: Number(e.target.value) }))}
                  required
                  min={0}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="spots-available">Spots Available</Label>
                <Input
                  id="spots-available"
                  type="number"
                  value={formData.spots_available}
                  onChange={(e) => setFormData(prev => ({ ...prev, spots_available: Number(e.target.value) }))}
                  required
                  min={0}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="application-deadline">Application Deadline</Label>
                <Input
                  id="application-deadline"
                  type="date"
                  value={formData.application_deadline}
                  onChange={(e) => setFormData(prev => ({ ...prev, application_deadline: e.target.value }))}
                />
              </div>

              {editingProgram && (
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formStatus} onValueChange={setFormStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <DialogFooter className="pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                isLoading={saving}
              >
                {saving ? 'Saving...' : editingProgram ? 'Update Program' : 'Create Program'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
