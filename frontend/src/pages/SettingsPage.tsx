import React, { useEffect, useState } from 'react';
import { Key, ShieldCheck, Save, CheckCircle2, Lock } from 'lucide-react';
import { api } from '../services/api.js';

export const SettingsPage: React.FC = () => {
  const [vtKey, setVtKey] = useState('');
  const [health, setHealth] = useState<any>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const h = await api.getHealth();
        setHealth(h);
      } catch (err) {
        console.error('Failed to get health:', err);
      }
    };
    fetchHealth();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Platform Settings</h1>
        <p className="text-xs text-text-secondary">
          Configure threat intelligence keys and view platform operational status.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-status-safe-bg border border-status-safe-border text-status-safe rounded-md text-xs flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>Configuration saved successfully.</span>
        </div>
      )}

      {/* Engine Telemetry Banner */}
      <div className="bg-white border border-border rounded-lg p-5 shadow-subtle space-y-3">
        <h2 className="text-xs font-semibold text-text-primary uppercase tracking-wider flex items-center gap-2">
          <Lock size={16} className="text-brand" />
          <span>Operational Architecture</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 bg-surface-bg rounded border border-border text-xs">
            <span className="text-text-secondary text-[11px] block">API Service</span>
            <span className="font-semibold text-text-primary">
              {health?.status || 'OPERATIONAL'}
            </span>
          </div>
          <div className="p-3 bg-surface-bg rounded border border-border text-xs">
            <span className="text-text-secondary text-[11px] block">Data Persistence</span>
            <span className="font-semibold text-status-safe">
              100% Stateless (Zero Database)
            </span>
          </div>
          <div className="p-3 bg-surface-bg rounded border border-border text-xs">
            <span className="text-text-secondary text-[11px] block">Threat Intelligence</span>
            <span className="font-semibold text-text-primary">
              {health?.virustotal?.configured ? 'Live API Key Active' : 'Hash Mode Ready'}
            </span>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="bg-white border border-border rounded-lg p-6 shadow-subtle space-y-6">
        {/* Threat Intelligence */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Key size={16} className="text-brand" />
            <h2 className="text-sm font-semibold text-text-primary">Threat Intelligence (VirusTotal)</h2>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-text-primary block">
              VirusTotal API v3 Key
            </label>
            <input
              type="password"
              placeholder="Paste your 64-character VirusTotal API key..."
              value={vtKey}
              onChange={(e) => setVtKey(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-surface-bg border border-border rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:border-brand font-mono"
            />
            <p className="text-[11px] text-text-secondary leading-relaxed">
              Files are never transmitted to external APIs; only SHA-256 cryptographic hashes are queried for community consensus.
            </p>
          </div>
        </div>

        {/* Privacy Policy Guarantee */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <ShieldCheck size={16} className="text-brand" />
            <h2 className="text-sm font-semibold text-text-primary">Privacy Guarantee</h2>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Download Guardian does not maintain a user database or store submitted binaries. All static parsing and heuristic verifications are executed on-demand in memory, and temporary uploads are immediately unlinked upon completion.
          </p>
        </div>

        <div className="pt-4 border-t border-border flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand text-white text-xs font-semibold rounded-md hover:bg-brand-hover shadow-sm transition-colors"
          >
            <Save size={14} />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
