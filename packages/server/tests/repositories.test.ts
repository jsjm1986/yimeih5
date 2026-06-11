import { describe, it, expect } from 'vitest';
import { createDb } from '../src/db.js';

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
