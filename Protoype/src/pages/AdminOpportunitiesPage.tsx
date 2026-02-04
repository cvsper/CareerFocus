import React, { useEffect, useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  Star,
  Loader2,
  Search,
  Eye,
  EyeOff
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
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api, Opportunity, OpportunityCreate, OpportunityUpdate } from '@/services/api';
import { useToast } from '@/components/ui/Toast';

const TYPE_OPTIONS = [
  { value: 'Internship', label: 'Internship' },
  { value: 'Pathway', label: 'Pathway' },
  { value: 'Part-Time', label: 'Part-Time' },
  { value: 'Apprenticeship', label: 'Apprenticeship' },
  { value: 'Full-Time', label: 'Full-Time' },
];

export function AdminOpportunitiesPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState<OpportunityCreate>({
    title: '',
    organization: '',
    location: '',
    opportunity_type: 'Internship',
    description: '',
    requirements: '',
    duration: '',
    hours_per_week: '',
    compensation: '',
    application_deadline: '',
    is_featured: false,
  });
  const [formIsActive, setFormIsActive] = useState(true);

  useEffect(() => {
    fetchOpportunities();
  }, []);

  async function fetchOpportunities() {
    setLoading(true);
    const { data } = await api.getAllOpportunitiesAdmin();
    if (data) {
      setOpportunities(data);
    }
    setLoading(false);
  }

  const filteredOpportunities = opportunities.filter((opp) => {
    const matchesSearch =
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.organization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || opp.opportunity_type === typeFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && opp.is_active) ||
      (statusFilter === 'inactive' && !opp.is_active);
    return matchesSearch && matchesType && matchesStatus;
  });

  const openCreateModal = () => {
    setEditingOpportunity(null);
    setFormData({
      title: '',
      organization: '',
      location: '',
      opportunity_type: 'Internship',
      description: '',
      requirements: '',
      duration: '',
      hours_per_week: '',
      compensation: '',
      application_deadline: '',
      is_featured: false,
    });
    setFormIsActive(true);
    setShowModal(true);
  };

  const openEditModal = (opp: Opportunity) => {
    setEditingOpportunity(opp);
    setFormData({
      title: opp.title,
      organization: opp.organization,
      location: opp.location || '',
      opportunity_type: opp.opportunity_type,
      description: opp.description || '',
      requirements: opp.requirements || '',
      duration: opp.duration || '',
      hours_per_week: opp.hours_per_week || '',
      compensation: opp.compensation || '',
      application_deadline: opp.application_deadline || '',
      is_featured: opp.is_featured,
    });
    setFormIsActive(opp.is_active);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (editingOpportunity) {
      const updateData: OpportunityUpdate = {
        ...formData,
        is_active: formIsActive,
        application_deadline: formData.application_deadline || undefined,
      };
      const { data, error } = await api.updateOpportunity(editingOpportunity.id, updateData);
      if (data) {
        setOpportunities(prev => prev.map(o => o.id === editingOpportunity.id ? data : o));
        toast.success('Opportunity updated successfully');
        setShowModal(false);
      } else {
        toast.error(error || 'Failed to update opportunity');
      }
    } else {
      const createData: OpportunityCreate = {
        ...formData,
        application_deadline: formData.application_deadline || undefined,
      };
      const { data, error } = await api.createOpportunity(createData);
      if (data) {
        setOpportunities(prev => [data, ...prev]);
        toast.success('Opportunity created successfully');
        setShowModal(false);
      } else {
        toast.error(error || 'Failed to create opportunity');
      }
    }

    setSaving(false);
  };

  const handleDelete = async (opp: Opportunity) => {
    setDeleting(opp.id);
    const { data, error } = await api.deleteOpportunity(opp.id);
    if (data) {
      setOpportunities(prev => prev.filter(o => o.id !== opp.id));
      toast.success('Opportunity deleted successfully');
    } else {
      toast.error(error || 'Failed to delete opportunity');
    }
    setDeleting(null);
  };

  const toggleActive = async (opp: Opportunity) => {
    const { data, error } = await api.updateOpportunity(opp.id, { is_active: !opp.is_active });
    if (data) {
      setOpportunities(prev => prev.map(o => o.id === opp.id ? data : o));
      toast.success(data.is_active ? 'Opportunity activated' : 'Opportunity deactivated');
    } else {
      toast.error(error || 'Failed to update opportunity');
    }
  };

  const toggleFeatured = async (opp: Opportunity) => {
    const { data, error } = await api.updateOpportunity(opp.id, { is_featured: !opp.is_featured });
    if (data) {
      setOpportunities(prev => prev.map(o => o.id === opp.id ? data : o));
      toast.success(data.is_featured ? 'Marked as featured' : 'Removed from featured');
    } else {
      toast.error(error || 'Failed to update opportunity');
    }
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
      <DashboardLayout title="Opportunity Management">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-72" />
            <Skeleton className="h-10 w-44" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <Skeleton className="h-20" />
          <div className="space-y-4">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Opportunity Management">
      {/* Header */}
      <PageHeader
        description="Create and manage job opportunities for students"
        title=""
        actions={
          <Button variant="gradient" onClick={openCreateModal}>
            <Plus className="w-4 h-4 mr-2" />
            Create Opportunity
          </Button>
        }
        className="mb-6 animate-fade-in"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-fade-in animate-delay-100">
        <StatCard
          title="Total"
          value={opportunities.length}
          icon={<Briefcase className="w-5 h-5" />}
        />
        <StatCard
          title="Active"
          value={opportunities.filter(o => o.is_active).length}
          icon={<Eye className="w-5 h-5" />}
        />
        <StatCard
          title="Featured"
          value={opportunities.filter(o => o.is_featured).length}
          icon={<Star className="w-5 h-5" />}
        />
        <StatCard
          title="Inactive"
          value={opportunities.filter(o => !o.is_active).length}
          icon={<EyeOff className="w-5 h-5" />}
        />
      </div>

      {/* Search and Filters */}
      <Card className="mb-6 animate-fade-in animate-delay-200">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <FilterBar
              searchPlaceholder="Search opportunities..."
              searchValue={searchQuery}
              onSearchChange={setSearchQuery}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                variant={typeFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTypeFilter('all')}
              >
                All Types
              </Button>
              {TYPE_OPTIONS.map(opt => (
                <Button
                  key={opt.value}
                  variant={typeFilter === opt.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTypeFilter(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
              <div className="w-px bg-border mx-2" />
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                All Status
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('active')}
              >
                Active
              </Button>
              <Button
                variant={statusFilter === 'inactive' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('inactive')}
              >
                Inactive
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Opportunities List */}
      <div className="space-y-4 animate-fade-in animate-delay-300">
        {filteredOpportunities.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <EmptyState
                icon={<Briefcase className="w-8 h-8" />}
                title="No opportunities found"
                description={
                  opportunities.length === 0 ? 'Create your first opportunity to get started.' : 'Try adjusting your search or filters.'
                }
                action={
                  opportunities.length === 0 ? (
                    <Button onClick={openCreateModal}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Opportunity
                    </Button>
                  ) : undefined
                }
              />
            </CardContent>
          </Card>
        ) : (
          filteredOpportunities.map((opp) => (
            <Card key={opp.id} className={`transition-all hover:shadow-sm hover:border-primary/30 ${!opp.is_active ? 'opacity-60' : ''}`}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{opp.title}</h3>
                        {opp.is_featured && (
                          <Star className="w-4 h-4 text-warning fill-warning" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={opp.is_active ? 'success' : 'secondary'}>
                          {opp.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="info">{opp.opportunity_type}</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{opp.organization}</p>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {opp.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {opp.location}
                        </span>
                      )}
                      {opp.hours_per_week && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {opp.hours_per_week} hrs/week
                        </span>
                      )}
                      {opp.compensation && (
                        <span className="flex items-center gap-1 text-success">
                          <DollarSign className="w-4 h-4" />
                          {opp.compensation}
                        </span>
                      )}
                      {opp.application_deadline && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Deadline: {formatDate(opp.application_deadline)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleFeatured(opp)}
                      className={opp.is_featured ? 'text-warning' : 'text-muted-foreground hover:text-warning'}
                      title={opp.is_featured ? 'Remove from featured' : 'Mark as featured'}
                    >
                      <Star className={`w-4 h-4 ${opp.is_featured ? 'fill-current' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleActive(opp)}
                      className={opp.is_active ? 'text-success' : 'text-muted-foreground hover:text-success'}
                      title={opp.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {opp.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(opp)}
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={deleting === opp.id}
                        >
                          {deleting === opp.id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 mr-2" />
                          )}
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Opportunity</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{opp.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(opp)}
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
              {editingOpportunity ? 'Edit Opportunity' : 'Create Opportunity'}
            </DialogTitle>
            <DialogDescription>
              {editingOpportunity ? 'Update the opportunity details below.' : 'Fill in the details to create a new opportunity.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="job-title">Job Title</Label>
                <Input
                  id="job-title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                  placeholder="e.g., Software Development Intern"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="opp-organization">Organization</Label>
                <Input
                  id="opp-organization"
                  value={formData.organization}
                  onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
                  required
                  placeholder="e.g., TechCorp Solutions"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="opp-location">Location</Label>
                <Input
                  id="opp-location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., Downtown Campus"
                />
              </div>

              <div className="space-y-2">
                <Label>Opportunity Type</Label>
                <Select
                  value={formData.opportunity_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, opportunity_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPE_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="e.g., 12 weeks"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hours-per-week">Hours per Week</Label>
                <Input
                  id="hours-per-week"
                  value={formData.hours_per_week}
                  onChange={(e) => setFormData(prev => ({ ...prev, hours_per_week: e.target.value }))}
                  placeholder="e.g., 20-25"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="compensation">Compensation</Label>
                <Input
                  id="compensation"
                  value={formData.compensation}
                  onChange={(e) => setFormData(prev => ({ ...prev, compensation: e.target.value }))}
                  placeholder="e.g., Paid - $18/hr"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="opp-deadline">Application Deadline</Label>
                <Input
                  id="opp-deadline"
                  type="date"
                  value={formData.application_deadline}
                  onChange={(e) => setFormData(prev => ({ ...prev, application_deadline: e.target.value }))}
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="opp-description">Description</Label>
                <Textarea
                  id="opp-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the opportunity..."
                  className="resize-none"
                  rows={3}
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                  placeholder="List requirements (comma separated)..."
                  className="resize-none"
                  rows={2}
                />
              </div>

              <div className="md:col-span-2 flex items-center gap-8">
                <div className="flex items-center gap-3">
                  <Switch
                    id="featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
                  />
                  <Label htmlFor="featured" className="cursor-pointer">Featured Opportunity</Label>
                </div>

                {editingOpportunity && (
                  <div className="flex items-center gap-3">
                    <Switch
                      id="active"
                      checked={formIsActive}
                      onCheckedChange={setFormIsActive}
                    />
                    <Label htmlFor="active" className="cursor-pointer">Active</Label>
                  </div>
                )}
              </div>
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
                {saving ? 'Saving...' : editingOpportunity ? 'Update Opportunity' : 'Create Opportunity'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
