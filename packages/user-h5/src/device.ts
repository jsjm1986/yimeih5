const DEVICE_KEY = 'yimei_device_id';
const TASKS_KEY = 'yimei_task_ids';

export function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

export function getTaskIds(): string[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function addTaskId(id: string): void {
  const existing = getTaskIds().filter((x) => x !== id);
  const next = [id, ...existing];
  localStorage.setItem(TASKS_KEY, JSON.stringify(next));
}
