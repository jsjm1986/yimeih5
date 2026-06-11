import bcrypt from 'bcryptjs';
import type { DB } from '../db.js';

export interface AdminRow {
  id: number;
  username: string;
  password_hash: string;
  created_at: number;
}

export function createAdmin(db: DB, username: string, password: string): number {
  const hash = bcrypt.hashSync(password, 10);
  const info = db
    .prepare('INSERT INTO admins (username, password_hash, created_at) VALUES (?, ?, ?)')
    .run(username, hash, Date.now());
  return Number(info.lastInsertRowid);
}

export function findAdminByUsername(db: DB, username: string): AdminRow | undefined {
  return db.prepare('SELECT * FROM admins WHERE username = ?').get(username) as
    | AdminRow
    | undefined;
}

export function verifyAdmin(db: DB, username: string, password: string): AdminRow | null {
  const admin = findAdminByUsername(db, username);
  if (!admin) return null;
  return bcrypt.compareSync(password, admin.password_hash) ? admin : null;
}
