import { describe, it, expect } from 'vitest';
import { createDb } from '../src/db.js';
import { getRetentionDays, setRetentionDays } from '../src/repositories/settings.js';

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
