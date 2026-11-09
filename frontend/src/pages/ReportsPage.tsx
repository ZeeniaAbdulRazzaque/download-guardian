import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Search, Download, ExternalLink, Calendar, Shield } from 'lucide-react';
import { api } from '../services/api.js';
import { ReportItem } from '../types/index.js';
import { VerdictBadge } from '../components/ui/VerdictBadge.js';

export const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const data = await api.getReports(1, 20);
        setReports(data.reports || []);
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const filtered = reports.filter((r) => {
    const codeMatch = r.report_reference_code.toLowerCase().includes(search.toLowerCase());
    const fileMatch = r.summary_payload?.file_info?.name?.toLowerCase().includes(search.toLowerCase());
    return codeMatch || fileMatch;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Security Reports</h1>
          <p className="text-xs text-text-secondary">
            Formal assessment dossiers, compliance verifications, and downloadable summaries.
          </p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-4 bg-white border border-border rounded-lg shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search reports by code (DG-2026-...) or file name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-surface-bg border border-border rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:border-brand"
          />
        </div>
        <div className="text-xs text-text-secondary self-start sm:self-auto">
          Showing {filtered.length} of {reports.length} Reports
        </div>
      </div>

      {/* Reports Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-text-secondary">Loading security reports...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white border border-border rounded-lg shadow-subtle space-y-3">
          <FileText size={32} className="text-text-muted mx-auto" />
          <h3 className="text-sm font-semibold text-text-primary">No Reports Found</h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            {search ? 'No reports match your search criteria.' : 'Inspect a file to generate your first official security assessment report.'}
          </p>
          <Link
            to="/analyze"
            className="inline-block px-4 py-2 bg-brand text-white text-xs font-medium rounded-md hover:bg-brand-hover"
          >
            Analyze a File
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((rep) => {
            const payload = rep.summary_payload;
            const fileInfo = payload?.file_info || {};
            const verdict = payload?.verdict || 'PENDING';
            const riskScore = payload?.risk_score ?? 0;

            return (
              <div
                key={rep.id}
                className="bg-white border border-border rounded-lg p-5 shadow-subtle flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-brand bg-brand-subtle px-2 py-0.5 rounded border border-brand/20">
                      {rep.report_reference_code}
                    </span>
                    <VerdictBadge verdict={verdict} size="sm" />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-text-primary truncate" title={fileInfo.name}>
                      {fileInfo.name || 'Unnamed Artifact'}
                    </h3>
                    <div className="flex items-center gap-3 text-[11px] text-text-secondary mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(rep.generated_at).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span>Risk Score: {riskScore}/100</span>
                      <span>•</span>
                      <span className="uppercase font-mono">{fileInfo.extension || 'bin'}</span>
                    </div>
                  </div>

                  <p className="text-xs text-text-secondary line-clamp-2">
                    {payload?.verdict_summary || 'Standard pre-execution static inspection complete.'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <Link
                    to={`/analysis/${rep.scan_id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline"
                  >
                    <span>View Dossier</span>
                    <ExternalLink size={12} />
                  </Link>
                  <a
                    href={api.getReportDownloadUrl(rep.scan_id)}
                    download
                    className="inline-flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary bg-surface-bg px-2.5 py-1.5 rounded border border-border"
                  >
                    <Download size={12} />
                    <span>Download JSON</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

