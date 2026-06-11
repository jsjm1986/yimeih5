import path from 'node:path';

export const DATA_DIR = process.env.DATA_DIR ?? path.resolve(process.cwd(), 'data');
export const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
export const DB_PATH = process.env.DB_PATH ?? path.join(DATA_DIR, 'app.db');

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB
export const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);

export const DEFAULT_RETENTION_DAYS = 30;
export const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 小时
export const SESSION_COOKIE = 'sid';
