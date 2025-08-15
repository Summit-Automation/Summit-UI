'use client';

import { useState } from 'react';
import { Search, Bell, Settings, HelpCircle, Command } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  showSearch?: boolean;
  className?: string;
  onNotifications?: () => void;
  onHelp?: () => void;
  onSettings?: () => void;
}

export function Header({ 
  title = "Welcome back", 
  subtitle,
  actions,
  showSearch = true,
  className,
  onNotifications,
  onHelp,
  onSettings
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
        "sticky top-0 z-30 w-full border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl",
        className
      )}
      onKeyDown={handleKeyboardShortcut}
    >
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left section */}
        <div className="flex items-center gap-4 lg:gap-6 min-w-0">
          <div className="flex flex-col min-w-0">
            <h1 className="text-lg font-semibold text-slate-50 truncate">{title}</h1>
            {subtitle && (
              <p className="text-sm text-slate-400 truncate">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Center - Search */}
        {showSearch && (
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search automation, customers, tasks..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={handleSearch}
                className="w-full pl-10 pr-16 bg-slate-900/50 border-slate-700/50 hover:border-slate-600 focus:border-blue-500 focus:ring-blue-500/20 text-slate-50 placeholder-slate-400 rounded-xl h-10"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <kbd className="pointer-events-none hidden h-6 select-none items-center gap-1 rounded-md border border-slate-700/50 bg-slate-800/50 px-2 font-mono text-[11px] font-medium text-slate-400 sm:flex">
                  <Command className="h-3 w-3" />K
                </kbd>
              </div>
            </div>
          </div>
        )}

        {/* Right section */}
        <div className="flex items-center gap-1 lg:gap-2">
          {actions}
          
          {/* Mobile search */}
          {showSearch && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden text-slate-400 hover:text-slate-200"
              onClick={() => {
                // TODO: Open mobile search modal
              }}
            >
              <Search className="h-4 w-4" />
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-slate-400 hover:text-slate-200 relative"
            onClick={onNotifications}
          >
            <Bell className="h-4 w-4" />
            {/* Notification badge */}
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-blue-500 rounded-full"></span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-slate-400 hover:text-slate-200"
            onClick={onHelp}
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-slate-400 hover:text-slate-200"
            onClick={onSettings}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}