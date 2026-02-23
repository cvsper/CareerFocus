import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MoreHorizontal,
  Mail,
  Eye,
  CheckCircle,
  Users,
  UserX,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { StatCard } from '@/components/ui/stat-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { FilterBar } from '@/components/ui/filter-bar';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { api, User } from '@/services/api';

type StatusFilter = 'all' | 'active' | 'inactive';
type RoleFilter = 'all' | 'wble_participant' | 'ttw_participant' | 'contractor' | 'employee';

const ROLE_LABELS: Record<string, string> = {
  wble_participant: 'WBLE',
  ttw_participant: 'TTW',
  contractor: 'Contractor',
  employee: 'Employee',
  student: 'WBLE',
};

const ROLE_COLORS: Record<string, string> = {
  wble_participant: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  ttw_participant: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  contractor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  employee: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  student: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
};

export function AdminStudentList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');

  useEffect(() => {
    async function fetchStudents() {
      setLoading(true);
      const { data } = await api.getStudents();
      if (data) {
        setStudents(data);
      }
      setLoading(false);
    }
    fetchStudents();
  }, []);

  const getInitials = (user: User) => {
    return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase();
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && student.is_active) ||
      (statusFilter === 'inactive' && !student.is_active);

    const matchesRole =
      roleFilter === 'all' ||
      student.role === roleFilter ||
      (roleFilter === 'wble_participant' && student.role === 'student');

    return matchesSearch && matchesStatus && matchesRole;
  });

  const activeCount = students.filter((s) => s.is_active).length;
  const inactiveCount = students.filter((s) => !s.is_active).length;

  const statusFilterOptions: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  const roleFilterOptions: { value: RoleFilter; label: string }[] = [
    { value: 'all', label: 'All Roles' },
    { value: 'wble_participant', label: 'WBLE' },
    { value: 'ttw_participant', label: 'TTW' },
    { value: 'contractor', label: 'Contractor' },
    { value: 'employee', label: 'Employee' },
  ];

  // --- Loading state ---
  if (loading) {
    return (
      <DashboardLayout title="User Management">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                  <Skeleton className="h-12 w-12 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-10 w-full max-w-sm mb-6" />
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-48 hidden md:block" />
                  <Skeleton className="h-5 w-16 hidden md:block" />
                  <Skeleton className="h-4 w-24 hidden md:block" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  // --- Render mobile card for a single student ---
  function StudentMobileCard({ student }: { student: User }) {
    return (
      <Card
        className="cursor-pointer"
        onClick={() => navigate(`/admin/students/${student.id}`)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                  {getInitials(student)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-medium text-foreground truncate">
                  {student.first_name} {student.last_name}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {student.email}
                </p>
                {student.phone && (
                  <p className="text-xs text-muted-foreground">{student.phone}</p>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[student.role] || ROLE_COLORS.student}`}>
                {ROLE_LABELS[student.role] || student.role}
              </span>
              <Badge variant={student.is_active ? 'success' : 'secondary'}>
                {student.is_active ? 'Active' : 'Inactive'}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/admin/students/${student.id}`);
                    }}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `mailto:${student.email}`;
                    }}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Send Email
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>Joined {new Date(student.created_at).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <DashboardLayout title="User Management">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 animate-fade-in">
        <StatCard
          title="Total Users"
          value={students.length}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          title="Active"
          value={activeCount}
          icon={<CheckCircle className="h-5 w-5" />}
        />
        <StatCard
          title="Inactive"
          value={inactiveCount}
          icon={<UserX className="h-5 w-5" />}
        />
      </div>

      {/* Search and Filters */}
      <div className="mb-6 animate-fade-in animate-delay-100">
        <FilterBar
          searchPlaceholder="Search users by name or email..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          filters={
            <div className="flex flex-wrap gap-2">
              {roleFilterOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={roleFilter === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setRoleFilter(option.value)}
                >
                  {option.label}
                </Button>
              ))}
              <div className="w-px bg-border mx-1" />
              {statusFilterOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={statusFilter === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          }
        />
      </div>

      {/* Student List */}
      {filteredStudents.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={<Users className="h-6 w-6" />}
              title="No users found"
              description={
                students.length === 0
                  ? 'No users have registered yet.'
                  : 'Try adjusting your search or filters.'
              }
            />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile card view */}
          <div className="space-y-3 md:hidden animate-fade-in animate-delay-200">
            {filteredStudents.map((student) => (
              <StudentMobileCard key={student.id} student={student} />
            ))}
            <p className="text-sm text-muted-foreground text-center pt-2">
              Showing {filteredStudents.length} of {students.length} users
            </p>
          </div>

          {/* Desktop table view */}
          <Card className="hidden md:block overflow-hidden animate-fade-in animate-delay-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id} className="group hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <div
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => navigate(`/admin/students/${student.id}`)}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gradient-to-br from-primary/10 to-accent/10 text-primary text-xs font-semibold">
                            {getInitials(student)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground hover:text-primary transition-colors">
                            {student.first_name} {student.last_name}
                          </p>
                          {student.phone && (
                            <p className="text-xs text-muted-foreground">
                              {student.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {student.email}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[student.role] || ROLE_COLORS.student}`}>
                        {ROLE_LABELS[student.role] || student.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={student.is_active ? 'success' : 'secondary'}>
                        {student.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(student.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              navigate(`/admin/students/${student.id}`)
                            }
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              (window.location.href = `mailto:${student.email}`)
                            }
                          >
                            <Mail className="mr-2 h-4 w-4" />
                            Send Email
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="p-4 border-t border-border flex justify-between items-center text-sm text-muted-foreground">
              <span>
                Showing {filteredStudents.length} of {students.length} users
              </span>
            </div>
          </Card>
        </>
      )}
    </DashboardLayout>
  );
}
