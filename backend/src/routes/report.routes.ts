import { Router } from 'express';
import { ReportController } from '../controllers/report.controller.js';

const router = Router();

// GET /api/v1/reports
router.get('/', ReportController.listReports);

// GET /api/v1/reports/code/:code
router.get('/code/:code', ReportController.getReportByCode);

// GET /api/v1/reports/:scanId
router.get('/:scanId', ReportController.getReportByScanId);

// GET /api/v1/reports/:scanId/export-json
router.get('/:scanId/export-json', ReportController.downloadReportJson);

export default router;

