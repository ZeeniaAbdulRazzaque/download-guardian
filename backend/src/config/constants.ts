export const SUPPORTED_EXTENSIONS = [
  'pdf',
  'docx',
  'doc',
  'xlsx',
  'xls',
  'zip',
  'rar',
  '7z',
  'tar',
  'gz',
  'exe',
  'dll',
  'msi',
  'apk',
  'bat',
  'cmd',
  'ps1',
  'vbs',
  'js',
  'wsf',
  'iso',
] as const;

export type SupportedExtension = typeof SUPPORTED_EXTENSIONS[number];

export const VERDICTS = {
  SAFE: 'SAFE',
  SUSPICIOUS: 'SUSPICIOUS',
  POTENTIALLY_MALICIOUS: 'POTENTIALLY_MALICIOUS',
  PENDING: 'PENDING',
} as const;

export type Verdict = typeof VERDICTS[keyof typeof VERDICTS];

export const SCAN_STATUS = {
  QUEUED: 'QUEUED',
  INGESTING: 'INGESTING',
  HASHING: 'HASHING',
  ANALYZING: 'ANALYZING',
  LOOKUP: 'LOOKUP',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const;

export type ScanStatus = typeof SCAN_STATUS[keyof typeof SCAN_STATUS];

export const SEVERITIES = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;

export type Severity = typeof SEVERITIES[keyof typeof SEVERITIES];

export const CATEGORIES = {
  STATIC_ANALYSIS: 'STATIC_ANALYSIS',
  METADATA_ANOMALY: 'METADATA_ANOMALY',
  THREAT_INTEL: 'THREAT_INTEL',
  CODE_INSPECTION: 'CODE_INSPECTION',
} as const;

export type IndicatorCategory = typeof CATEGORIES[keyof typeof CATEGORIES];

