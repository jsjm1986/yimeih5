import type { DB } from '../db.js';
import { listExpirableTasks, markExpired } from '../repositories/tasks.js';
import { getRetentionDays } from '../repositories/settings.js';
import { deleteImage } from './storage.js';

export function runCleanup(db: DB, uploadsDir: string, now: number = Date.now()): number {
  const retentionDays = getRetentionDays(db);
  const cutoff = now - retentionDays * 24 * 60 * 60 * 1000;
  const tasks = listExpirableTasks(db, cutoff);
  for (const t of tasks) {
    if (t.original_image) deleteImage(uploadsDir, t.original_image);
    if (t.result_image) deleteImage(uploadsDir, t.result_image);
    markExpired(db, t.id);
  }
  return tasks.length;
}
