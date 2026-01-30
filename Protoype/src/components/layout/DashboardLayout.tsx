import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  userType: 'student' | 'admin';
  onLogout: () => void;
}
export function DashboardLayout({
  children,
  title,
  userType,
  onLogout
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar
        userType={userType}
        onLogout={onLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)} />


      <div className="flex-1 flex flex-col min-h-screen transition-all duration-300 lg:ml-64 w-full">
        <Header
          title={title}
          userType={userType}
          onMenuClick={() => setSidebarOpen(true)} />


        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>);

}