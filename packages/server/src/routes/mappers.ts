import type { TaskRow } from '../repositories/tasks.js';
import type { TaskDetail, TaskSummary, AdminTaskSummary } from '@yimei/shared';

export function toUrl(filename: string | null): string | null {
  return filename ? `/uploads/${filename}` : null;
}

export function toTaskSummary(row: TaskRow): TaskSummary {
  return {
    id: row.id,
    status: row.status,
    prompt: row.prompt,
    createdAt: row.created_at,
    completedAt: row.completed_at,
  };
}

export function toTaskDetail(row: TaskRow): TaskDetail {
  return {
    ...toTaskSummary(row),
    originalUrl: toUrl(row.original_image),
    resultUrl: toUrl(row.result_image),
  };
}

export function toAdminTaskSummary(row: TaskRow): AdminTaskSummary {
  return {
    id: row.id,
    status: row.status,
    prompt: row.prompt,
    originalUrl: toUrl(row.original_image),
    resultUrl: toUrl(row.result_image),
    createdAt: row.created_at,
    completedAt: row.completed_at,
    handledBy: row.handled_by,
  };
}
