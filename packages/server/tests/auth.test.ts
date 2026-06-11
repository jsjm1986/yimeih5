import { describe, it, expect, vi } from 'vitest';
import { SessionStore } from '../src/services/auth.js';

describe('SessionStore', () => {
  it('create 返回 token，get 能取回会话', () => {
    const store = new SessionStore();
    const token = store.create(1, 'alice');
    expect(token).toMatch(/^[0-9a-f]{64}$/);
    expect(store.get(token)?.username).toBe('alice');
  });

  it('无效/空 token 返回 null', () => {
    const store = new SessionStore();
    expect(store.get(undefined)).toBeNull();
    expect(store.get('bogus')).toBeNull();
  });

  it('过期会话返回 null', () => {
    const store = new SessionStore();
    const token = store.create(1, 'alice');
    vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 13 * 60 * 60 * 1000);
    expect(store.get(token)).toBeNull();
    vi.restoreAllMocks();
  });

  it('destroy 后无法取回', () => {
    const store = new SessionStore();
    const token = store.create(1, 'alice');
    store.destroy(token);
    expect(store.get(token)).toBeNull();
  });
});
