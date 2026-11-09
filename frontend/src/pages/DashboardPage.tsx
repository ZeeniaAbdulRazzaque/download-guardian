import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  ShieldCheck,
  UploadCloud,
  CheckCircle2,
  Lock,
  Binary,
  Layers,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { api } from '../services/api.js';
import { ReportItem } from '../types/index.js';
import { VerdictBadge } from '../components/ui/VerdictBadge.js';

export const DashboardPage: React.FC = () => {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.getReports(1, 5);
        setReports(res.reports || []);
      } catch (err) {
        console.error('Error fetching dashboard reports:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Dashboard</h1>
          <p className="text-xs text-text-secondary">
            On-demand file inspection station • 100% Stateless & Ephemeral (No database storage).
          </p>
        </div>
        <Link
          to="/analyze"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-md text-xs font-semibold hover:bg-brand-hover shadow-subtle transition-all self-start sm:self-auto"
        >
          <UploadCloud size={16} />
          <span>Analyze File Now</span>
        </Link>
      </div>

      {/* Feature / Architecture Metric Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-border rounded-lg p-5 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Storage Policy</span>
            <Lock size={18} className="text-brand" />
          </div>
          <div className="text-lg font-bold text-text-primary">Zero Retention</div>
          <span className="text-[11px] text-text-secondary mt-1">Binaries purged post-analysis</span>
        </div>

        <div className="bg-white border border-border rounded-lg p-5 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-status-safe">Engine Status</span>
            <ShieldCheck size={18} className="text-status-safe" />
          </div>
          <div className="text-lg font-bold text-text-primary">Stateless Core</div>
          <span className="text-[11px] text-text-secondary mt-1">Instant deterministic parsing</span>
        </div>

        <div className="bg-white border border-border rounded-lg p-5 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-accent">Static Analysis</span>
            <Binary size={18} className="text-accent" />
          </div>
          <div className="text-lg font-bold text-text-primary">Multi-Vector</div>
          <span className="text-[11px] text-text-secondary mt-1">Macros, PE, Extensions, Scripts</span>
        </div>

        <div className="bg-white border border-border rounded-lg p-5 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-700">Threat Intel</span>
            <Layers size={18} className="text-slate-700" />
          </div>
          <div className="text-lg font-bold text-text-primary">Hash Correlated</div>
          <span className="text-[11px] text-text-secondary mt-1">VirusTotal v3 API Ready</span>
        </div>
      </div>

      {/* Grid: Active Session Reports & Fast Start */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Session Reports */}
        <div className="lg:col-span-2 bg-white border border-border rounded-lg shadow-subtle overflow-hidden flex flex-col justify-between">
          <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <FileText size={16} className="text-brand" />
              <span>Active Session Dossiers</span>
            </h2>
            <Link to="/reports" className="text-xs text-brand font-medium hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div className="divide-y divide-border overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-xs text-text-secondary">Loading session telemetry...</div>
            ) : reports.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <p className="text-xs text-text-secondary">No files inspected in this session yet.</p>
                <Link
                  to="/analyze"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-brand text-white text-xs font-medium hover:bg-brand-hover shadow-sm"
                >
                  <UploadCloud size={14} />
                  <span>Inspect a File</span>
                </Link>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-bg text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                    <th className="py-2.5 px-4">Code</th>
                    <th className="py-2.5 px-4">File Name</th>
                    <th className="py-2.5 px-4">Verdict</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {reports.map((rep) => (
                    <tr key={rep.id} className="hover:bg-surface-hover transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] font-semibold text-brand">
                        {rep.report_reference_code}
                      </td>
                      <td className="py-3 px-4 font-medium text-text-primary max-w-[200px] truncate">
                        {rep.summary_payload?.file_info?.name || 'Unnamed'}
                      </td>
                      <td className="py-3 px-4">
                        <VerdictBadge verdict={rep.summary_payload?.verdict || 'PENDING'} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/analysis/${rep.scan_id}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
                        >
                          <span>Workbench</span>
                          <ExternalLink size={12} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Fast Upload CTA Box */}
        <div className="space-y-6">
          <div className="bg-white border border-border rounded-lg p-5 shadow-subtle space-y-3">
            <h2 className="text-sm font-semibold text-text-primary">Inspected File Types</h2>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-text-secondary">
                <CheckCircle2 size={14} className="text-brand shrink-0" />
                <span>Office Documents (Macros & AutoExec)</span>
              </div>
              <div className="flex items-center gap-2 text-text-secondary">
                <CheckCircle2 size={14} className="text-brand shrink-0" />
                <span>PDF Documents (Scripts & Actions)</span>
              </div>
              <div className="flex items-center gap-2 text-text-secondary">
                <CheckCircle2 size={14} className="text-brand shrink-0" />
                <span>Compressed Archives (ZIP, RAR, 7Z)</span>
              </div>
              <div className="flex items-center gap-2 text-text-secondary">
                <CheckCircle2 size={14} className="text-brand shrink-0" />
                <span>Binaries & Installers (EXE, DLL, APK)</span>
              </div>
            </div>
          </div>

          <div className="bg-brand-subtle border border-brand/20 rounded-lg p-5 text-center space-y-3">
            <h3 className="font-semibold text-xs text-brand uppercase tracking-wider">Fast On-Demand Scan</h3>
            <p className="text-xs text-text-secondary">
              Inspect any download before opening. Completely private and discarded after evaluation.
            </p>
            <Link
              to="/analyze"
              className="inline-block w-full py-2 bg-brand text-white text-xs font-semibold rounded-md hover:bg-brand-hover transition-colors shadow-sm"
            >
              Start Analysis
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
