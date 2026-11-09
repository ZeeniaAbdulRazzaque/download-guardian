import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  Lock,
  Loader2,
  FileSearch,
  Hash,
  Binary,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { api } from '../services/api.js';

export const AnalyzePage: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState<string>('INGESTING');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setErrorMessage(null);
    const maxBytes = 100 * 1024 * 1024; // 100MB
    if (selectedFile.size > maxBytes) {
      setErrorMessage('File exceeds the maximum allowed upload limit of 100MB.');
      return;
    }
    setFile(selectedFile);
  };

  const startAnalysis = async () => {
    if (!file) return;

    try {
      setIsUploading(true);
      setErrorMessage(null);
      setUploadProgress(10);
      setCurrentStage('INGESTING');

      const uploadResult = await api.uploadFile(file, (pct) => {
        setUploadProgress(Math.min(pct, 50));
      });

      const scanId = uploadResult.scan_id;

      // Poll pipeline stages until completed
      const pollInterval = setInterval(async () => {
        try {
          const statusData = await api.getScanStatus(scanId);
          setCurrentStage(statusData.status);

          if (statusData.status === 'HASHING') {
            setUploadProgress(60);
          } else if (statusData.status === 'ANALYZING') {
            setUploadProgress(75);
          } else if (statusData.status === 'LOOKUP') {
            setUploadProgress(90);
          } else if (statusData.status === 'COMPLETED') {
            clearInterval(pollInterval);
            setUploadProgress(100);
            setTimeout(() => {
              navigate(`/analysis/${scanId}`);
            }, 600);
          } else if (statusData.status === 'FAILED') {
            clearInterval(pollInterval);
            setIsUploading(false);
            setErrorMessage('Static inspection pipeline encountered an error processing this file.');
          }
        } catch (err) {
          clearInterval(pollInterval);
          setIsUploading(false);
          setErrorMessage('Lost connection to analysis pipeline.');
        }
      }, 800);
    } catch (err: any) {
      setIsUploading(false);
      setErrorMessage(err.response?.data?.error?.message || 'File upload failed. Please try again.');
    }
  };

  const steps = [
    { key: 'INGESTING', label: 'File Ingestion & Quarantine', icon: Lock },
    { key: 'HASHING', label: 'Cryptographic Hashing (SHA256, MD5)', icon: Hash },
    { key: 'ANALYZING', label: 'Static Heuristics & Metadata', icon: Binary },
    { key: 'LOOKUP', label: 'Threat Intelligence Lookup', icon: Layers },
    { key: 'COMPLETED', label: 'Verdict & Report Synthesis', icon: CheckCircle2 },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Analyze File</h1>
        <p className="text-xs text-text-secondary">
          Upload any downloaded file to inspect metadata, static structure, and threat intelligence.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-md bg-status-danger-bg border border-status-danger-border text-status-danger text-xs flex items-center gap-3">
          <AlertCircle size={18} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Drag-and-Drop Area */}
      {!isUploading ? (
        <div className="space-y-6">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-10 sm:p-14 text-center transition-all bg-white shadow-subtle ${
              dragActive ? 'border-brand bg-brand-subtle/50 scale-[1.01]' : 'border-border hover:border-slate-400'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleChange}
              className="hidden"
            />

            <div className="w-14 h-14 rounded-full bg-brand-subtle text-brand flex items-center justify-center mx-auto mb-4">
              <UploadCloud size={28} />
            </div>

            <h3 className="text-base font-semibold text-text-primary">
              Drag and drop your downloaded file here
            </h3>
            <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto">
              Supported formats: PDF, DOCX, XLSX, ZIP, RAR, 7Z, EXE, DLL, APK • Maximum file size: 100 MB
            </p>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-6 px-5 py-2.5 rounded-md bg-white border border-border text-text-primary text-xs font-semibold hover:bg-surface-bg shadow-sm transition-colors"
            >
              Browse Local Files
            </button>
          </div>

          {/* Staged File Card */}
          {file && (
            <div className="bg-white border border-brand rounded-lg p-4 shadow-subtle flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center text-text-primary shrink-0">
                  <FileText size={20} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-text-primary truncate">{file.name}</div>
                  <div className="text-[11px] text-text-secondary">
                    {(file.size / 1024 / 1024).toFixed(2)} MB • Ready for inspection
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={startAnalysis}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand text-white text-xs font-semibold rounded-md hover:bg-brand-hover shadow-sm transition-all"
                >
                  <span>Start Inspection</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Progress Stepper During Upload & Inspection */
        <div className="bg-white border border-border rounded-lg p-8 shadow-subtle space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-subtle text-brand flex items-center justify-center">
                <Loader2 size={20} className="animate-spin" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary">Inspecting: {file?.name}</h3>
                <p className="text-xs text-text-secondary">Stage: {currentStage}</p>
              </div>
            </div>
            <span className="font-mono text-sm font-bold text-brand">{uploadProgress}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-brand h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>

          {/* Stepper Checklist */}
          <div className="divide-y divide-border border border-border rounded-lg">
            {steps.map((st, idx) => {
              const Icon = st.icon;
              const isDone = uploadProgress >= (idx + 1) * 20;
              const isCurrent = currentStage === st.key;

              return (
                <div key={st.key} className="p-3.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <Icon
                      size={16}
                      className={isDone ? 'text-status-safe' : isCurrent ? 'text-brand animate-pulse' : 'text-text-muted'}
                    />
                    <span className={isDone ? 'text-text-primary font-medium' : isCurrent ? 'text-brand font-semibold' : 'text-text-muted'}>
                      {st.label}
                    </span>
                  </div>
                  <div>
                    {isDone ? (
                      <span className="text-[11px] font-semibold text-status-safe">Completed</span>
                    ) : isCurrent ? (
                      <span className="text-[11px] font-semibold text-brand animate-pulse">Running...</span>
                    ) : (
                      <span className="text-[11px] text-text-muted">Pending</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Security Principles & Guarantees */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div className="p-4 bg-white border border-border rounded-lg shadow-subtle space-y-1">
          <div className="flex items-center gap-2 font-semibold text-xs text-text-primary">
            <Lock size={14} className="text-brand" />
            <span>Non-Execution Static Parsing</span>
          </div>
          <p className="text-[11px] text-text-secondary leading-relaxed">
            Binaries and documents are never run inside a live operating system shell. Analysis is strictly static.
          </p>
        </div>

        <div className="p-4 bg-white border border-border rounded-lg shadow-subtle space-y-1">
          <div className="flex items-center gap-2 font-semibold text-xs text-text-primary">
            <CheckCircle2 size={14} className="text-brand" />
            <span>Zero Payload Leakage</span>
          </div>
          <p className="text-[11px] text-text-secondary leading-relaxed">
            Only calculated cryptographic digests (SHA-256) are queried against threat intelligence networks.
          </p>
        </div>
      </div>
    </div>
  );
};

