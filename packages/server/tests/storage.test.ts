import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { saveImage, deleteImage, ensureDir } from '../src/services/storage.js';

let dir: string;
beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'yimei-storage-'));
});
afterEach(() => {
  fs.rmSync(dir, { recursive: true, force: true });
});

describe('storage service', () => {
  it('保存图片返回随机文件名并落盘，扩展名按 mime', () => {
    const name = saveImage(dir, Buffer.from('hello'), 'image/png');
    expect(name).toMatch(/^[0-9a-f]{32}\.png$/);
    expect(fs.readFileSync(path.join(dir, name)).toString()).toBe('hello');
  });

  it('jpeg/webp 映射正确扩展名', () => {
    expect(saveImage(dir, Buffer.from('a'), 'image/jpeg')).toMatch(/\.jpg$/);
    expect(saveImage(dir, Buffer.from('a'), 'image/webp')).toMatch(/\.webp$/);
  });

  it('两次保存文件名不同', () => {
    const a = saveImage(dir, Buffer.from('a'), 'image/png');
    const b = saveImage(dir, Buffer.from('b'), 'image/png');
    expect(a).not.toBe(b);
  });

  it('删除已存在文件', () => {
    const name = saveImage(dir, Buffer.from('x'), 'image/png');
    deleteImage(dir, name);
    expect(fs.existsSync(path.join(dir, name))).toBe(false);
  });

  it('删除不存在文件不抛错', () => {
    expect(() => deleteImage(dir, 'nope.png')).not.toThrow();
  });

  it('ensureDir 递归创建', () => {
    const nested = path.join(dir, 'a', 'b');
    ensureDir(nested);
    expect(fs.existsSync(nested)).toBe(true);
  });
});
