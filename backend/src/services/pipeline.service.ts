import fs from 'fs';
import { SCAN_STATUS } from '../config/constants.js';
import { ScanModel } from '../models/scan.model.js';
import { FileModel } from '../models/file.model.js';
import { HashModel } from '../models/hash.model.js';
import { ThreatIndicatorModel } from '../models/indicator.model.js';
import { RecommendationModel } from '../models/recommendation.model.js';
import { generateHashes } from './hashing.service.js';
import { inspectMetadata } from './metadata.service.js';
import { queryVirusTotal } from './virustotal.service.js';
import { evaluateVerdict } from './verdict.service.js';
import { createSecurityReport } from './report.service.js';
import { logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';
import { ENV } from '../config/env.js';

export const runInspectionPipeline = async (scanId: string, filePath: string, originalName: string) => {
  try {
    logger.info(`[Pipeline] Starting inspection for scan ${scanId} (File: ${originalName})`);

    // 1. Stage: HASHING
    await ScanModel.update(scanId, { status: SCAN_STATUS.HASHING });
    const { sha256, md5 } = await generateHashes(filePath);
    const hashRecord = await HashModel.create({
      id: uuidv4(),
      scan_id: scanId,
      sha256,
      md5,
    });
    logger.info(`[Pipeline] Hashes generated: SHA256=${sha256.substring(0, 16)}...`);

    // 2. Stage: METADATA INSPECTION
    await ScanModel.update(scanId, { status: SCAN_STATUS.ANALYZING });
    const metadata = await inspectMetadata(filePath, originalName);

    // 3. Stage: THREAT INTELLIGENCE (VirusTotal)
    await ScanModel.update(scanId, { status: SCAN_STATUS.LOOKUP });
    const vtResult = await queryVirusTotal(sha256);

    // 4. Stage: VERDICT SYNTHESIS
    const verdictAnalysis = await evaluateVerdict(scanId, filePath, originalName, metadata, vtResult);

    // Persist Indicators & Recommendations
    const indicators = await ThreatIndicatorModel.createMany(verdictAnalysis.indicators);
    const recommendations = await RecommendationModel.createMany(verdictAnalysis.recommendations);

    // Update File Record with discovered metadata
    const fileRecord = await FileModel.findByScanId(scanId);
    if (fileRecord) {
      fileRecord.detected_mime_type = metadata.detectedMimeType;
      fileRecord.magic_byte_signature = metadata.magicByteSignature;
    }

    // 5. Update Scan Record with Verdict
    const updatedScan = await ScanModel.update(scanId, {
      status: SCAN_STATUS.COMPLETED,
      verdict: verdictAnalysis.verdict,
      risk_score: verdictAnalysis.riskScore,
      verdict_summary: verdictAnalysis.verdictSummary,
      completed_at: new Date(),
    });

    // 6. Generate Formal Security Report
    if (updatedScan && fileRecord) {
      await createSecurityReport(
        updatedScan,
        fileRecord,
        hashRecord,
        indicators,
        recommendations,
        vtResult
      );
    }

    // 7. Cleanup ephemeral file if enabled
    if (ENV.STORAGE.AUTO_DELETE_BINARIES && fs.existsSync(filePath)) {
      try {
        await fs.promises.unlink(filePath);
        logger.info(`[Pipeline] Ephemeral file deleted: ${filePath}`);
      } catch (err: any) {
        logger.warn(`Could not delete ephemeral file: ${err.message}`);
      }
    }

    logger.info(`[Pipeline] Inspection complete for ${scanId}. Verdict: ${verdictAnalysis.verdict}`);
  } catch (error: any) {
    logger.error(`[Pipeline Error] Inspection failed for ${scanId}: ${error.message}`);
    await ScanModel.update(scanId, {
      status: SCAN_STATUS.FAILED,
      error_message: error.message || 'Inspection pipeline error',
      completed_at: new Date(),
    });
  }
};

