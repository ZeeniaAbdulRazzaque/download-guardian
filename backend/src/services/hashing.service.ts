import crypto from 'crypto';
import fs from 'fs';

export interface HashResult {
  sha256: string;
  md5: string;
}

export const generateHashes = (filePath: string): Promise<HashResult> => {
  return new Promise((resolve, reject) => {
    const sha256Hash = crypto.createHash('sha256');
    const md5Hash = crypto.createHash('md5');
    const stream = fs.createReadStream(filePath);

    stream.on('data', (chunk) => {
      sha256Hash.update(chunk);
      md5Hash.update(chunk);
    });

    stream.on('end', () => {
      resolve({
        sha256: sha256Hash.digest('hex'),
        md5: md5Hash.digest('hex'),
      });
    });

    stream.on('error', (err) => {
      reject(err);
    });
  });
};

