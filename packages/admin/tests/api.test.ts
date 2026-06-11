import { describe, it, expect, vi } from 'vitest';
import { login, fetchTasks, UnauthorizedError, setUnauthorizedHandler } from '../src/api.js';

function mockFetch(status: number, body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response);
}

describe('admin api', () => {
  it('login 成功返回用户名', async () => {
    vi.stubGlobal('fetch', mockFetch(200, { username: 'alice' }));
    const res = await login('alice', 'pw');
    expect(res.username).toBe('alice');
  });

  it('login 凭证错误抛错', async () => {
    vi.stubGlobal('fetch', mockFetch(401, { error: 'invalid credentials' }));
    await expect(login('alice', 'bad')).rejects.toThrow('invalid credentials');
  });

  it('受保护接口 401 抛 UnauthorizedError', async () => {
    vi.stubGlobal('fetch', mockFetch(401, { error: 'unauthorized' }));
    await expect(fetchTasks()).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('fetchTasks 成功返回数组并带 credentials', async () => {
    const f = mockFetch(200, [{ id: 't1', status: 'pending' }]);
    vi.stubGlobal('fetch', f);
    const tasks = await fetchTasks('pending');
    expect(tasks).toHaveLength(1);
    expect(f).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/tasks?status=pending'),
      expect.objectContaining({ credentials: 'include' }),
    );
  });

  it('受保护接口 401 触发 unauthorized 处理器', async () => {
    vi.stubGlobal('fetch', mockFetch(401, { error: 'unauthorized' }));
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    await expect(fetchTasks()).rejects.toBeInstanceOf(UnauthorizedError);
    expect(handler).toHaveBeenCalledTimes(1);
    setUnauthorizedHandler(null);
  });
});
