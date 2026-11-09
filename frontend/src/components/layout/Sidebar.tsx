import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldCheck,
  FileText,
  Settings,
  HelpCircle,
  Lock,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/analyze', label: 'Analyze File', icon: ShieldCheck, highlight: true },
    { to: '/reports', label: 'Session Reports', icon: FileText },
    { to: '/settings', label: 'Settings', icon: Settings },
    { to: '/about', label: 'About & Scope', icon: HelpCircle },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:sticky top-16 left-0 z-40 w-64 h-[calc(100vh-4rem)] bg-white border-r border-border flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-6">
          {/* Main Navigation */}
          <div>
            <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider px-3 mb-2">
              Platform
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-brand text-white shadow-sm'
                          : 'text-text-secondary hover:text-text-primary hover:bg-surface-bg'
                      }`
                    }
                  >
                    <Icon size={18} className="shrink-0" />
                    <span>{item.label}</span>
                    {item.highlight && (
                      <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded bg-brand-subtle text-brand border border-brand/20">
                        Primary
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Privacy Architecture Notice */}
          <div className="p-3 bg-surface-bg border border-border rounded-lg text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-text-primary text-[11px]">
              <Lock size={14} className="text-brand" />
              <span>100% Stateless & Private</span>
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              No server database. Files and telemetry are inspected on-demand and purged immediately.
            </p>
          </div>
        </div>

        {/* Footer info in sidebar */}
        <div className="p-4 border-t border-border bg-slate-50/50 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-text-secondary">
            <span>Architecture</span>
            <span className="font-mono font-medium text-brand">Stateless MVP</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-text-secondary">
            <span>Threat Intel</span>
            <span className="text-status-safe font-medium">VirusTotal v3</span>
          </div>
        </div>
      </aside>
    </>
  );
};
