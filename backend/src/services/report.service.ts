import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { ReportModel, ReportRecord } from '../models/report.model.js';
import { ScanRecord } from '../models/scan.model.js';
import { FileRecord } from '../models/file.model.js';
import { HashRecord } from '../models/hash.model.js';
import { ThreatIndicatorRecord } from '../models/indicator.model.js';
import { RecommendationRecord } from '../models/recommendation.model.js';
import { VirusTotalResult } from './virustotal.service.js';

export const generateReportReferenceCode = (): string => {
  const year = new Date().getFullYear();
  const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `DG-${year}-${randomHex}`;
};

export const createSecurityReport = async (
  scan: ScanRecord,
  file: FileRecord,
  hashes: HashRecord,
  indicators: ThreatIndicatorRecord[],
  recommendations: RecommendationRecord[],
  vt: VirusTotalResult
): Promise<ReportRecord> => {
  const referenceCode = generateReportReferenceCode();

  const summaryPayload = {
    report_reference_code: referenceCode,
    generated_at: new Date().toISOString(),
    platform: 'Download Guardian - File Inspection & Threat Assessment Platform',
    verdict: scan.verdict,
    risk_score: scan.risk_score,
    verdict_summary: scan.verdict_summary,
    file_info: {
      name: file.original_name,
      size_bytes: file.file_size_bytes,
      mime_type: file.detected_mime_type,
      magic_signature: file.magic_byte_signature,
      extension: file.reported_extension,
    },
    cryptographic_hashes: {
      sha256: hashes.sha256,
      md5: hashes.md5,
    },
    threat_indicators: indicators.map((ind) => ({
      severity: ind.severity,
      category: ind.category,
      title: ind.title,
      description: ind.description,
      risk_explanation: ind.risk_explanation,
      recommended_action: ind.recommended_action,
    })),
    threat_intelligence: {
      provider: vt.provider,
      status: vt.status,
      positives: vt.positives,
      total_engines: vt.totalEngines,
      permalink: vt.permalink,
      classification: vt.threatClassification,
    },
    recommendations: recommendations.map((r) => ({
      priority: r.priority_order,
      title: r.title,
      instruction: r.action_instruction,
    })),
    disclaimer:
      'Download Guardian provides pre-execution static inspection and threat intelligence correlation. It does not provide real-time kernel interception or endpoint remediation.',
  };

  return await ReportModel.create({
    id: uuidv4(),
    scan_id: scan.id,
    report_reference_code: referenceCode,
    summary_payload: summaryPayload,
    pdf_storage_path: null,
  });
};

