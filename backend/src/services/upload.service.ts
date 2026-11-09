import multer from 'multer';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import { ENV } from '../config/env.js';

// Ensure quarantine storage directory exists
let quarantineDir = path.resolve(process.cwd(), ENV.STORAGE.QUARANTINE_PATH);
try {
  if (!fs.existsSync(quarantineDir)) {
    fs.mkdirSync(quarantineDir, { recursive: true });
  }
} catch {
  // Cloud containers (like Embarko / Docker) have read-only app roots; fall back to OS temp dir
  quarantineDir = path.join(os.tmpdir(), 'download-guardian', 'quarantine');
  if (!fs.existsSync(quarantineDir)) {
    fs.mkdirSync(quarantineDir, { recursive: true });
  }
}

export const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .substring(0, 255);
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, quarantineDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${uuidv4()}${ext}`;
    cb(null, uniqueName);
  },
});

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: ENV.STORAGE.MAX_FILE_SIZE_BYTES,
  },
});

