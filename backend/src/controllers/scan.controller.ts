import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { sendSuccess, sendError } from '../utils/response.js';
import { ScanModel } from '../models/scan.model.js';
import { FileModel } from '../models/file.model.js';
import { HashModel } from '../models/hash.model.js';
import { ThreatIndicatorModel } from '../models/indicator.model.js';
import { RecommendationModel } from '../models/recommendation.model.js';
import { ReportModel } from '../models/report.model.js';
import { runInspectionPipeline } from '../services/pipeline.service.js';
import { SCAN_STATUS, VERDICTS } from '../config/constants.js';
import { sanitizeFileName } from '../services/upload.service.js';

export const ScanController = {
  async uploadFile(req: Request, res: Response) {
    try {
      if (!req.file) {
        return sendError(res, 'No file was provided in the upload request', 400, 'NO_FILE_UPLOADED');
      }

      const file = req.file;
      const scanId = uuidv4();
      const sanitizedName = sanitizeFileName(file.originalname);
      const ext = path.extname(file.originalname).toLowerCase().replace('.', '');

      // 1. Create Initial Scan Record
      const scan = await ScanModel.create({
        id: scanId,
        status: SCAN_STATUS.INGESTING,
        verdict: VERDICTS.PENDING,
        risk_score: 0,
        verdict_summary: null,
        error_message: null,
      });

      // 2. Create File Record
      await FileModel.create({
        id: uuidv4(),
        scan_id: scanId,
        original_name: file.originalname,
        sanitized_name: sanitizedName,
        file_size_bytes: file.size,
        reported_extension: ext || null,
        detected_mime_type: file.mimetype || 'application/octet-stream',
        magic_byte_signature: null,
        storage_path: file.path,
        is_quarantined: true,
      });

      // 3. Kick off async pipeline
      runInspectionPipeline(scanId, file.path, file.originalname);

      // 4. Return 202 Accepted immediately
      return sendSuccess(
        res,
        {
          scan_id: scan.id,
          status: scan.status,
          file_name: file.originalname,
          file_size: file.size,
          details_url: `/api/v1/scans/${scan.id}`,
        },
        202
      );
    } catch (error: any) {
      return sendError(res, error.message || 'File upload failed', 500, 'UPLOAD_ERROR');
    }
  },

  async getScanDetails(req: Request, res: Response) {
    try {
      const scanId = String(req.params.scanId);
      const scan = await ScanModel.findById(scanId);

      if (!scan) {
        return sendError(res, `Scan with ID "${scanId}" was not found`, 404, 'NOT_FOUND');
      }

      const file = await FileModel.findByScanId(scanId);
      const hashes = await HashModel.findByScanId(scanId);
      const indicators = await ThreatIndicatorModel.findByScanId(scanId);
      const recommendations = await RecommendationModel.findByScanId(scanId);
      const report = await ReportModel.findByScanId(scanId);

      return sendSuccess(res, {
        scan_id: scan.id,
        status: scan.status,
        verdict: scan.verdict,
        risk_score: scan.risk_score,
        verdict_summary: scan.verdict_summary,
        started_at: scan.started_at,
        completed_at: scan.completed_at,
        error_message: scan.error_message,
        file: file
          ? {
              original_name: file.original_name,
              size_bytes: file.file_size_bytes,
              extension: file.reported_extension,
              detected_mime: file.detected_mime_type,
              magic_byte_signature: file.magic_byte_signature,
              uploaded_at: file.uploaded_at,
            }
          : null,
        hashes: hashes
          ? {
              sha256: hashes.sha256,
              md5: hashes.md5,
            }
          : null,
        threat_indicators: indicators,
        recommendations: recommendations,
        report_reference_code: report?.report_reference_code || null,
        threat_intelligence: report?.summary_payload?.threat_intelligence || null,
      });
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch scan details', 500, 'SERVER_ERROR');
    }
  },

  async getScanStatus(req: Request, res: Response) {
    try {
      const scanId = String(req.params.scanId);
      const scan = await ScanModel.findById(scanId);

      if (!scan) {
        return sendError(res, `Scan not found`, 404, 'NOT_FOUND');
      }

      return sendSuccess(res, {
        scan_id: scan.id,
        status: scan.status,
        verdict: scan.verdict,
        risk_score: scan.risk_score,
      });
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch scan status', 500, 'SERVER_ERROR');
    }
  },
};
