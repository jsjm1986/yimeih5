import type { DB } from '../db.js';
import { DEFAULT_RETENTION_DAYS } from '../config.js';

const KEY = 'retention_days';

export function getRetentionDays(db: DB): number {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(KEY) as
    | { value: string }
    | undefined;
  if (!row) return DEFAULT_RETENTION_DAYS;
  const n = parseInt(row.value, 10);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_RETENTION_DAYS;
}

export function setRetentionDays(db: DB, days: number): void {
  db.prepare(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
  ).run(KEY, String(days));
}
