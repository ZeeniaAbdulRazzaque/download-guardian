import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const ENV = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  VIRUSTOTAL: {
    API_KEY: process.env.VIRUSTOTAL_API_KEY || '',
    BASE_URL: 'https://www.virustotal.com/api/v3',
    CACHE_TTL_HOURS: 24,
  },
  STORAGE: {
    QUARANTINE_PATH: process.env.STORAGE_PATH || 'storage/quarantine',
    MAX_FILE_SIZE_BYTES: (parseInt(process.env.MAX_FILE_SIZE_MB || '100', 10)) * 1024 * 1024,
    AUTO_DELETE_BINARIES: process.env.AUTO_DELETE_BINARIES !== 'false', // Defaults to true for ephemeral privacy
  },
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
};
