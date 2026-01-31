import React, { useEffect, useState } from 'react';
import {
  Briefcase,
  MapPin,
  Clock,
  Calendar,
  DollarSign,
  Building2,
  Filter,
  Search,
  ChevronRight,
  Star,
  BookmarkPlus,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Input } from '../components/ui/Input';
import { api, Opportunity } from '../services/api';

interface JobOpportunitiesPageProps {
  onLogout: () => void;
}

export function JobOpportunitiesPage({ onLogout }: JobOpportunitiesPageProps) {
  const [loading, setLoading] = useState(true);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    async function fetchOpportunities() {
      setLoading(true);
      const { data } = await api.getOpportunities();
      if (data) {
        setOpportunities(data);
      }
      setLoading(false);
    }
    fetchOpportunities();
  }, []);

  const filters = [
    { id: 'all', label: 'All Opportunities' },
    { id: 'internship', label: 'Internships' },
    { id: 'pathway', label: 'Pathways' },
    { id: 'part-time', label: 'Part-Time' },
    { id: 'apprenticeship', label: 'Apprenticeships' }
  ];

  const filteredOpportunities = opportunities.filter((opp) => {
    const matchesSearch = opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.organization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || opp.opportunity_type.toLowerCase() === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const featuredOpportunities = opportunities.filter(opp => opp.is_featured);

  const formatDeadline = (deadline: string | undefined) => {
    if (!deadline) return 'Rolling';
    return new Date(deadline).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isNewOpportunity = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  if (loading) {
    return (
      <DashboardLayout title="Job Opportunities" userType="student" onLogout={onLogout}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Job Opportunities"
      userType="student"
      onLogout={onLogout}
    >
      {/* Header Section */}
      <div className="mb-6">
        <p className="text-slate-500">
          Explore work-based learning opportunities matched to your interests and goals.
        </p>
      </div>

      {/* Featured Opportunities */}
      {featuredOpportunities.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            Featured Opportunities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredOpportunities.map((opp) => (
              <Card key={opp.id} className="border-2 border-blue-200 bg-blue-50/50">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900">{opp.title}</h3>
                      {isNewOpportunity(opp.created_at) && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">{opp.organization}</p>
                  </div>
                  <StatusBadge status="info">{opp.opportunity_type}</StatusBadge>
                </div>

                {opp.description && (
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">{opp.description}</p>
                )}

                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  {opp.location && (
                    <div className="flex items-center gap-2 text-slate-500">
                      <MapPin className="w-4 h-4" />
                      <span>{opp.location}</span>
                    </div>
                  )}
                  {opp.hours_per_week && (
                    <div className="flex items-center gap-2 text-slate-500">
                      <Clock className="w-4 h-4" />
                      <span>{opp.hours_per_week} hrs/week</span>
                    </div>
                  )}
                  {opp.duration && (
                    <div className="flex items-center gap-2 text-slate-500">
                      <Calendar className="w-4 h-4" />
                      <span>{opp.duration}</span>
                    </div>
                  )}
                  {opp.compensation && (
                    <div className="flex items-center gap-2 text-green-600 font-medium">
                      <DollarSign className="w-4 h-4" />
                      <span>{opp.compensation}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-blue-200">
                  <span className="text-sm text-amber-600 font-medium">
                    Apply by: {formatDeadline(opp.application_deadline)}
                  </span>
                  <Button size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search opportunities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFilter === filter.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* All Opportunities List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">
          All Opportunities ({filteredOpportunities.length})
        </h2>

        {filteredOpportunities.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No opportunities found</h3>
              <p className="text-slate-500">
                {opportunities.length === 0
                  ? 'Check back later for new opportunities.'
                  : 'Try adjusting your search or filters.'}
              </p>
            </div>
          </Card>
        ) : (
          filteredOpportunities.map((opp) => (
            <Card key={opp.id} className="hover:border-blue-300 transition-colors cursor-pointer">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Icon */}
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-6 h-6 text-slate-600" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{opp.title}</h3>
                      {isNewOpportunity(opp.created_at) && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          New
                        </span>
                      )}
                    </div>
                    <StatusBadge status="neutral">{opp.opportunity_type}</StatusBadge>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{opp.organization}</p>
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
                    {opp.duration && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {opp.duration}
                      </span>
                    )}
                    {opp.compensation && (
                      <span className="flex items-center gap-1 text-green-600">
                        <DollarSign className="w-4 h-4" />
                        {opp.compensation}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm text-slate-500 hidden md:block">
                    Apply by: {formatDeadline(opp.application_deadline)}
                  </span>
                  <Button variant="outline" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
                    Details
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
