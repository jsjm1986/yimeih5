import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createDb } from '../src/db.js';
import { createApp } from '../src/app.js';
import { SessionStore } from '../src/services/auth.js';
import { createAdmin } from '../src/repositories/admins.js';

export function makeTestApp() {
  const db = createDb(':memory:');
  const uploadsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yimei-app-'));
  const sessionStore = new SessionStore();
  const app = createApp({ db, uploadsDir, sessionStore });
  return { app, db, uploadsDir, sessionStore };
}

export function seedAdmin(db: ReturnType<typeof createDb>, username = 'alice', password = 'secret123') {
  createAdmin(db, username, password);
  return { username, password };
}

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
);
export { PNG };
