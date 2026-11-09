import React, { useState } from 'react';
import { Shield, Search, Bell, Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/reports?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-border sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between shadow-subtle">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 text-text-secondary hover:text-text-primary rounded-md"
            aria-label="Toggle Navigation"
          >
            <Menu size={20} />
          </button>
        )}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-md bg-brand flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
            <Shield size={20} className="stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-text-primary text-base leading-tight tracking-tight">
              Download Guardian
            </span>
            <span className="text-[10px] text-text-secondary uppercase tracking-widest font-semibold">
              Threat Assessment
            </span>
          </div>
        </Link>
      </div>

      {/* Global Quick Search */}
      <form onSubmit={handleSearch} className="hidden md:flex items-center max-w-md w-full mx-6">
        <div className="relative w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search active reports by reference code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-surface-bg border border-border rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors"
          />
        </div>
      </form>

      {/* User & Platform Telemetry Controls */}
      <div className="flex items-center gap-3">
        {/* Engine status indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-surface-bg border border-border rounded-full text-xs text-text-secondary">
          <span className="w-2 h-2 rounded-full bg-status-safe animate-pulse"></span>
          <span className="font-medium text-[11px]">Stateless Engine Active</span>
        </div>

        {/* Notifications */}
        <button
          className="relative p-2 text-text-secondary hover:text-text-primary hover:bg-surface-bg rounded-md transition-colors"
          title="Security Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent"></span>
        </button>

        {/* User Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-border">
          <div className="w-8 h-8 rounded-full bg-brand-subtle text-brand border border-brand/20 flex items-center justify-center font-semibold text-xs">
            DG
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-semibold text-text-primary leading-tight">Security Analyst</span>
            <span className="text-[10px] text-text-secondary">Private Session</span>
          </div>
        </div>
      </div>
    </header>
  );
};
