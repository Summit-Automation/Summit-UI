'use client';

import { useState } from 'react';
import { Search, Settings, HelpCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  showSearch?: boolean;
  className?: string;
  onHelp?: () => void;
  onSettings?: () => void;
  userName?: string;
  userRole?: string;
}

export function Header({ 
  title = "Welcome back", 
  subtitle,
  actions,
  showSearch = false,
  className,
  onHelp,
  onSettings,
  userName,
  userRole
}: HeaderProps) {
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      // TODO: Implement search functionality
    }
  };

  const handleKeyboardShortcut = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
      searchInput?.focus();
    }
  };

  return (
    <header 
      className={cn(
        "sticky top-0 z-30 w-full border-b border-slate-800/30 bg-slate-950/95 backdrop-blur-xl shadow-sm",
        className
      )}
      onKeyDown={handleKeyboardShortcut}
    >
      <div className="flex h-20 items-center justify-between px-6 lg:px-8">
        {/* Left section - Title/Branding */}
        <div className="flex items-center gap-4 lg:gap-6 min-w-0">
          <div className="flex flex-col min-w-0">
            <h1 className="text-xl font-bold text-slate-50 truncate tracking-tight">{title}</h1>
            {subtitle && (
              <p className="text-sm text-slate-400 truncate font-medium">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Center - Enhanced Search */}
        {showSearch && (
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search or jump to..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={handleSearch}
                className="w-full pl-12 pr-20 bg-slate-900/60 border-slate-700/40 hover:border-slate-600/60 focus:border-blue-500/60 focus:ring-blue-500/20 text-slate-50 placeholder-slate-400 rounded-2xl h-12 text-sm font-medium shadow-lg transition-all duration-200 hover:shadow-xl focus:shadow-xl"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <kbd className="pointer-events-none hidden h-7 select-none items-center gap-1 rounded-lg border border-slate-700/50 bg-slate-800/50 px-2.5 font-mono text-[11px] font-medium text-slate-400 sm:flex shadow-sm">
                  <span className="text-[10px]">Ctrl</span>
                  <span className="text-slate-600">+</span>
                  <span>K</span>
                </kbd>
              </div>
            </div>
          </div>
        )}

        {/* Right section - Enhanced Actions */}
        <div className="flex items-center gap-2 lg:gap-3">
          {actions}
          
          {/* Mobile search */}
          {showSearch && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-xl h-10 w-10"
              onClick={() => {
                // TODO: Open mobile search modal
              }}
            >
              <Search className="h-5 w-5" />
            </Button>
          )}
          
          
          {/* Help */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-xl h-10 w-10 transition-all duration-200"
            onClick={onHelp}
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
          
          {/* Settings */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-xl h-10 w-10 transition-all duration-200"
            onClick={onSettings}
          >
            <Settings className="h-5 w-5" />
          </Button>

          {/* User Profile Indicator */}
          {userName && (
            <div className="hidden lg:flex items-center gap-3 pl-3 border-l border-slate-700/50">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-200">{userName}</p>
                {userRole && (
                  <p className="text-xs text-slate-400 font-medium">{userRole}</p>
                )}
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg ring-2 ring-blue-500/20">
                <User className="h-5 w-5 text-white" />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}