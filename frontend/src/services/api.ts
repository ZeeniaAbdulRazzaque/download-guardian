import axios from 'axios';
import { ApiResponse, ScanDetails, ReportItem } from '../types/index.js';

const API_BASE_URL = (import.meta.env.VITE_API_URL as string)?.replace(/\/$/, '') || '/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

export const api = {
  // Scans
  async uploadFile(file: File, onProgress?: (pct: number) => void) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await apiClient.post<ApiResponse<{ scan_id: string; status: string; file_name: string; file_size: number; details_url: string }>>(
      '/scans/upload',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        },
      }
    );
    return res.data.data;
  },

  async getScanDetails(scanId: string) {
    const res = await apiClient.get<ApiResponse<ScanDetails>>(`/scans/${scanId}`);
    return res.data.data;
  },

  async getScanStatus(scanId: string) {
    const res = await apiClient.get<ApiResponse<{ scan_id: string; status: string; verdict: string; risk_score: number }>>(
      `/scans/${scanId}/status`
    );
    return res.data.data;
  },

  // Reports (Session / On-Demand)
  async getReports(page = 1, limit = 10) {
    const res = await apiClient.get<ApiResponse<{ reports: ReportItem[]; pagination: any }>>(
      `/reports?page=${page}&limit=${limit}`
    );
    return res.data.data;
  },

  async getReportByScanId(scanId: string) {
    const res = await apiClient.get<ApiResponse<ReportItem>>(`/reports/${scanId}`);
    return res.data.data;
  },

  async getReportByCode(code: string) {
    const res = await apiClient.get<ApiResponse<ReportItem>>(`/reports/code/${code}`);
    return res.data.data;
  },

  getReportDownloadUrl(scanId: string) {
    return `${API_BASE_URL}/reports/${scanId}/export-json`;
  },

  // Health
  async getHealth() {
    const res = await apiClient.get<ApiResponse<{ status: string; service: string; version: string; mode: string; database: any; virustotal: any }>>(
      '/health'
    );
    return res.data.data;
  },
};
