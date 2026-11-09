import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Copy,
  Check,
  FileText,
  Hash,
  Download,
  ArrowLeft,
  ExternalLink,
  Shield,
  Layers,
  Info,
  Clock,
  RotateCw,
} from 'lucide-react';
import { api } from '../services/api.js';
import { ScanDetails } from '../types/index.js';
import { VerdictBadge } from '../components/ui/VerdictBadge.js';

export const AnalysisResultsPage: React.FC = () => {
  const { scanId } = useParams<{ scanId: string }>();
  const [scan, setScan] = useState<ScanDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!scanId) return;

    const fetchScan = async () => {
      try {
        setLoading(true);
        const data = await api.getScanDetails(scanId);
        setScan(data);
      } catch (err: any) {
        setError(err.response?.data?.error?.message || 'Failed to load analysis report.');
      } finally {
        setLoading(false);
      }
    };

    fetchScan();
  }, [scanId]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(label);
    setTimeout(() => {
      setCopiedHash(null);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-10 h-10 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-medium text-text-secondary">Loading security assessment dossier...</p>
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="py-12 max-w-lg mx-auto text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-status-danger-bg text-status-danger flex items-center justify-center mx-auto">
          <AlertOctagon size={24} />
        </div>
        <h2 className="text-base font-bold text-text-primary">Report Not Found</h2>
        <p className="text-xs text-text-secondary">{error || 'Could not find the requested scan record.'}</p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-brand text-white text-xs font-medium"
        >
          <ArrowLeft size={14} />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  const { verdict, risk_score, file, hashes, threat_indicators, recommendations, threat_intelligence } = scan;

  return (
    <div className="space-y-6">
      {/* Top Header / Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="text-text-secondary hover:text-text-primary text-xs flex items-center gap-1">
              <ArrowLeft size={14} />
              <span>Dashboard</span>
            </Link>
            <span className="text-text-muted">/</span>
            <span className="text-xs font-mono font-semibold text-text-primary">
              {scan.report_reference_code || `SCAN-${scan.scan_id.substring(0, 8)}`}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary">
            Security Assessment Report
          </h1>
          <div className="flex items-center gap-3 text-[11px] text-text-secondary">
            <span>Analyzed: {new Date(scan.started_at).toUTCString()}</span>
            <span>•</span>
            <span>Status: {scan.status}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <a
            href={api.getReportDownloadUrl(scan.scan_id)}
            download
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-white border border-border text-text-primary text-xs font-medium hover:bg-surface-bg shadow-sm transition-colors"
          >
            <Download size={14} />
            <span>Export Official Dossier (JSON)</span>
          </a>
          <Link
            to="/analyze"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-brand text-white text-xs font-medium hover:bg-brand-hover shadow-sm transition-colors"
          >
            <RotateCw size={14} />
            <span>Inspect Another File</span>
          </Link>
        </div>
      </div>

      {/* VERDICT BANNER (Tristate) */}
      <div
        className={`p-6 rounded-lg border shadow-subtle ${
          verdict === 'SAFE'
            ? 'bg-status-safe-bg border-status-safe-border'
            : verdict === 'SUSPICIOUS'
            ? 'bg-status-warning-bg border-status-warning-border'
            : 'bg-status-danger-bg border-status-danger-border'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <VerdictBadge verdict={verdict} size="lg" />
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Inspection Verdict
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-text-primary">
              {verdict === 'SAFE'
                ? 'Safe — Zero Significant Indicators Identified'
                : verdict === 'SUSPICIOUS'
                ? 'Suspicious — Potential Security Concerns Identified'
                : 'Potentially Malicious — Multiple High-Risk Indicators Flagged'}
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary max-w-3xl leading-relaxed">
              {scan.verdict_summary}
            </p>
          </div>

          {/* Risk Score Widget */}
          <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 md:border-l border-black/10 pt-3 md:pt-0 md:pl-6 shrink-0">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
              Risk Score
            </span>
            <div className="flex items-baseline gap-1">
              <span
                className={`text-3xl font-extrabold ${
                  verdict === 'SAFE'
                    ? 'text-status-safe'
                    : verdict === 'SUSPICIOUS'
                    ? 'text-status-warning'
                    : 'text-status-danger'
                }`}
              >
                {risk_score}
              </span>
              <span className="text-xs text-text-secondary">/ 100</span>
            </div>
          </div>
        </div>
      </div>

      {/* TWO-COLUMN FORENSIC WORKBENCH */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Primary Findings (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Security Recommendations Checklist */}
          <div className="bg-white border border-border rounded-lg p-5 shadow-subtle space-y-4">
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-brand" />
              <h3 className="text-sm font-bold text-text-primary">Security Recommendations</h3>
            </div>
            <div className="space-y-2.5">
              {recommendations.length === 0 ? (
                <p className="text-xs text-text-secondary">No special actions required for this artifact.</p>
              ) : (
                recommendations.map((rec, i) => (
                  <div key={rec.id || i} className="p-3 bg-surface-bg rounded-md border border-border text-xs space-y-1">
                    <div className="font-semibold text-text-primary flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-brand text-white flex items-center justify-center text-[10px]">
                        {rec.priority_order || i + 1}
                      </span>
                      <span>{rec.title}</span>
                    </div>
                    <p className="text-text-secondary pl-6 leading-relaxed">
                      {rec.action_instruction}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Threat Indicator Cards */}
          <div className="bg-white border border-border rounded-lg p-5 shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-accent" />
                <h3 className="text-sm font-bold text-text-primary">Threat Indicators Flagged</h3>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-text-secondary">
                {threat_indicators.length} {threat_indicators.length === 1 ? 'Finding' : 'Findings'}
              </span>
            </div>

            {threat_indicators.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-status-safe-border bg-status-safe-bg/40 rounded-lg space-y-1">
                <ShieldCheck size={24} className="text-status-safe mx-auto" />
                <span className="text-xs font-semibold text-status-safe block">No Threat Indicators Triggered</span>
                <span className="text-[11px] text-text-secondary">Static heuristics found no suspicious markers or deceptive extensions.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {threat_indicators.map((ind) => (
                  <div
                    key={ind.id}
                    className="p-4 rounded-lg border border-border bg-surface-bg space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-xs font-bold text-text-primary">{ind.title}</h4>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                          ind.severity === 'CRITICAL' || ind.severity === 'HIGH'
                            ? 'bg-status-danger-bg text-status-danger border border-status-danger-border'
                            : ind.severity === 'MEDIUM'
                            ? 'bg-status-warning-bg text-status-warning border border-status-warning-border'
                            : 'bg-slate-100 text-text-secondary border border-slate-200'
                        }`}
                      >
                        {ind.severity}
                      </span>
                    </div>

                    <p className="text-xs text-text-secondary leading-relaxed">
                      <strong className="text-text-primary font-medium">Description: </strong>
                      {ind.description}
                    </p>

                    <div className="p-2.5 rounded bg-white border border-border text-[11px] space-y-1">
                      <div className="text-text-primary">
                        <strong className="text-accent font-semibold">Risk Analysis: </strong>
                        {ind.risk_explanation}
                      </div>
                      <div className="text-text-secondary">
                        <strong className="text-brand font-semibold">Recommended Action: </strong>
                        {ind.recommended_action}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Telemetry & Hashes (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* File Attributes Card */}
          <div className="bg-white border border-border rounded-lg p-5 shadow-subtle space-y-4">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-brand" />
              <h3 className="text-sm font-bold text-text-primary">File Attributes</h3>
            </div>

            <div className="divide-y divide-border text-xs">
              <div className="py-2.5 flex justify-between gap-2">
                <span className="text-text-secondary">Original File Name</span>
                <span className="font-semibold text-text-primary truncate max-w-[200px]" title={file?.original_name}>
                  {file?.original_name || 'N/A'}
                </span>
              </div>
              <div className="py-2.5 flex justify-between gap-2">
                <span className="text-text-secondary">File Size</span>
                <span className="font-mono text-text-primary">
                  {file ? `${(file.size_bytes / 1024).toFixed(1)} KB (${file.size_bytes.toLocaleString()} bytes)` : 'N/A'}
                </span>
              </div>
              <div className="py-2.5 flex justify-between gap-2">
                <span className="text-text-secondary">Reported Extension</span>
                <span className="font-mono uppercase text-text-primary">
                  .{file?.extension || 'unknown'}
                </span>
              </div>
              <div className="py-2.5 flex justify-between gap-2">
                <span className="text-text-secondary">Detected MIME</span>
                <span className="font-mono text-[11px] text-text-primary bg-slate-100 px-1.5 py-0.5 rounded">
                  {file?.detected_mime || 'application/octet-stream'}
                </span>
              </div>
              <div className="py-2.5 flex justify-between gap-2">
                <span className="text-text-secondary">Magic Byte Signature</span>
                <span className="font-mono text-[11px] text-brand">
                  {file?.magic_byte_signature || 'Generic / Matched'}
                </span>
              </div>
            </div>
          </div>

          {/* Cryptographic Digests Card */}
          <div className="bg-white border border-border rounded-lg p-5 shadow-subtle space-y-4">
            <div className="flex items-center gap-2">
              <Hash size={18} className="text-brand" />
              <h3 className="text-sm font-bold text-text-primary">Cryptographic Digests</h3>
            </div>

            <div className="space-y-3">
              {/* SHA-256 */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-text-secondary">SHA-256</span>
                  <button
                    onClick={() => copyToClipboard(hashes?.sha256 || '', 'sha256')}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-brand hover:underline"
                  >
                    {copiedHash === 'sha256' ? (
                      <>
                        <Check size={12} className="text-status-safe" />
                        <span className="text-status-safe">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-2.5 rounded bg-surface-bg border border-border font-mono text-[11px] text-text-primary break-all select-all">
                  {hashes?.sha256 || 'N/A'}
                </div>
              </div>

              {/* MD5 */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-text-secondary">MD5</span>
                  <button
                    onClick={() => copyToClipboard(hashes?.md5 || '', 'md5')}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-brand hover:underline"
                  >
                    {copiedHash === 'md5' ? (
                      <>
                        <Check size={12} className="text-status-safe" />
                        <span className="text-status-safe">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-2.5 rounded bg-surface-bg border border-border font-mono text-[11px] text-text-primary break-all select-all">
                  {hashes?.md5 || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* VirusTotal Threat Intel Consensus Card */}
          <div className="bg-white border border-border rounded-lg p-5 shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-brand" />
                <h3 className="text-sm font-bold text-text-primary">Threat Intelligence</h3>
              </div>
              <span className="text-[10px] font-semibold text-text-secondary uppercase">VirusTotal v3</span>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-surface-bg rounded-md border border-border space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-text-secondary">Vendor Detection Ratio</span>
                  <span className="font-bold text-text-primary">
                    {threat_intelligence ? `${threat_intelligence.positives} / ${threat_intelligence.total_engines || 70}` : '0 / 70'}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden flex">
                  <div
                    className="bg-status-danger h-2"
                    style={{
                      width: threat_intelligence && threat_intelligence.total_engines > 0
                        ? `${(threat_intelligence.positives / threat_intelligence.total_engines) * 100}%`
                        : '0%',
                    }}
                  ></div>
                  <div className="bg-status-safe h-2 flex-1"></div>
                </div>
              </div>

              <div className="text-xs text-text-secondary leading-relaxed">
                <strong className="text-text-primary font-medium">Status: </strong>
                {threat_intelligence?.classification || 'Looked up by SHA-256 hash. Zero raw bytes shared.'}
              </div>

              {threat_intelligence?.permalink && (
                <a
                  href={threat_intelligence.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-brand font-medium hover:underline pt-1"
                >
                  <span>View Full VirusTotal Community Report</span>
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

