import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { CATEGORIES, SEVERITIES, VERDICTS, Verdict, Severity, IndicatorCategory } from '../config/constants.js';
import { MetadataResult } from './metadata.service.js';
import { VirusTotalResult } from './virustotal.service.js';
import { ThreatIndicatorRecord } from '../models/indicator.model.js';
import { RecommendationRecord } from '../models/recommendation.model.js';

export interface VerdictAnalysisResult {
  verdict: Verdict;
  riskScore: number;
  verdictSummary: string;
  indicators: Omit<ThreatIndicatorRecord, 'created_at'>[];
  recommendations: RecommendationRecord[];
}

export const evaluateVerdict = async (
  scanId: string,
  filePath: string,
  originalName: string,
  meta: MetadataResult,
  vt: VirusTotalResult
): Promise<VerdictAnalysisResult> => {
  const indicators: Omit<ThreatIndicatorRecord, 'created_at'>[] = [];
  let score = 0;

  // 1. Double Extension Anomaly Check
  if (meta.hasDoubleExtension) {
    score += 45;
    indicators.push({
      id: uuidv4(),
      scan_id: scanId,
      category: CATEGORIES.METADATA_ANOMALY,
      severity: SEVERITIES.CRITICAL,
      title: 'Double File Extension Detected',
      description: `File name "${originalName}" uses a deceptive multi-extension pattern.`,
      risk_explanation: 'Attackers frequently disguise dangerous executable payloads as innocent documents (e.g., .pdf.exe) to trick users into double-clicking.',
      recommended_action: 'Do not open or execute this file. Immediately verify the sender origin.',
      technical_evidence: { originalName, reportedExtension: meta.reportedExtension },
    });
  }

  // 2. MIME / Magic Byte Mismatch Check
  if (meta.isExtensionMismatch) {
    score += 50;
    indicators.push({
      id: uuidv4(),
      scan_id: scanId,
      category: CATEGORIES.METADATA_ANOMALY,
      severity: SEVERITIES.CRITICAL,
      title: 'MIME Type and Magic Byte Mismatch',
      description: `The file claims to be a .${meta.reportedExtension} document, but its internal binary header indicates ${meta.magicByteSignature}.`,
      risk_explanation: 'Files masquerading under false extensions are almost always deceptive payloads attempting to bypass email filters or user scrutiny.',
      recommended_action: 'Quarantine and delete the file. Do not attempt to open it.',
      technical_evidence: {
        reportedExtension: meta.reportedExtension,
        detectedMimeType: meta.detectedMimeType,
        magicByteSignature: meta.magicByteSignature,
      },
    });
  }

  // 3. Executable Payload Evaluation
  if (meta.isExecutable) {
    score += 20;
    indicators.push({
      id: uuidv4(),
      scan_id: scanId,
      category: CATEGORIES.STATIC_ANALYSIS,
      severity: SEVERITIES.HIGH,
      title: 'Executable Application Binary',
      description: `The artifact is a direct executable binary (.${meta.reportedExtension}) capable of native system execution.`,
      risk_explanation: 'Executables possess direct access to operating system APIs, filesystem resources, and network sockets.',
      recommended_action: 'Ensure the publisher is known and verify the download origin before execution. Never run as administrator.',
      technical_evidence: { mime: meta.detectedMimeType, extension: meta.reportedExtension },
    });
  }

  // 4. Inspect file contents for static markers (Macros, script commands, URLs)
  try {
    const stats = await fs.promises.stat(filePath);
    // Read up to 2MB for static pattern search
    const readLength = Math.min(stats.size, 2 * 1024 * 1024);
    const buffer = Buffer.alloc(readLength);
    const fd = await fs.promises.open(filePath, 'r');
    await fd.read(buffer, 0, readLength, 0);
    await fd.close();

    const contentStr = buffer.toString('utf8', 0, readLength);
    const contentAscii = buffer.toString('binary', 0, readLength);

    // Office Macro Detection
    if (
      contentAscii.includes('vbaProject.bin') ||
      contentStr.includes('AutoOpen') ||
      contentStr.includes('Workbook_Open') ||
      contentStr.includes('Document_Open') ||
      contentStr.includes('macros')
    ) {
      score += 35;
      indicators.push({
        id: uuidv4(),
        scan_id: scanId,
        category: CATEGORIES.CODE_INSPECTION,
        severity: SEVERITIES.HIGH,
        title: 'Embedded Office Macro / Script Detected',
        description: 'VBA macro or automated execution routines detected within the document structure.',
        risk_explanation: 'Office documents containing macros can execute automated commands, download external payloads, or modify files when opened.',
        recommended_action: 'Do not click "Enable Editing" or "Enable Macros" if prompted by Microsoft Office or LibreOffice.',
        technical_evidence: { format: meta.reportedExtension, macroMarkerFound: true },
      });
    }

    // PowerShell / Shell Trigger Detection
    const suspiciousCommands = ['powershell', 'cmd.exe', 'wscript', 'cscript', 'invoke-expression', 'bypass', 'hidden'];
    const matchedCommands = suspiciousCommands.filter((cmd) =>
      contentStr.toLowerCase().includes(cmd)
    );

    if (matchedCommands.length > 0) {
      score += 25;
      indicators.push({
        id: uuidv4(),
        scan_id: scanId,
        category: CATEGORIES.CODE_INSPECTION,
        severity: SEVERITIES.MEDIUM,
        title: 'System Command / Shell Invocation Triggers',
        description: `Detected commands commonly used in shell execution: ${matchedCommands.join(', ')}.`,
        risk_explanation: 'Scripts or binaries embedding shell launch commands may attempt to run hidden commands without user consent.',
        recommended_action: 'Inspect the script source or verify the installer package origin.',
        technical_evidence: { matchedCommands },
      });
    }
  } catch (err: any) {
    // If partial read fails, continue gracefully
  }

  // 5. Threat Intelligence Integration (VirusTotal)
  if (vt.positives > 0) {
    if (vt.positives >= 5) {
      score += 55;
      indicators.push({
        id: uuidv4(),
        scan_id: scanId,
        category: CATEGORIES.THREAT_INTEL,
        severity: SEVERITIES.CRITICAL,
        title: `Flagged by ${vt.positives} Security Engines on VirusTotal`,
        description: `Multiple commercial antivirus and heuristic engines identified this file hash as malicious or suspicious.`,
        risk_explanation: 'High vendor consensus indicates that this specific file has already been classified as malware by global security networks.',
        recommended_action: 'Delete this file immediately. Do not attempt to run or unpack its contents.',
        technical_evidence: {
          positives: vt.positives,
          totalEngines: vt.totalEngines,
          permalink: vt.permalink,
        },
      });
    } else {
      score += 25;
      indicators.push({
        id: uuidv4(),
        scan_id: scanId,
        category: CATEGORIES.THREAT_INTEL,
        severity: SEVERITIES.MEDIUM,
        title: `Low-Consensus Detection on VirusTotal (${vt.positives}/${vt.totalEngines})`,
        description: `${vt.positives} vendor engine(s) flagged this file hash.`,
        risk_explanation: 'A small number of detections may indicate either a nascent emerging threat or a benign false positive.',
        recommended_action: 'Exercise heightened caution. Compare publisher certificate details.',
        technical_evidence: {
          positives: vt.positives,
          totalEngines: vt.totalEngines,
          permalink: vt.permalink,
        },
      });
    }
  }

  // Cap score to 100
  score = Math.min(score, 100);

  // Determine Verdict
  let verdict: Verdict = VERDICTS.SAFE;
  let summary = 'No significant security indicators identified. The file exhibits standard structural properties.';

  if (score >= 56) {
    verdict = VERDICTS.POTENTIALLY_MALICIOUS;
    summary = 'Multiple high-risk indicators were identified. Structural analysis or threat intelligence strongly suggests deceptive or hazardous content.';
  } else if (score >= 16) {
    verdict = VERDICTS.SUSPICIOUS;
    summary = 'Potential security concerns were identified during static inspection. Exercise caution and verify the source before opening.';
  }

  // Synthesize Recommendations based on findings
  const recommendations: RecommendationRecord[] = [];
  let order = 1;

  if (verdict === VERDICTS.POTENTIALLY_MALICIOUS) {
    recommendations.push({
      id: uuidv4(),
      scan_id: scanId,
      priority_order: order++,
      title: 'Quarantine and Delete File',
      action_instruction: 'Do not open, mount, or execute this downloaded file. Remove it from your local downloads directory immediately.',
    });
    recommendations.push({
      id: uuidv4(),
      scan_id: scanId,
      priority_order: order++,
      title: 'Audit Source Web URL',
      action_instruction: 'Verify whether the download URL was legitimate or a deceptive typosquatting domain.',
    });
  } else if (verdict === VERDICTS.SUSPICIOUS) {
    recommendations.push({
      id: uuidv4(),
      scan_id: scanId,
      priority_order: order++,
      title: 'Verify Publisher Identity',
      action_instruction: 'Check if the file has an authentic digital signature from a recognized vendor before running.',
    });
    recommendations.push({
      id: uuidv4(),
      scan_id: scanId,
      priority_order: order++,
      title: 'Avoid Administrative Execution',
      action_instruction: 'Do not select "Run as Administrator" if you decide to proceed with opening this file.',
    });
  } else {
    recommendations.push({
      id: uuidv4(),
      scan_id: scanId,
      priority_order: order++,
      title: 'Standard Precaution',
      action_instruction: 'Ensure you downloaded this file directly from the vendor official repository.',
    });
    recommendations.push({
      id: uuidv4(),
      scan_id: scanId,
      priority_order: order++,
      title: 'Scan with Resident Antivirus',
      action_instruction: 'Maintain up-to-date operating system security definitions.',
    });
  }

  return {
    verdict,
    riskScore: score,
    verdictSummary: summary,
    indicators,
    recommendations,
  };
};

