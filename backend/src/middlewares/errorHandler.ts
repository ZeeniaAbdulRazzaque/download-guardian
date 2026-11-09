import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.js';
import { logger } from '../utils/logger.js';

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled request error:', err);

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return sendError(res, 'Uploaded file exceeds the maximum allowed size limit (100MB)', 413, 'FILE_TOO_LARGE');
    }
    return sendError(res, err.message, 400, 'UPLOAD_ERROR');
  }

  return sendError(
    res,
    err.message || 'An unexpected internal server error occurred',
    err.status || 500,
    'INTERNAL_SERVER_ERROR'
  );
};

