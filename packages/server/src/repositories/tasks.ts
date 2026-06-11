import type { DB } from '../db.js';
import type { TaskStatus } from '@yimei/shared';

export interface TaskRow {
  id: string;
  device_id: string;
  prompt: string;
  original_image: string | null;
  result_image: string | null;
  status: TaskStatus;
  created_at: number;
  completed_at: number | null;
  handled_by: string | null;
}

export function insertTask(
  db: DB,
  t: { id: string; deviceId: string; prompt: string; originalImage: string; createdAt: number },
): void {
  db.prepare(
    `INSERT INTO tasks (id, device_id, prompt, original_image, status, created_at)
     VALUES (?, ?, ?, ?, 'pending', ?)`,
  ).run(t.id, t.deviceId, t.prompt, t.originalImage, t.createdAt);
}

export function getTask(db: DB, id: string): TaskRow | undefined {
  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as TaskRow | undefined;
}

export function listTasksByDevice(db: DB, deviceId: string): TaskRow[] {
  return db
    .prepare('SELECT * FROM tasks WHERE device_id = ? ORDER BY created_at DESC')
    .all(deviceId) as TaskRow[];
}

export function listTasksByStatus(db: DB, status: TaskStatus): TaskRow[] {
  return db
    .prepare('SELECT * FROM tasks WHERE status = ? ORDER BY created_at DESC')
    .all(status) as TaskRow[];
}

export function listAllTasks(db: DB): TaskRow[] {
  return db.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all() as TaskRow[];
}

export function setTaskResult(
  db: DB,
  id: string,
  resultImage: string,
  handledBy: string,
  completedAt: number,
): void {
  db.prepare(
    `UPDATE tasks SET result_image = ?, status = 'done', handled_by = ?, completed_at = ?
     WHERE id = ?`,
  ).run(resultImage, handledBy, completedAt, id);
}

export function listExpirableTasks(db: DB, cutoff: number): TaskRow[] {
  return db
    .prepare(`SELECT * FROM tasks WHERE created_at < ? AND status != 'expired'`)
    .all(cutoff) as TaskRow[];
}

export function markExpired(db: DB, id: string): void {
  db.prepare(
    `UPDATE tasks SET status = 'expired', original_image = NULL, result_image = NULL WHERE id = ?`,
  ).run(id);
}
