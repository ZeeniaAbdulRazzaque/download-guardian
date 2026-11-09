import axios from 'axios';
import { ENV } from '../config/env.js';
import { ThreatIntelCacheModel } from '../models/threat-intel-cache.model.js';
import { logger } from '../utils/logger.js';

export interface VirusTotalResult {
  provider: string;
  status: 'CACHED' | 'LIVE_QUERY' | 'UNKNOWN_HASH' | 'NO_API_KEY' | 'ERROR';
  positives: number;
  totalEngines: number;
  permalink: string | null;
  communityScore?: number;
  threatClassification?: string | null;
  details?: any;
}

export const queryVirusTotal = async (sha256: string): Promise<VirusTotalResult> => {
  const hash = sha256.toLowerCase();

  // 1. Check local database / memory cache
  const cached = await ThreatIntelCacheModel.get(hash);
  if (cached) {
    logger.info(`VirusTotal cache hit for hash: ${hash}`);
    return {
      provider: 'VirusTotal v3',
      status: 'CACHED',
      positives: cached.positives,
      totalEngines: cached.total_engines,
      permalink: cached.permalink,
      threatClassification: cached.positives > 0 ? 'Malicious / Suspicious' : 'Clean',
      details: cached.raw_response,
    };
  }

  // 2. Check if API key is configured
  if (!ENV.VIRUSTOTAL.API_KEY || ENV.VIRUSTOTAL.API_KEY.trim() === '') {
    logger.info(`VirusTotal API key not configured. Skipping external query for ${hash}.`);
    return {
      provider: 'VirusTotal v3',
      status: 'NO_API_KEY',
      positives: 0,
      totalEngines: 0,
      permalink: `https://www.virustotal.com/gui/file/${hash}`,
      threatClassification: 'API Key Not Configured (Local Static Analysis Applied)',
    };
  }

  // 3. Perform live query to VirusTotal v3 API
  try {
    logger.info(`Performing live VirusTotal query for hash: ${hash}`);
    const response = await axios.get(`${ENV.VIRUSTOTAL.BASE_URL}/files/${hash}`, {
      headers: {
        'x-apikey': ENV.VIRUSTOTAL.API_KEY,
      },
      timeout: 10000,
    });

    const data = response.data?.data?.attributes;
    const stats = data?.last_analysis_stats || {};
    const malicious = (stats.malicious || 0) + (stats.suspicious || 0);
    const total = Object.values(stats).reduce((a: any, b: any) => a + b, 0) as number;
    const permalink = `https://www.virustotal.com/gui/file/${hash}`;

    // Cache the result
    await ThreatIntelCacheModel.set(
      hash,
      malicious,
      total || 70,
      permalink,
      { stats, categories: data?.popular_threat_classification },
      ENV.VIRUSTOTAL.CACHE_TTL_HOURS
    );

    return {
      provider: 'VirusTotal v3',
      status: 'LIVE_QUERY',
      positives: malicious,
      totalEngines: total || 70,
      permalink,
      communityScore: data?.reputation || 0,
      threatClassification: data?.popular_threat_classification?.suggested_threat_label || (malicious > 0 ? 'Threat Detected' : 'Clean'),
      details: stats,
    };
  } catch (error: any) {
    if (error.response?.status === 404) {
      logger.info(`Hash ${hash} not found in VirusTotal database.`);
      // Cache 404 as unknown hash
      await ThreatIntelCacheModel.set(hash, 0, 0, `https://www.virustotal.com/gui/file/${hash}`, { not_found: true }, 6);
      return {
        provider: 'VirusTotal v3',
        status: 'UNKNOWN_HASH',
        positives: 0,
        totalEngines: 0,
        permalink: `https://www.virustotal.com/gui/file/${hash}`,
        threatClassification: 'Unknown to VirusTotal (No prior submissions)',
      };
    }

    logger.warn(`VirusTotal lookup warning for ${hash}: ${error.message}`);
    return {
      provider: 'VirusTotal v3',
      status: 'ERROR',
      positives: 0,
      totalEngines: 0,
      permalink: `https://www.virustotal.com/gui/file/${hash}`,
      threatClassification: 'Lookup Unavailable (Rate Limit or Network Error)',
    };
  }
};

