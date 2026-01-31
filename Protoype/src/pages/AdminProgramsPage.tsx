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
  X,
  Search
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { StatusBadge } from '../components/ui/StatusBadge';
import { api, Program, ProgramCreate, ProgramUpdate } from '../services/api';
import { useToast } from '../components/ui/Toast';

interface AdminProgramsPageProps {
  onLogout: () => void;
}

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'open', label: 'Open for Enrollment' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'open': return 'success';
    case 'in_progress': return 'info';
    case 'completed': return 'neutral';
    case 'cancelled': return 'error';
    default: return 'warning';
  }
};

export function AdminProgramsPage({ onLogout }: AdminProgramsPageProps) {
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
    if (!confirm(`Are you sure you want to delete "${program.name}"?`)) {
      return;
    }

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
      <DashboardLayout title="Program Management" userType="admin" onLogout={onLogout}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Program Management" userType="admin" onLogout={onLogout}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <p className="text-slate-500">Create and manage work-based learning programs</p>
        </div>
        <Button onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
          Create Program
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none">
          <div className="text-center">
            <p className="text-blue-100 text-sm">Total Programs</p>
            <p className="text-2xl font-bold">{programs.length}</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-none">
          <div className="text-center">
            <p className="text-green-100 text-sm">Open</p>
            <p className="text-2xl font-bold">{programs.filter(p => p.status === 'open').length}</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none">
          <div className="text-center">
            <p className="text-purple-100 text-sm">In Progress</p>
            <p className="text-2xl font-bold">{programs.filter(p => p.status === 'in_progress').length}</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-slate-500 to-slate-600 text-white border-none">
          <div className="text-center">
            <p className="text-slate-100 text-sm">Completed</p>
            <p className="text-2xl font-bold">{programs.filter(p => p.status === 'completed').length}</p>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search programs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === opt.value ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Programs List */}
      <div className="space-y-4">
        {filteredPrograms.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No programs found</h3>
              <p className="text-slate-500 mb-4">
                {programs.length === 0 ? 'Create your first program to get started.' : 'Try adjusting your search or filters.'}
              </p>
              {programs.length === 0 && (
                <Button onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
                  Create Program
                </Button>
              )}
            </div>
          </Card>
        ) : (
          filteredPrograms.map((program) => (
            <Card key={program.id} className="hover:border-blue-300 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-semibold text-slate-900">{program.name}</h3>
                      <p className="text-sm text-slate-500">{program.organization}</p>
                    </div>
                    <StatusBadge status={getStatusColor(program.status) as any}>
                      {STATUS_OPTIONS.find(o => o.value === program.status)?.label || program.status}
                    </StatusBadge>
                  </div>

                  {program.description && (
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">{program.description}</p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-slate-500">
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
                    leftIcon={<Edit2 className="w-4 h-4" />}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(program)}
                    disabled={deleting === program.id}
                    leftIcon={deleting === program.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
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
                {editingProgram ? 'Edit Program' : 'Create Program'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input
                    label="Program Name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    placeholder="e.g., Summer Internship Program 2024"
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

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none h-24"
                    placeholder="Describe the program..."
                  />
                </div>

                <Input
                  label="Start Date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  required
                />

                <Input
                  label="End Date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  required
                />

                <Input
                  label="Total Hours"
                  type="number"
                  value={formData.total_hours}
                  onChange={(e) => setFormData(prev => ({ ...prev, total_hours: Number(e.target.value) }))}
                  required
                  min={0}
                />

                <Input
                  label="Spots Available"
                  type="number"
                  value={formData.spots_available}
                  onChange={(e) => setFormData(prev => ({ ...prev, spots_available: Number(e.target.value) }))}
                  required
                  min={0}
                />

                <Input
                  label="Application Deadline"
                  type="date"
                  value={formData.application_deadline}
                  onChange={(e) => setFormData(prev => ({ ...prev, application_deadline: e.target.value }))}
                />

                {editingProgram && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      {STATUS_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                )}
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
                  {saving ? 'Saving...' : editingProgram ? 'Update Program' : 'Create Program'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
