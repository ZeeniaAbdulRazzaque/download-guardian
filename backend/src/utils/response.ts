import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  error: {
    code: string;
    message: string;
    details?: any;
  } | null;
  meta: {
    timestamp: string;
    version: string;
  };
}

export const sendSuccess = <T>(res: Response, data: T, statusCode = 200) => {
  const payload: ApiResponse<T> = {
    success: true,
    data,
    error: null,
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  };
  return res.status(statusCode).json(payload);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 400,
  code = 'ERROR',
  details?: any
) => {
  const payload: ApiResponse = {
    success: false,
    data: null,
    error: {
      code,
      message,
      details,
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  };
  return res.status(statusCode).json(payload);
};

