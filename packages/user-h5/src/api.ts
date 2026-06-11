import type { CreateTaskResponse, TaskDetail, TaskSummary } from '@yimei/shared';

async function asJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `请求失败 (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export async function createTask(
  image: File,
  prompt: string,
  deviceId: string,
): Promise<CreateTaskResponse> {
  const fd = new FormData();
  fd.append('image', image);
  fd.append('prompt', prompt);
  fd.append('deviceId', deviceId);
  return asJson<CreateTaskResponse>(await fetch('/api/tasks', { method: 'POST', body: fd }));
}

export async function getTask(id: string): Promise<TaskDetail> {
  return asJson<TaskDetail>(await fetch(`/api/tasks/${encodeURIComponent(id)}`));
}

export async function listTasks(deviceId: string): Promise<TaskSummary[]> {
  return asJson<TaskSummary[]>(
    await fetch(`/api/tasks?deviceId=${encodeURIComponent(deviceId)}`),
  );
}
