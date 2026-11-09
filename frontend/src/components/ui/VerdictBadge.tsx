import React from 'react';
import { VerdictType } from '../../types/index.js';
import { ShieldCheck, AlertTriangle, AlertOctagon, Clock } from 'lucide-react';

interface VerdictBadgeProps {
  verdict: VerdictType;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const VerdictBadge: React.FC<VerdictBadgeProps> = ({
  verdict,
  showIcon = true,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5',
  };

  const iconSize = size === 'sm' ? 12 : size === 'md' ? 14 : 16;

  switch (verdict) {
    case 'SAFE':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider rounded-full border bg-status-safe-bg text-status-safe border-status-safe-border ${sizeClasses[size]}`}
        >
          {showIcon && <ShieldCheck size={iconSize} />}
          Safe
        </span>
      );
    case 'SUSPICIOUS':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider rounded-full border bg-status-warning-bg text-status-warning border-status-warning-border ${sizeClasses[size]}`}
        >
          {showIcon && <AlertTriangle size={iconSize} />}
          Suspicious
        </span>
      );
    case 'POTENTIALLY_MALICIOUS':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider rounded-full border bg-status-danger-bg text-status-danger border-status-danger-border ${sizeClasses[size]}`}
        >
          {showIcon && <AlertOctagon size={iconSize} />}
          Potentially Malicious
        </span>
      );
    case 'PENDING':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium uppercase tracking-wider rounded-full border bg-slate-100 text-slate-600 border-slate-200 ${sizeClasses[size]}`}
        >
          {showIcon && <Clock size={iconSize} />}
          Analyzing...
        </span>
      );
  }
};

