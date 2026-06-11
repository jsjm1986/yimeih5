import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { createDb } from '../src/db.js';
import { insertTask, getTask, setTaskResult } from '../src/repositories/tasks.js';
import { setRetentionDays } from '../src/repositories/settings.js';
import { runCleanup } from '../src/services/cleanup.js';

let dir: string;
beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'yimei-cleanup-'));
});
afterEach(() => {
  fs.rmSync(dir, { recursive: true, force: true });
});

function makeTaskWithFiles(db: any, createdAt: number) {
  const id = crypto.randomUUID();
  const orig = crypto.randomBytes(4).toString('hex') + '.png';
  fs.writeFileSync(path.join(dir, orig), 'o');
  insertTask(db, { id, deviceId: 'd', prompt: 'p', originalImage: orig, createdAt });
  return { id, orig };
}

describe('runCleanup', () => {
  it('删除超期任务的图片并标记 expired', () => {
    const db = createDb(':memory:');
    setRetentionDays(db, 1); // 1 天
    const now = 10 * 24 * 60 * 60 * 1000; // 第 10 天
    const oldTask = makeTaskWithFiles(db, now - 5 * 24 * 60 * 60 * 1000); // 5 天前 → 超期
    const freshTask = makeTaskWithFiles(db, now - 1000); // 刚才 → 保留

    const count = runCleanup(db, dir, now);
    expect(count).toBe(1);

    expect(fs.existsSync(path.join(dir, oldTask.orig))).toBe(false);
    expect(getTask(db, oldTask.id)!.status).toBe('expired');
    expect(getTask(db, oldTask.id)!.original_image).toBeNull();

    expect(fs.existsSync(path.join(dir, freshTask.orig))).toBe(true);
    expect(getTask(db, freshTask.id)!.status).toBe('pending');
  });

  it('同时删除原图与结果图', () => {
    const db = createDb(':memory:');
    setRetentionDays(db, 1);
    const now = 10 * 24 * 60 * 60 * 1000;
    const { id, orig } = makeTaskWithFiles(db, now - 5 * 24 * 60 * 60 * 1000);
    const result = crypto.randomBytes(4).toString('hex') + '.png';
    fs.writeFileSync(path.join(dir, result), 'r');
    setTaskResult(db, id, result, 'alice', now - 5 * 24 * 60 * 60 * 1000 + 100);

    runCleanup(db, dir, now);
    expect(fs.existsSync(path.join(dir, orig))).toBe(false);
    expect(fs.existsSync(path.join(dir, result))).toBe(false);
    expect(getTask(db, id)!.status).toBe('expired');
  });

  it('无超期任务返回 0', () => {
    const db = createDb(':memory:');
    setRetentionDays(db, 30);
    makeTaskWithFiles(db, Date.now());
    expect(runCleanup(db, dir, Date.now())).toBe(0);
  });
});
