import fs from 'fs';
import path from 'path';

export interface MetadataResult {
  fileSizeBytes: number;
  reportedExtension: string;
  detectedMimeType: string;
  magicByteSignature: string;
  isExtensionMismatch: boolean;
  hasDoubleExtension: boolean;
  isExecutable: boolean;
  isArchive: boolean;
  isOfficeDocument: boolean;
  isPdf: boolean;
}

const MAGIC_SIGNATURES: { prefix: number[]; mime: string; sig: string; ext: string }[] = [
  { prefix: [0x4d, 0x5a], mime: 'application/x-dosexec', sig: 'MZ (PE/DOS Executable)', ext: 'exe' },
  { prefix: [0x25, 0x50, 0x44, 0x46], mime: 'application/pdf', sig: '%PDF (Portable Document Format)', ext: 'pdf' },
  { prefix: [0x50, 0x4b, 0x03, 0x04], mime: 'application/zip', sig: 'PK (ZIP / OOXML / APK Container)', ext: 'zip' },
  { prefix: [0x52, 0x61, 0x72, 0x21], mime: 'application/x-rar-compressed', sig: 'Rar! (RAR Archive)', ext: 'rar' },
  { prefix: [0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c], mime: 'application/x-7z-compressed', sig: '7z (7-Zip Archive)', ext: '7z' },
  { prefix: [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1], mime: 'application/x-ole-storage', sig: 'OLE2 (Legacy MS Office)', ext: 'doc' },
  { prefix: [0x7f, 0x45, 0x4c, 0x46], mime: 'application/x-elf', sig: 'ELF (Linux Executable)', ext: 'elf' },
];

export const inspectMetadata = async (filePath: string, originalName: string): Promise<MetadataResult> => {
  const stats = await fs.promises.stat(filePath);
  const ext = path.extname(originalName).toLowerCase().replace('.', '');

  // Read the first 64 bytes for magic number identification
  const buffer = Buffer.alloc(64);
  const fd = await fs.promises.open(filePath, 'r');
  await fd.read(buffer, 0, 64, 0);
  await fd.close();

  let detectedMime = 'application/octet-stream';
  let magicSig = 'Unknown Binary Signature';
  let matchedExt: string | null = null;

  for (const sig of MAGIC_SIGNATURES) {
    const matches = sig.prefix.every((byte, index) => buffer[index] === byte);
    if (matches) {
      detectedMime = sig.mime;
      magicSig = sig.sig;
      matchedExt = sig.ext;
      break;
    }
  }

  // Double extension detection (e.g. invoice.pdf.exe)
  const nameParts = originalName.split('.');
  const hasDoubleExtension =
    nameParts.length > 2 &&
    ['exe', 'scr', 'vbs', 'bat', 'cmd', 'ps1', 'js', 'jar', 'apk'].includes(
      nameParts[nameParts.length - 1].toLowerCase()
    ) &&
    ['pdf', 'docx', 'xlsx', 'jpg', 'png', 'txt', 'zip'].includes(
      nameParts[nameParts.length - 2].toLowerCase()
    );

  // Check for extension mismatch
  let isMismatch = false;
  if (matchedExt === 'exe' && ext !== 'exe' && ext !== 'dll' && ext !== 'sys') {
    isMismatch = true;
  } else if (matchedExt === 'pdf' && ext !== 'pdf') {
    isMismatch = true;
  }

  const isExecutable =
    detectedMime === 'application/x-dosexec' ||
    ['exe', 'dll', 'bat', 'cmd', 'ps1', 'vbs', 'apk', 'msi', 'wsf'].includes(ext);

  const isArchive = ['zip', 'rar', '7z', 'tar', 'gz'].includes(ext) || detectedMime === 'application/zip';
  const isOfficeDocument = ['docx', 'xlsx', 'doc', 'xls', 'pptx'].includes(ext);
  const isPdf = ext === 'pdf' || detectedMime === 'application/pdf';

  return {
    fileSizeBytes: stats.size,
    reportedExtension: ext,
    detectedMimeType: detectedMime,
    magicByteSignature: magicSig,
    isExtensionMismatch: isMismatch,
    hasDoubleExtension,
    isExecutable,
    isArchive,
    isOfficeDocument,
    isPdf,
  };
};

