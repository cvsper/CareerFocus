import React from 'react';
import { Bell, Search, Menu } from 'lucide-react';
interface HeaderProps {
  title: string;
  userType: 'student' | 'admin';
  onMenuClick: () => void;
}
export function Header({ title, userType, onMenuClick }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden"
          aria-label="Open menu">

          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-slate-900 truncate max-w-[200px] sm:max-w-none">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search..."
            className="h-9 pl-9 pr-4 rounded-full bg-slate-100 border-none text-sm focus:ring-2 focus:ring-blue-500 w-64 transition-all" />

        </div>

        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
          {userType === 'student' ? 'JS' : 'AD'}
        </div>
      </div>
    </header>);

}