import { Request, Response } from 'express';
import { sendSuccess } from '../utils/response.js';
import { ENV } from '../config/env.js';

export const HealthController = {
  getHealth(_req: Request, res: Response) {
    return sendSuccess(res, {
      status: 'OPERATIONAL',
      service: 'Download Guardian Core Engine',
      version: '1.0.0',
      mode: 'STATELESS_EPHEMERAL',
      database: 'NONE (100% Stateless & Private)',
      uptime: process.uptime(),
      virustotal: {
        configured: Boolean(ENV.VIRUSTOTAL.API_KEY && ENV.VIRUSTOTAL.API_KEY.trim() !== ''),
      },
    });
  },
};
