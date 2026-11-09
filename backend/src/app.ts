import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { sendError } from './utils/response.js';

export const createApp = () => {
  const app = express();

  // Middleware
  app.use(
    cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API v1 router
  app.use('/api/v1', routes);

  // Serve static Frontend if built
  const possibleFrontendDirs = [
    path.resolve(process.cwd(), 'frontend/dist'),
    path.resolve(process.cwd(), '../frontend/dist'),
    path.resolve(process.cwd(), 'public'),
    path.resolve(process.cwd(), 'backend/public'),
  ];

  let frontendDir: string | null = null;
  for (const dir of possibleFrontendDirs) {
    if (fs.existsSync(path.join(dir, 'index.html'))) {
      frontendDir = dir;
      break;
    }
  }

  if (frontendDir) {
    app.use(express.static(frontendDir));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(frontendDir!, 'index.html'));
    });
  } else {
    // Root welcome route if frontend is not built
    app.get('/', (_req, res) => {
      res.json({
        name: 'Download Guardian API',
        tagline: "Know What's Inside Before You Open It",
        type: 'Intelligent File Inspection and Threat Assessment Platform (Stateless)',
        version: '1.0.0',
        status: 'ONLINE',
        endpoints: {
          health: '/api/v1/health',
          upload: 'POST /api/v1/scans/upload',
          scans: '/api/v1/scans/:scanId',
          reports: '/api/v1/reports',
        },
      });
    });
  }

  // 404 Route Handler for unmatched API routes
  app.use((req, res) => {
    sendError(res, `Cannot ${req.method} ${req.originalUrl}`, 404, 'ROUTE_NOT_FOUND');
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
};
