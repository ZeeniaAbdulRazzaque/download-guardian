import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response.js';
import { ReportModel } from '../models/report.model.js';

export const ReportController = {
  async listReports(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const offset = (page - 1) * limit;

      const { items, total } = await ReportModel.listAll(limit, offset);

      return sendSuccess(res, {
        reports: items,
        pagination: {
          current_page: page,
          limit,
          total_items: total,
          total_pages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to list reports', 500, 'SERVER_ERROR');
    }
  },

  async getReportByScanId(req: Request, res: Response) {
    try {
      const scanId = String(req.params.scanId);
      const report = await ReportModel.findByScanId(scanId);

      if (!report) {
        return sendError(res, `Report for scan "${scanId}" not found`, 404, 'NOT_FOUND');
      }

      return sendSuccess(res, report);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch report', 500, 'SERVER_ERROR');
    }
  },

  async getReportByCode(req: Request, res: Response) {
    try {
      const code = String(req.params.code);
      const report = await ReportModel.findByReferenceCode(code);

      if (!report) {
        return sendError(res, `Report code "${code}" not found`, 404, 'NOT_FOUND');
      }

      return sendSuccess(res, report);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch report by code', 500, 'SERVER_ERROR');
    }
  },

  async downloadReportJson(req: Request, res: Response) {
    try {
      const scanId = String(req.params.scanId);
      const report = await ReportModel.findByScanId(scanId);

      if (!report) {
        return sendError(res, `Report not found`, 404, 'NOT_FOUND');
      }

      const fileName = `${report.report_reference_code}.json`;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      return res.send(JSON.stringify(report.summary_payload, null, 2));
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to export report', 500, 'SERVER_ERROR');
    }
  },
};
