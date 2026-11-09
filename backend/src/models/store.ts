import { ScanStatus, Verdict, IndicatorCategory, Severity } from '../config/constants.js';

export interface ScanRecord {
  id: string;
  status: ScanStatus;
  verdict: Verdict;
  risk_score: number;
  verdict_summary: string | null;
  started_at: Date | string;
  completed_at: Date | string | null;
  error_message: string | null;
}

export interface FileRecord {
  id: string;
  scan_id: string;
  original_name: string;
  sanitized_name: string;
  file_size_bytes: number;
  reported_extension: string | null;
  detected_mime_type: string;
  magic_byte_signature: string | null;
  storage_path: string | null;
  is_quarantined: boolean;
  uploaded_at: Date | string;
}

export interface HashRecord {
  id: string;
  scan_id: string;
  sha256: string;
  md5: string;
  computed_at: Date | string;
}

export interface ThreatIndicatorRecord {
  id: string;
  scan_id: string;
  category: IndicatorCategory;
  severity: Severity;
  title: string;
  description: string;
  risk_explanation: string;
  recommended_action: string;
  technical_evidence: any;
  created_at: Date | string;
}

export interface RecommendationRecord {
  id: string;
  scan_id: string;
  priority_order: number;
  title: string;
  action_instruction: string;
}

export interface ReportRecord {
  id: string;
  scan_id: string;
  report_reference_code: string;
  summary_payload: any;
  pdf_storage_path: string | null;
  generated_at: Date | string;
}

export interface ThreatIntelCacheRecord {
  sha256: string;
  positives: number;
  total_engines: number;
  permalink: string | null;
  raw_response: any;
  cached_at: Date | string;
  expires_at: Date | string;
}

// In-Memory Ephemeral Storage
const scans = new Map<string, ScanRecord>();
const files = new Map<string, FileRecord>();
const hashes = new Map<string, HashRecord>();
const indicators = new Map<string, ThreatIndicatorRecord[]>();
const recommendations = new Map<string, RecommendationRecord[]>();
const reports = new Map<string, ReportRecord>();
const intelCache = new Map<string, ThreatIntelCacheRecord>();

export const ScanModel = {
  async create(scan: Omit<ScanRecord, 'started_at' | 'completed_at'>): Promise<ScanRecord> {
    const record: ScanRecord = {
      ...scan,
      started_at: new Date(),
      completed_at: null,
    };
    scans.set(record.id, record);
    return record;
  },
  async findById(id: string): Promise<ScanRecord | null> {
    return scans.get(id) || null;
  },
  async update(id: string, updates: Partial<ScanRecord>): Promise<ScanRecord | null> {
    const existing = scans.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates };
    scans.set(id, updated);
    return updated;
  },
  async delete(id: string): Promise<boolean> {
    scans.delete(id);
    files.delete(id);
    hashes.delete(id);
    indicators.delete(id);
    recommendations.delete(id);
    reports.delete(id);
    return true;
  },
};

export const FileModel = {
  async create(file: Omit<FileRecord, 'uploaded_at'>): Promise<FileRecord> {
    const record: FileRecord = { ...file, uploaded_at: new Date() };
    files.set(record.scan_id, record);
    return record;
  },
  async findByScanId(scanId: string): Promise<FileRecord | null> {
    return files.get(scanId) || null;
  },
};

export const HashModel = {
  async create(hash: Omit<HashRecord, 'computed_at'>): Promise<HashRecord> {
    const record: HashRecord = { ...hash, computed_at: new Date() };
    hashes.set(record.scan_id, record);
    return record;
  },
  async findByScanId(scanId: string): Promise<HashRecord | null> {
    return hashes.get(scanId) || null;
  },
};

export const ThreatIndicatorModel = {
  async createMany(items: Omit<ThreatIndicatorRecord, 'created_at'>[]): Promise<ThreatIndicatorRecord[]> {
    if (items.length === 0) return [];
    const now = new Date();
    const created = items.map((i) => ({ ...i, created_at: now }));
    indicators.set(items[0].scan_id, created);
    return created;
  },
  async findByScanId(scanId: string): Promise<ThreatIndicatorRecord[]> {
    return indicators.get(scanId) || [];
  },
};

export const RecommendationModel = {
  async createMany(items: RecommendationRecord[]): Promise<RecommendationRecord[]> {
    if (items.length === 0) return [];
    recommendations.set(items[0].scan_id, items);
    return items;
  },
  async findByScanId(scanId: string): Promise<RecommendationRecord[]> {
    return recommendations.get(scanId) || [];
  },
};

export const ReportModel = {
  async create(report: Omit<ReportRecord, 'generated_at'>): Promise<ReportRecord> {
    const record: ReportRecord = { ...report, generated_at: new Date() };
    reports.set(record.scan_id, record);
    return record;
  },
  async findByScanId(scanId: string): Promise<ReportRecord | null> {
    return reports.get(scanId) || null;
  },
  async findByReferenceCode(code: string): Promise<ReportRecord | null> {
    for (const r of reports.values()) {
      if (r.report_reference_code.toUpperCase() === code.toUpperCase()) return r;
    }
    return null;
  },
  async listAll(limit = 20, offset = 0): Promise<{ items: ReportRecord[]; total: number }> {
    const all = Array.from(reports.values());
    all.sort((a, b) => new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime());
    return {
      items: all.slice(offset, offset + limit),
      total: all.length,
    };
  },
};

export const ThreatIntelCacheModel = {
  async get(sha256: string): Promise<ThreatIntelCacheRecord | null> {
    const key = sha256.toLowerCase();
    const item = intelCache.get(key);
    if (item && new Date(item.expires_at).getTime() > Date.now()) {
      return item;
    }
    return null;
  },
  async set(
    sha256: string,
    positives: number,
    totalEngines: number,
    permalink: string | null,
    rawResponse: any,
    ttlHours = 24
  ): Promise<ThreatIntelCacheRecord> {
    const key = sha256.toLowerCase();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlHours * 60 * 60 * 1000);
    const record: ThreatIntelCacheRecord = {
      sha256: key,
      positives,
      total_engines: totalEngines,
      permalink,
      raw_response: rawResponse,
      cached_at: now,
      expires_at: expiresAt,
    };
    intelCache.set(key, record);
    return record;
  },
};

