import type { Request, Response, NextFunction } from 'express';
import type { SessionStore, Session } from '../services/auth.js';
import { SESSION_COOKIE } from '../config.js';

export interface AuthedRequest extends Request {
  session?: Session;
}

export function makeRequireAuth(store: SessionStore) {
  return (req: AuthedRequest, res: Response, next: NextFunction): void => {
    const token = (req.cookies?.[SESSION_COOKIE] as string | undefined) ?? undefined;
    const session = store.get(token);
    if (!session) {
      res.status(401).json({ error: 'unauthorized' });
      return;
    }
    req.session = session;
    next();
  };
}
