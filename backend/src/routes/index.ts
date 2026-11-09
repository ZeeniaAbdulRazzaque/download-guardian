import { Router } from 'express';
import scanRoutes from './scan.routes.js';
import reportRoutes from './report.routes.js';
import healthRoutes from './health.routes.js';

const router = Router();

router.use('/scans', scanRoutes);
router.use('/reports', reportRoutes);
router.use('/health', healthRoutes);

export default router;
