import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

export function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

export function saveImage(uploadsDir: string, buffer: Buffer, mime: string): string {
  ensureDir(uploadsDir);
  const ext = EXT_BY_MIME[mime] ?? '.bin';
  const name = crypto.randomBytes(16).toString('hex') + ext;
  fs.writeFileSync(path.join(uploadsDir, name), buffer);
  return name;
}

export function deleteImage(uploadsDir: string, filename: string): void {
  try {
    fs.unlinkSync(path.join(uploadsDir, filename));
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
  }
}
