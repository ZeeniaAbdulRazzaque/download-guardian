export type VerdictType = 'SAFE' | 'SUSPICIOUS' | 'POTENTIALLY_MALICIOUS' | 'PENDING';

export type ScanStatusType =
  | 'QUEUED'
  | 'INGESTING'
  | 'HASHING'
  | 'ANALYZING'
  | 'LOOKUP'
  | 'COMPLETED'
  | 'FAILED';

export type SeverityType = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ThreatIndicator {
  id: string;
  scan_id: string;
  category: string;
  severity: SeverityType;
  title: string;
  description: string;
  risk_explanation: string;
  recommended_action: string;
  technical_evidence?: any;
  created_at: string;
}

export interface Recommendation {
  id: string;
  scan_id: string;
  priority_order: number;
  title: string;
  action_instruction: string;
}

export interface FileDetails {
  original_name: string;
  size_bytes: number;
  extension: string | null;
  detected_mime: string;
  magic_byte_signature: string | null;
  uploaded_at: string;
}

export interface HashDetails {
  sha256: string;
  md5: string;
}

export interface VirusTotalDetails {
  provider: string;
  status: string;
  positives: number;
  total_engines: number;
  permalink: string | null;
  classification?: string | null;
}

export interface ScanDetails {
  scan_id: string;
  status: ScanStatusType;
  verdict: VerdictType;
  risk_score: number;
  verdict_summary: string | null;
  started_at: string;
  completed_at: string | null;
  error_message: string | null;
  file: FileDetails | null;
  hashes: HashDetails | null;
  threat_indicators: ThreatIndicator[];
  recommendations: Recommendation[];
  report_reference_code: string | null;
  threat_intelligence: VirusTotalDetails | null;
}

export interface ReportItem {
  id: string;
  scan_id: string;
  report_reference_code: string;
  summary_payload: any;
  pdf_storage_path: string | null;
  generated_at: string;
}

export interface HistoryItem {
  id: string;
  status: ScanStatusType;
  verdict: VerdictType;
  risk_score: number;
  started_at: string;
  completed_at: string | null;
  file_name: string;
  file_size: number;
  file_type: string;
  sha256: string | null;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  error: {
    code: string;
    message: string;
    details?: any;
  } | null;
  meta: {
    timestamp: string;
    version: string;
  };
}

