import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '@/services/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const userType = user?.role || 'wble_participant';

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar
        userType={userType}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-h-screen transition-all duration-300 lg:ml-64 w-full">
        <Header
          title={title}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto relative animate-fade-in">
          {/* Faint radial gradient at top */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute top-0 left-0 right-0 h-96 bg-[radial-gradient(ellipse_at_top,hsl(215_65%_42%/0.03),transparent_50%)]" />
          </div>
          <div className="max-w-7xl mx-auto animate-fade-in-up relative">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
