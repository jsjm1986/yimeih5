import { describe, it, expect } from 'vitest';
import crypto from 'node:crypto';
import { createDb } from '../src/db.js';
import { getRetentionDays, setRetentionDays } from '../src/repositories/settings.js';
import { createAdmin, findAdminByUsername, verifyAdmin } from '../src/repositories/admins.js';
import {
  insertTask,
  getTask,
  listTasksByDevice,
  listTasksByStatus,
  listAllTasks,
  setTaskResult,
  listExpirableTasks,
  markExpired,
} from '../src/repositories/tasks.js';

describe('db schema', () => {
  it('创建 tasks/admins/settings 三张表', () => {
    const db = createDb(':memory:');
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
      .all()
      .map((r: any) => r.name);
    expect(tables).toContain('tasks');
    expect(tables).toContain('admins');
    expect(tables).toContain('settings');
  });
});

describe('settings repository', () => {
  it('无设置时返回默认 30 天', () => {
    const db = createDb(':memory:');
    expect(getRetentionDays(db)).toBe(30);
  });

  it('写入后能读回', () => {
    const db = createDb(':memory:');
    setRetentionDays(db, 7);
    expect(getRetentionDays(db)).toBe(7);
  });

  it('重复写入覆盖旧值', () => {
    const db = createDb(':memory:');
    setRetentionDays(db, 7);
    setRetentionDays(db, 14);
    expect(getRetentionDays(db)).toBe(14);
  });

  it('脏数据回退到默认值', () => {
    const db = createDb(':memory:');
    db.prepare("INSERT INTO settings (key, value) VALUES ('retention_days', 'abc')").run();
    expect(getRetentionDays(db)).toBe(30);
  });
});

describe('admins repository', () => {
  it('创建后能按用户名查到', () => {
    const db = createDb(':memory:');
    const id = createAdmin(db, 'alice', 'secret123');
    expect(id).toBeGreaterThan(0);
    const found = findAdminByUsername(db, 'alice');
    expect(found?.username).toBe('alice');
    expect(found?.password_hash).not.toBe('secret123'); // 已哈希
  });

  it('正确密码校验通过', () => {
    const db = createDb(':memory:');
    createAdmin(db, 'alice', 'secret123');
    expect(verifyAdmin(db, 'alice', 'secret123')?.username).toBe('alice');
  });

  it('错误密码校验失败', () => {
    const db = createDb(':memory:');
    createAdmin(db, 'alice', 'secret123');
    expect(verifyAdmin(db, 'alice', 'wrong')).toBeNull();
  });

  it('用户名不存在校验失败', () => {
    const db = createDb(':memory:');
    expect(verifyAdmin(db, 'ghost', 'x')).toBeNull();
  });

  it('用户名唯一，重复创建抛错', () => {
    const db = createDb(':memory:');
    createAdmin(db, 'alice', 'a');
    expect(() => createAdmin(db, 'alice', 'b')).toThrow();
  });
});

function seedTask(db: any, over: Partial<{ id: string; deviceId: string; prompt: string; createdAt: number }> = {}) {
  const t = {
    id: over.id ?? crypto.randomUUID(),
    deviceId: over.deviceId ?? 'dev-1',
    prompt: over.prompt ?? '瘦脸',
    originalImage: 'orig.jpg',
    createdAt: over.createdAt ?? Date.now(),
  };
  insertTask(db, t);
  return t.id;
}

describe('tasks repository', () => {
  it('插入后状态为 pending、可按 id 读回', () => {
    const db = createDb(':memory:');
    const id = seedTask(db);
    const row = getTask(db, id);
    expect(row?.status).toBe('pending');
    expect(row?.original_image).toBe('orig.jpg');
    expect(row?.result_image).toBeNull();
  });

  it('按设备查，倒序返回', () => {
    const db = createDb(':memory:');
    seedTask(db, { deviceId: 'dev-1', createdAt: 100 });
    const newer = seedTask(db, { deviceId: 'dev-1', createdAt: 200 });
    seedTask(db, { deviceId: 'dev-2', createdAt: 150 });
    const rows = listTasksByDevice(db, 'dev-1');
    expect(rows.map((r) => r.id)).toEqual([newer, expect.any(String)]);
    expect(rows).toHaveLength(2);
  });

  it('按状态筛选', () => {
    const db = createDb(':memory:');
    const a = seedTask(db);
    seedTask(db);
    setTaskResult(db, a, 'res.jpg', 'alice', Date.now());
    expect(listTasksByStatus(db, 'pending')).toHaveLength(1);
    expect(listTasksByStatus(db, 'done')).toHaveLength(1);
    expect(listAllTasks(db)).toHaveLength(2);
  });

  it('上传结果后状态变 done 并记录处理人/完成时间', () => {
    const db = createDb(':memory:');
    const id = seedTask(db);
    setTaskResult(db, id, 'res.jpg', 'alice', 999);
    const row = getTask(db, id)!;
    expect(row.status).toBe('done');
    expect(row.result_image).toBe('res.jpg');
    expect(row.handled_by).toBe('alice');
    expect(row.completed_at).toBe(999);
  });

  it('清理：找出早于 cutoff 且未过期的任务并标记 expired', () => {
    const db = createDb(':memory:');
    const old = seedTask(db, { createdAt: 1000 });
    seedTask(db, { createdAt: 5000 });
    const expirable = listExpirableTasks(db, 3000);
    expect(expirable.map((r) => r.id)).toEqual([old]);
    markExpired(db, old);
    const row = getTask(db, old)!;
    expect(row.status).toBe('expired');
    expect(row.original_image).toBeNull();
    expect(row.result_image).toBeNull();
    // 已 expired 的不再被选中
    expect(listExpirableTasks(db, 3000)).toHaveLength(0);
  });
});
