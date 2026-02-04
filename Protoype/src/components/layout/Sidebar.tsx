import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Clock,
  User,
  LogOut,
  Users,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  BookOpen,
  FolderKanban,
  X,
} from 'lucide-react';
import { useAuth } from '@/services/AuthContext';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface SidebarProps {
  userType: 'student' | 'admin';
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ userType, isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();

  const studentLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/timesheet', icon: Clock, label: 'Timesheets' },
    { to: '/documents', icon: FileText, label: 'Documents' },
    { to: '/programs', icon: FolderKanban, label: 'Programs' },
    { to: '/job-opportunities', icon: Briefcase, label: 'Job Opportunities' },
    { to: '/learning-hub', icon: BookOpen, label: 'Learning Hub' },
    { to: '/profile', icon: User, label: 'My Profile' },
  ];

  const adminLinks = [
    { to: '/admin', icon: LayoutDashboard, label: 'Overview' },
    { to: '/admin/students', icon: Users, label: 'Students' },
    { to: '/admin/approvals', icon: ShieldCheck, label: 'Approvals' },
    { to: '/admin/programs', icon: FolderKanban, label: 'Programs' },
    { to: '/admin/opportunities', icon: Briefcase, label: 'Opportunities' },
  ];

  const links = userType === 'admin' ? adminLinks : studentLinks;

  const initials = user?.full_name
    ? user.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : userType === 'student'
    ? 'JS'
    : 'AD';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-md transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-screen w-64 flex flex-col transition-transform duration-300 ease-in-out shadow-xl',
          'lg:translate-x-0 lg:shadow-none',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ background: 'var(--gradient-sidebar)' }}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2 text-white font-bold text-xl">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-glow transition-shadow duration-200">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="tracking-tight">WBLE Portal</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-white/60 hover:text-white transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/admin' || link.to === '/dashboard'}
              onClick={() => onClose()}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-primary/15 text-white border-l-2 border-l-primary shadow-sm'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                )
              }
            >
              <link.icon className="w-5 h-5 flex-shrink-0 transition-colors duration-200" />
              <span className="font-medium transition-colors duration-200">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-white/10 flex-shrink-0">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-white/60 hover:bg-white/5 hover:text-white transition-all duration-200"
          >
            <LogOut className="w-5 h-5 flex-shrink-0 transition-colors duration-200" />
            <span className="font-medium transition-colors duration-200">Sign Out</span>
          </button>

          <div className="mt-4 px-3 py-3 bg-white/5 backdrop-blur-sm rounded-lg flex items-center gap-3 border border-white/10 transition-colors duration-200">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.full_name || (userType === 'student' ? 'Student' : 'Admin')}
              </p>
              <Badge
                variant={userType === 'admin' ? 'default' : 'secondary'}
                className="text-[10px] px-1.5 py-0"
              >
                {userType}
              </Badge>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
