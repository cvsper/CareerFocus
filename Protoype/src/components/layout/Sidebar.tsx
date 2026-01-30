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
  X } from
'lucide-react';
interface SidebarProps {
  userType: 'student' | 'admin';
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}
export function Sidebar({ userType, onLogout, isOpen, onClose }: SidebarProps) {
  const studentLinks = [
  {
    to: '/dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard'
  },
  {
    to: '/timesheet',
    icon: Clock,
    label: 'Timesheets'
  },
  {
    to: '/documents',
    icon: FileText,
    label: 'Documents'
  },
  {
    to: '/programs',
    icon: FolderKanban,
    label: 'Programs'
  },
  {
    to: '/job-opportunities',
    icon: Briefcase,
    label: 'Job Opportunities'
  },
  {
    to: '/learning-hub',
    icon: BookOpen,
    label: 'Learning Hub'
  },
  {
    to: '/profile',
    icon: User,
    label: 'My Profile'
  }];

  const adminLinks = [
  {
    to: '/admin',
    icon: LayoutDashboard,
    label: 'Overview'
  },
  {
    to: '/admin/students',
    icon: Users,
    label: 'Students'
  },
  {
    to: '/admin/approvals',
    icon: ShieldCheck,
    label: 'Approvals'
  }];

  const links = userType === 'admin' ? adminLinks : studentLinks;
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen &&
      <div
        className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
        onClick={onClose} />

      }

      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out shadow-xl
          lg:translate-x-0 lg:shadow-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>

        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2 text-white font-bold text-xl">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span>WBLE Portal</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white transition-colors">

            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {links.map((link) =>
          <NavLink
            key={link.to}
            to={link.to}
            onClick={() => onClose()} // Close sidebar on mobile when link clicked
            className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'hover:bg-slate-800 hover:text-white'}
              `}>

              <link.icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{link.label}</span>
            </NavLink>
          )}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-slate-800 flex-shrink-0">
          <button
            onClick={onLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">

            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">Sign Out</span>
          </button>

          <div className="mt-4 px-3 py-2 bg-slate-800 rounded-lg">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
              Logged in as
            </p>
            <p className="text-sm font-bold text-white capitalize">
              {userType}
            </p>
          </div>
        </div>
      </aside>
    </>);

}