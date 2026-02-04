import React, { useEffect, useState } from 'react';
import {
  Briefcase,
  MapPin,
  Clock,
  Calendar,
  DollarSign,
  Star,
  ChevronRight,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { FilterBar } from '@/components/ui/filter-bar';
import { api, Opportunity } from '@/services/api';
import { cn } from '@/lib/utils';

export function JobOpportunitiesPage() {
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
      <DashboardLayout title="Job Opportunities">
        <div className="space-y-6">
          <Skeleton className="h-5 w-80" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-56 w-full rounded-lg" />
            <Skeleton className="h-56 w-full rounded-lg" />
          </div>
          <Skeleton className="h-10 w-full rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Job Opportunities">
      {/* Header Section */}
      <div className="mb-6 animate-fade-in">
        <p className="text-muted-foreground">
          Explore work-based learning opportunities matched to your interests and goals.
        </p>
      </div>

      {/* Featured Opportunities */}
      {featuredOpportunities.length > 0 && (
        <div className="mb-8 animate-fade-in animate-delay-100">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-warning" />
            Featured Opportunities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredOpportunities.map((opp, index) => (
              <Card key={opp.id} className={cn("border-2 border-primary/20 bg-primary/5 shine-effect hover-lift animate-fade-in-up", index === 0 && "animate-delay-100", index === 1 && "animate-delay-200", index >= 2 && "animate-delay-300")}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{opp.title}</h3>
                        {isNewOpportunity(opp.created_at) && (
                          <Badge variant="success">New</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{opp.organization}</p>
                    </div>
                    <Badge variant="info">{opp.opportunity_type}</Badge>
                  </div>

                  {opp.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{opp.description}</p>
                  )}

                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    {opp.location && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{opp.location}</span>
                      </div>
                    )}
                    {opp.hours_per_week && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{opp.hours_per_week} hrs/week</span>
                      </div>
                    )}
                    {opp.duration && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{opp.duration}</span>
                      </div>
                    )}
                    {opp.compensation && (
                      <div className="flex items-center gap-2 text-success font-medium">
                        <DollarSign className="w-4 h-4" />
                        <span>{opp.compensation}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-primary/20">
                    <span className="text-sm text-warning font-medium">
                      Apply by: {formatDeadline(opp.application_deadline)}
                    </span>
                    <Button size="sm">
                      View Details
                      <ChevronRight className="ml-1 w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <FilterBar
        className="mb-6"
        searchPlaceholder="Search opportunities..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        filters={
          <div className="flex gap-2 flex-wrap">
            {filters.map((filter) => (
              <Button
                key={filter.id}
                variant={selectedFilter === filter.id ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setSelectedFilter(filter.id)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        }
      />

      {/* All Opportunities List */}
      <div className="space-y-4 animate-fade-in animate-delay-200">
        <h2 className="text-lg font-semibold text-foreground">
          All Opportunities ({filteredOpportunities.length})
        </h2>

        {filteredOpportunities.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <EmptyState
                icon={<Briefcase className="w-8 h-8" />}
                title="No opportunities found"
                description={
                  opportunities.length === 0
                    ? 'Check back later for new opportunities.'
                    : 'Try adjusting your search or filters.'
                }
              />
            </CardContent>
          </Card>
        ) : (
          filteredOpportunities.map((opp, index) => (
            <Card key={opp.id} className={cn("hover:border-primary/50 transition-all cursor-pointer hover-lift animate-fade-in-up", index === 0 && "animate-delay-100", index === 1 && "animate-delay-200", index === 2 && "animate-delay-300", index >= 3 && "animate-delay-400")}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Icon */}
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-6 h-6 text-muted-foreground" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">{opp.title}</h3>
                        {isNewOpportunity(opp.created_at) && (
                          <Badge variant="success">New</Badge>
                        )}
                      </div>
                      <Badge variant="secondary">{opp.opportunity_type}</Badge>
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
                      {opp.duration && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {opp.duration}
                        </span>
                      )}
                      {opp.compensation && (
                        <span className="flex items-center gap-1 text-success">
                          <DollarSign className="w-4 h-4" />
                          {opp.compensation}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-sm text-muted-foreground hidden md:block">
                      Apply by: {formatDeadline(opp.application_deadline)}
                    </span>
                    <Button variant="outline" size="sm">
                      Details
                      <ChevronRight className="ml-1 w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
