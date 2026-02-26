import React from 'react';
import { Menu } from 'lucide-react';
import { useAuth } from '@/services/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export function Header({ title, onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const initials = user?.full_name
    ? user.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : isAdmin
    ? 'AD'
    : 'U';

  return (
    <header className="h-16 bg-card/80 backdrop-blur-xl border-b border-border/50 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-20 supports-[backdrop-filter]:bg-card/60">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="-ml-2 lg:hidden transition-all duration-200"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </Button>
        <h1 className="text-xl font-semibold text-foreground truncate max-w-[200px] sm:max-w-none">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full hover:ring-2 hover:ring-primary/20 transition-all duration-200">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.full_name || 'User'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || ''}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {!isAdmin && (
              <DropdownMenuItem onClick={() => navigate('/profile')} className="transition-colors duration-200">
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="transition-colors duration-200">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
