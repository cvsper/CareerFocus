import React, { useState } from 'react';
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
  ExternalLink
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Input } from '../components/ui/Input';

interface JobOpportunitiesPageProps {
  onLogout: () => void;
}

export function JobOpportunitiesPage({ onLogout }: JobOpportunitiesPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Mock data - would come from API in production
  const opportunities = [
    {
      id: 1,
      title: 'Software Development Intern',
      organization: 'TechCorp Solutions',
      location: 'Downtown Campus',
      type: 'Internship',
      duration: '12 weeks',
      hoursPerWeek: '20-25',
      compensation: 'Paid',
      deadline: 'Nov 15, 2024',
      description: 'Join our engineering team to work on real-world software projects. Gain experience with modern technologies including React, Node.js, and cloud services.',
      requirements: ['Currently enrolled student', 'Basic programming knowledge', 'Strong communication skills'],
      featured: true,
      isNew: true
    },
    {
      id: 2,
      title: 'Healthcare Administrative Assistant',
      organization: 'Regional Medical Center',
      location: 'Medical District',
      type: 'Pathway',
      duration: '10 weeks',
      hoursPerWeek: '15-20',
      compensation: 'Paid',
      deadline: 'Dec 01, 2024',
      description: 'Learn healthcare administration while supporting patient services and medical records management.',
      requirements: ['Interest in healthcare', 'Computer proficiency', 'Attention to detail'],
      featured: true,
      isNew: false
    },
    {
      id: 3,
      title: 'Marketing & Communications Intern',
      organization: 'City Chamber of Commerce',
      location: 'City Center',
      type: 'Internship',
      duration: '8 weeks',
      hoursPerWeek: '15-20',
      compensation: 'Paid',
      deadline: 'Nov 20, 2024',
      description: 'Support marketing campaigns and community outreach initiatives. Create content for social media and assist with event planning.',
      requirements: ['Strong writing skills', 'Social media familiarity', 'Creative mindset'],
      featured: false,
      isNew: true
    },
    {
      id: 4,
      title: 'Retail Customer Service',
      organization: 'Community Retail Partners',
      location: 'Various Locations',
      type: 'Part-Time',
      duration: 'Ongoing',
      hoursPerWeek: '10-15',
      compensation: 'Paid',
      deadline: 'Rolling',
      description: 'Develop customer service and sales skills while working in a supportive retail environment.',
      requirements: ['Friendly attitude', 'Reliable', 'Weekend availability'],
      featured: false,
      isNew: false
    },
    {
      id: 5,
      title: 'Construction Trades Apprentice',
      organization: 'BuildWell Construction',
      location: 'Industrial Park',
      type: 'Apprenticeship',
      duration: '16 weeks',
      hoursPerWeek: '25-30',
      compensation: 'Paid + Certification',
      deadline: 'Dec 15, 2024',
      description: 'Learn fundamental construction skills including carpentry, electrical basics, and safety protocols. Earn industry certifications.',
      requirements: ['Physical capability', 'Safety orientation', '18+ years old'],
      featured: false,
      isNew: false
    }
  ];

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
    const matchesFilter = selectedFilter === 'all' || opp.type.toLowerCase() === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const featuredOpportunities = opportunities.filter(opp => opp.featured);

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
                    {opp.isNew && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600">{opp.organization}</p>
                </div>
                <StatusBadge status="info">{opp.type}</StatusBadge>
              </div>

              <p className="text-sm text-slate-600 mb-4 line-clamp-2">{opp.description}</p>

              <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div className="flex items-center gap-2 text-slate-500">
                  <MapPin className="w-4 h-4" />
                  <span>{opp.location}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Clock className="w-4 h-4" />
                  <span>{opp.hoursPerWeek} hrs/week</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Calendar className="w-4 h-4" />
                  <span>{opp.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-green-600 font-medium">
                  <DollarSign className="w-4 h-4" />
                  <span>{opp.compensation}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-blue-200">
                <span className="text-sm text-amber-600 font-medium">
                  Apply by: {opp.deadline}
                </span>
                <Button size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
                  View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

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
              <p className="text-slate-500">Try adjusting your search or filters.</p>
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
                      {opp.isNew && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          New
                        </span>
                      )}
                    </div>
                    <StatusBadge status="neutral">{opp.type}</StatusBadge>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{opp.organization}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {opp.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {opp.hoursPerWeek} hrs/week
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {opp.duration}
                    </span>
                    <span className="flex items-center gap-1 text-green-600">
                      <DollarSign className="w-4 h-4" />
                      {opp.compensation}
                    </span>
                  </div>
                </div>

                {/* Action */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm text-slate-500 hidden md:block">
                    Apply by: {opp.deadline}
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
