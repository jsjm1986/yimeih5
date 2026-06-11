import type {
  AdminTaskSummary,
  LoginResponse,
  SettingsResponse,
  TaskStatus,
} from '@yimei/shared';

export class UnauthorizedError extends Error {
  constructor() {
    super('unauthorized');
    this.name = 'UnauthorizedError';
  }
}

let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(fn: (() => void) | null): void {
  onUnauthorized = fn;
}

async function asJson<T>(res: Response, treat401AsUnauthorized = true): Promise<T> {
  if (res.status === 401 && treat401AsUnauthorized) {
    onUnauthorized?.();
    throw new UnauthorizedError();
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `请求失败 (${res.status})`);
  }
  return res.json() as Promise<T>;
}

const opts = (extra: RequestInit = {}): RequestInit => ({ credentials: 'include', ...extra });

export async function login(username: string, password: string): Promise<LoginResponse> {
  return asJson<LoginResponse>(
    await fetch(
      '/api/admin/login',
      opts({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      }),
    ),
    false,
  );
}

export async function logout(): Promise<void> {
  await fetch('/api/admin/logout', opts({ method: 'POST' }));
}

export async function me(): Promise<LoginResponse> {
  return asJson<LoginResponse>(await fetch('/api/admin/me', opts()));
}

export async function fetchTasks(status?: TaskStatus): Promise<AdminTaskSummary[]> {
  const qs = status ? `?status=${encodeURIComponent(status)}` : '';
  return asJson<AdminTaskSummary[]>(await fetch(`/api/admin/tasks${qs}`, opts()));
}

export async function fetchTask(id: string): Promise<AdminTaskSummary> {
  return asJson<AdminTaskSummary>(
    await fetch(`/api/admin/tasks/${encodeURIComponent(id)}`, opts()),
  );
}

export async function uploadResult(id: string, image: File): Promise<AdminTaskSummary> {
  const fd = new FormData();
  fd.append('image', image);
  return asJson<AdminTaskSummary>(
    await fetch(`/api/admin/tasks/${encodeURIComponent(id)}/result`, opts({ method: 'POST', body: fd })),
  );
}

export async function getSettings(): Promise<SettingsResponse> {
  return asJson<SettingsResponse>(await fetch('/api/admin/settings', opts()));
}

export async function updateSettings(retentionDays: number): Promise<SettingsResponse> {
  return asJson<SettingsResponse>(
    await fetch(
      '/api/admin/settings',
      opts({
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ retentionDays }),
      }),
    ),
  );
}
