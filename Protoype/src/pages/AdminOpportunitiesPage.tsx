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
  X,
  Search,
  Eye,
  EyeOff
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { StatusBadge } from '../components/ui/StatusBadge';
import { api, Opportunity, OpportunityCreate, OpportunityUpdate } from '../services/api';
import { useToast } from '../components/ui/Toast';

interface AdminOpportunitiesPageProps {
  onLogout: () => void;
}

const TYPE_OPTIONS = [
  { value: 'Internship', label: 'Internship' },
  { value: 'Pathway', label: 'Pathway' },
  { value: 'Part-Time', label: 'Part-Time' },
  { value: 'Apprenticeship', label: 'Apprenticeship' },
  { value: 'Full-Time', label: 'Full-Time' },
];

export function AdminOpportunitiesPage({ onLogout }: AdminOpportunitiesPageProps) {
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
    if (!confirm(`Are you sure you want to delete "${opp.title}"?`)) {
      return;
    }

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
      <DashboardLayout title="Opportunity Management" userType="admin" onLogout={onLogout}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Opportunity Management" userType="admin" onLogout={onLogout}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <p className="text-slate-500">Create and manage job opportunities for students</p>
        </div>
        <Button onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
          Create Opportunity
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none">
          <div className="text-center">
            <p className="text-blue-100 text-sm">Total</p>
            <p className="text-2xl font-bold">{opportunities.length}</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-none">
          <div className="text-center">
            <p className="text-green-100 text-sm">Active</p>
            <p className="text-2xl font-bold">{opportunities.filter(o => o.is_active).length}</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-none">
          <div className="text-center">
            <p className="text-amber-100 text-sm">Featured</p>
            <p className="text-2xl font-bold">{opportunities.filter(o => o.is_featured).length}</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-slate-500 to-slate-600 text-white border-none">
          <div className="text-center">
            <p className="text-slate-100 text-sm">Inactive</p>
            <p className="text-2xl font-bold">{opportunities.filter(o => !o.is_active).length}</p>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search opportunities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                typeFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Types
            </button>
            {TYPE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setTypeFilter(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  typeFilter === opt.value ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
            <div className="w-px bg-slate-300 mx-2" />
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'all' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Status
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'active' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('inactive')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'inactive' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Inactive
            </button>
          </div>
        </div>
      </Card>

      {/* Opportunities List */}
      <div className="space-y-4">
        {filteredOpportunities.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No opportunities found</h3>
              <p className="text-slate-500 mb-4">
                {opportunities.length === 0 ? 'Create your first opportunity to get started.' : 'Try adjusting your search or filters.'}
              </p>
              {opportunities.length === 0 && (
                <Button onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
                  Create Opportunity
                </Button>
              )}
            </div>
          </Card>
        ) : (
          filteredOpportunities.map((opp) => (
            <Card key={opp.id} className={`transition-colors ${!opp.is_active ? 'opacity-60' : ''}`}>
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{opp.title}</h3>
                      {opp.is_featured && (
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={opp.is_active ? 'success' : 'neutral'}>
                        {opp.is_active ? 'Active' : 'Inactive'}
                      </StatusBadge>
                      <StatusBadge status="info">{opp.opportunity_type}</StatusBadge>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 mb-2">{opp.organization}</p>

                  <div className="flex flex-wrap gap-4 text-sm text-slate-500">
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
                      <span className="flex items-center gap-1 text-green-600">
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
                  <button
                    onClick={() => toggleFeatured(opp)}
                    className={`p-2 rounded-lg transition-colors ${
                      opp.is_featured ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400 hover:text-amber-600'
                    }`}
                    title={opp.is_featured ? 'Remove from featured' : 'Mark as featured'}
                  >
                    <Star className={`w-4 h-4 ${opp.is_featured ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={() => toggleActive(opp)}
                    className={`p-2 rounded-lg transition-colors ${
                      opp.is_active ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400 hover:text-green-600'
                    }`}
                    title={opp.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {opp.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(opp)}
                    leftIcon={<Edit2 className="w-4 h-4" />}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(opp)}
                    disabled={deleting === opp.id}
                    leftIcon={deleting === opp.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">
                {editingOpportunity ? 'Edit Opportunity' : 'Create Opportunity'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input
                    label="Job Title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                    placeholder="e.g., Software Development Intern"
                  />
                </div>

                <Input
                  label="Organization"
                  value={formData.organization}
                  onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
                  required
                  placeholder="e.g., TechCorp Solutions"
                />

                <Input
                  label="Location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., Downtown Campus"
                />

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Opportunity Type</label>
                  <select
                    value={formData.opportunity_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, opportunity_type: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  >
                    {TYPE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Duration"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="e.g., 12 weeks"
                />

                <Input
                  label="Hours per Week"
                  value={formData.hours_per_week}
                  onChange={(e) => setFormData(prev => ({ ...prev, hours_per_week: e.target.value }))}
                  placeholder="e.g., 20-25"
                />

                <Input
                  label="Compensation"
                  value={formData.compensation}
                  onChange={(e) => setFormData(prev => ({ ...prev, compensation: e.target.value }))}
                  placeholder="e.g., Paid - $18/hr"
                />

                <Input
                  label="Application Deadline"
                  type="date"
                  value={formData.application_deadline}
                  onChange={(e) => setFormData(prev => ({ ...prev, application_deadline: e.target.value }))}
                />

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none h-24"
                    placeholder="Describe the opportunity..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Requirements</label>
                  <textarea
                    value={formData.requirements}
                    onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none h-20"
                    placeholder="List requirements (comma separated)..."
                  />
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Featured Opportunity</span>
                  </label>

                  {editingOpportunity && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formIsActive}
                        onChange={(e) => setFormIsActive(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-slate-700">Active</span>
                    </label>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  leftIcon={saving ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
                >
                  {saving ? 'Saving...' : editingOpportunity ? 'Update Opportunity' : 'Create Opportunity'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
