import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  FileSearch,
  Binary,
  Layers,
  ArrowRight,
  Info,
  CheckCircle2,
  FileText,
  Archive,
  Terminal,
  Smartphone,
  Check,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const formats = [
    { ext: 'PDF', label: 'PDF Documents', desc: 'Embedded scripts & launch actions' },
    { ext: 'DOCX / XLSX', label: 'Office Files', desc: 'VBA macros & AutoOpen triggers' },
    { ext: 'ZIP / RAR / 7z', label: 'Archives', desc: 'Nested executables & path traversal' },
    { ext: 'EXE / DLL', label: 'Windows Binaries', desc: 'PE structural headers & packing' },
    { ext: 'APK', label: 'Android Packages', desc: 'Permissions & package integrity' },
  ];

  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-6 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-subtle text-brand border border-brand/20 text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck size={14} />
          Intelligent File Inspection Platform
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-text-primary leading-tight">
          Know What's Inside <br />
          <span className="text-brand">Before You Open It</span>
        </h1>

        <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
          Analyze downloaded files using metadata inspection, static analysis, and threat intelligence to identify potential security risks before execution.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            to="/analyze"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-brand text-white font-medium text-sm hover:bg-brand-hover shadow-sm transition-all"
          >
            <span>Analyze File Now</span>
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/about"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-white border border-border text-text-primary font-medium text-sm hover:bg-surface-bg transition-colors"
          >
            <span>Platform Scope & FAQ</span>
          </Link>
        </div>

        {/* Explicit Scope Disclaimer */}
        <div className="p-4 bg-white border border-border rounded-lg text-left shadow-subtle flex items-start gap-3 mt-8">
          <Info size={18} className="text-accent shrink-0 mt-0.5" />
          <div className="text-xs text-text-secondary leading-relaxed">
            <span className="font-semibold text-text-primary">Important System Scope: </span>
            Download Guardian is an intelligent file inspection and threat assessment platform designed for pre-execution evaluation. We do not provide real-time background antivirus interception, malware removal, or endpoint agent protection.
          </div>
        </div>
      </section>

      {/* Three Pillars Section */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">
            How Download Guardian Inspects Files
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Deterministic, non-executing static analysis combined with global intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-border rounded-lg p-6 shadow-subtle space-y-3">
            <div className="w-10 h-10 rounded-md bg-brand-subtle text-brand flex items-center justify-center">
              <FileSearch size={22} />
            </div>
            <h3 className="text-base font-semibold text-text-primary">01. Metadata Forensics</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Examines physical magic bytes, true binary MIME signatures, creation timestamps, and flags deceptive double extension tricks (e.g. <code>.pdf.exe</code>).
            </p>
          </div>

          <div className="bg-white border border-border rounded-lg p-6 shadow-subtle space-y-3">
            <div className="w-10 h-10 rounded-md bg-accent-subtle text-accent flex items-center justify-center">
              <Binary size={22} />
            </div>
            <h3 className="text-base font-semibold text-text-primary">02. Static Heuristics</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Parses internal streams for embedded VBA macros in documents, shell launch triggers (PowerShell, cmd), and structural packing anomalies without execution.
            </p>
          </div>

          <div className="bg-white border border-border rounded-lg p-6 shadow-subtle space-y-3">
            <div className="w-10 h-10 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center">
              <Layers size={22} />
            </div>
            <h3 className="text-base font-semibold text-text-primary">03. Threat Intelligence</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Generates cryptographic digests (SHA-256) and correlates reputational data via VirusTotal API v3 consensus without ever uploading raw file contents.
            </p>
          </div>
        </div>
      </section>

      {/* Supported Formats Grid */}
      <section className="bg-white border border-border rounded-lg p-6 sm:p-8 shadow-subtle space-y-6">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Supported File Formats</h2>
          <p className="text-xs text-text-secondary mt-1">
            Inspecting the most common attack vectors delivered via web downloads and email attachments.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {formats.map((f, i) => (
            <div key={i} className="p-4 rounded-md border border-border bg-surface-bg flex items-start gap-3">
              <CheckCircle2 size={18} className="text-brand shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-xs text-text-primary block">{f.label} ({f.ext})</span>
                <span className="text-[11px] text-text-secondary">{f.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Target Audiences */}
      <section className="border-t border-border pt-12 text-center max-w-4xl mx-auto space-y-6">
        <h3 className="text-lg font-bold text-text-primary">Built for Real-World Workflows</h3>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            'University Students',
            'Remote Workers',
            'Freelancers',
            'Small Businesses',
            'IT Professionals',
            'Gamers & Modders',
          ].map((tag, i) => (
            <span
              key={i}
              className="px-3 py-1.5 bg-white border border-border rounded-md text-xs font-medium text-text-secondary shadow-subtle"
            >
              {tag}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
};

