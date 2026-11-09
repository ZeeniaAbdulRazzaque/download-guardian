import { Router } from 'express';
import { ScanController } from '../controllers/scan.controller.js';
import { uploadMiddleware } from '../services/upload.service.js';

const router = Router();

// POST /api/v1/scans/upload
router.post('/upload', uploadMiddleware.single('file'), ScanController.uploadFile);

// GET /api/v1/scans/:scanId
router.get('/:scanId', ScanController.getScanDetails);

// GET /api/v1/scans/:scanId/status
router.get('/:scanId/status', ScanController.getScanStatus);

export default router;

