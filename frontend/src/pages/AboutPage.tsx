import React from 'react';
import { HelpCircle, Shield, Check, X, Info } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const scopeComparison = [
    {
      feature: 'Pre-Execution Static File Analysis',
      guardian: true,
      antivirus: 'Partial (Varies)',
      desc: 'Parses structure and format headers without executing code.',
    },
    {
      feature: 'Deceptive Double Extension Detection',
      guardian: true,
      antivirus: false,
      desc: 'Identifies disguised names like .pdf.exe.',
    },
    {
      feature: 'Office Macro & Shell Script Inspection',
      guardian: true,
      antivirus: true,
      desc: 'Detects embedded VBA routines and PowerShell bypass flags.',
    },
    {
      feature: 'Plain-English Risk Explanations',
      guardian: true,
      antivirus: false,
      desc: 'Translates technical findings into practical human instructions.',
    },
    {
      feature: 'Continuous Background Kernel Interception',
      guardian: false,
      antivirus: true,
      desc: 'System resident background monitoring (Out of scope).',
    },
    {
      feature: 'Active Malware Quarantine & File Cleaning',
      guardian: false,
      antivirus: true,
      desc: 'Modifying local disk binaries to neutralize viruses (Out of scope).',
    },
  ];

  const faqs = [
    {
      q: 'Does Download Guardian execute the files I upload?',
      a: 'No. Download Guardian uses 100% non-execution static analysis. Files are parsed for structural markers, magic bytes, PE headers, and macro streams without running them in a live operating system shell.',
    },
    {
      q: 'Can Download Guardian replace my existing antivirus software?',
      a: 'No. Download Guardian is positioned specifically as an "Intelligent File Inspection and Threat Assessment Platform". It is designed to be used before you open a downloaded file, whereas traditional antivirus provides continuous background scanning and endpoint protection.',
    },
    {
      q: 'Are my files sent to VirusTotal or third-party cloud providers?',
      a: 'No. To ensure strict user privacy, files are never transmitted to external APIs. Only the locally computed SHA-256 cryptographic digest is queried to verify community consensus.',
    },
    {
      q: 'What should I do if a file is marked "Potentially Malicious"?',
      a: 'Do not open, execute, or extract the file. Delete it from your local downloads folder and verify the official vendor source through an independent channel.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">About Download Guardian</h1>
        <p className="text-xs text-text-secondary">
          Platform mission, detection methodology, and operational boundaries.
        </p>
      </div>

      {/* Mission Statement */}
      <section className="bg-white border border-border rounded-lg p-6 shadow-subtle space-y-3">
        <h2 className="text-base font-bold text-text-primary">Mission & Purpose</h2>
        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
          Download Guardian is built to empower everyday internet users, students, freelancers, and enterprise professionals to make informed, confident decisions about downloaded artifacts before opening or executing them. By combining deterministic file inspection, metadata analysis, static heuristics, and threat intelligence, we provide clear, explainable verdicts without cryptic malware taxonomy.
        </p>
      </section>

      {/* System Scope Comparison Matrix */}
      <section className="bg-white border border-border rounded-lg p-6 shadow-subtle space-y-4">
        <div>
          <h2 className="text-base font-bold text-text-primary">System Scope & Operational Boundaries</h2>
          <p className="text-xs text-text-secondary mt-1">
            How Download Guardian differs from traditional endpoint antivirus solutions.
          </p>
        </div>

        <div className="overflow-x-auto border border-border rounded-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-bg text-[11px] font-semibold text-text-muted uppercase tracking-wider border-b border-border">
                <th className="py-3 px-4">Platform Capability</th>
                <th className="py-3 px-4 text-brand font-bold">Download Guardian</th>
                <th className="py-3 px-4">Traditional Antivirus</th>
                <th className="py-3 px-4">Scope Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {scopeComparison.map((row, i) => (
                <tr key={i} className="hover:bg-surface-hover">
                  <td className="py-3 px-4 font-semibold text-text-primary">{row.feature}</td>
                  <td className="py-3 px-4 font-semibold">
                    {row.guardian ? (
                      <span className="inline-flex items-center gap-1 text-status-safe">
                        <Check size={14} className="stroke-[3]" />
                        <span>Supported</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-text-muted">
                        <X size={14} />
                        <span>Out of Scope</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-text-secondary font-medium">
                    {typeof row.antivirus === 'boolean' ? (
                      row.antivirus ? 'Supported' : 'No'
                    ) : (
                      row.antivirus
                    )}
                  </td>
                  <td className="py-3 px-4 text-text-secondary text-[11px]">{row.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQs */}
      <section className="bg-white border border-border rounded-lg p-6 shadow-subtle space-y-4">
        <h2 className="text-base font-bold text-text-primary">Frequently Asked Questions</h2>
        <div className="divide-y divide-border">
          {faqs.map((faq, i) => (
            <div key={i} className="py-4 space-y-1.5 first:pt-0 last:pb-0">
              <h3 className="text-xs font-semibold text-text-primary flex items-start gap-2">
                <span className="text-brand font-mono font-bold">Q:</span>
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs text-text-secondary pl-5 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

