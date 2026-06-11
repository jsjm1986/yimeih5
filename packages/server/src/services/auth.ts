import crypto from 'node:crypto';
import { SESSION_TTL_MS } from '../config.js';

export interface Session {
  adminId: number;
  username: string;
  expiresAt: number;
}

export class SessionStore {
  private sessions = new Map<string, Session>();

  create(adminId: number, username: string): string {
    const token = crypto.randomBytes(32).toString('hex');
    this.sessions.set(token, { adminId, username, expiresAt: Date.now() + SESSION_TTL_MS });
    return token;
  }

  get(token: string | undefined): Session | null {
    if (!token) return null;
    const s = this.sessions.get(token);
    if (!s) return null;
    if (s.expiresAt < Date.now()) {
      this.sessions.delete(token);
      return null;
    }
    return s;
  }

  destroy(token: string | undefined): void {
    if (token) this.sessions.delete(token);
  }
}
