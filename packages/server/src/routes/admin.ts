import { Router } from 'express';
import multer from 'multer';
import type { DB } from '../db.js';
import type { TaskStatus } from '@yimei/shared';
import { MAX_IMAGE_BYTES, ALLOWED_MIME, SESSION_TTL_MS, SESSION_COOKIE } from '../config.js';
import { verifyAdmin } from '../repositories/admins.js';
import { getTask, listTasksByStatus, listAllTasks, setTaskResult } from '../repositories/tasks.js';
import { getRetentionDays, setRetentionDays } from '../repositories/settings.js';
import { saveImage, deleteImage } from '../services/storage.js';
import type { SessionStore } from '../services/auth.js';
import { makeRequireAuth, type AuthedRequest } from '../middleware/requireAuth.js';
import { toAdminTaskSummary } from './mappers.js';

const VALID_STATUS: TaskStatus[] = ['pending', 'done', 'expired'];

export function createAdminRoutes(db: DB, uploadsDir: string, sessionStore: SessionStore): Router {
  const router = Router();
  const requireAuth = makeRequireAuth(sessionStore);
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_IMAGE_BYTES },
  });

  router.post('/login', (req, res) => {
    const { username, password } = req.body ?? {};
    if (!username || !password)
      return void res.status(400).json({ error: 'username and password required' });
    const admin = verifyAdmin(db, String(username), String(password));
    if (!admin) return void res.status(401).json({ error: 'invalid credentials' });
    const token = sessionStore.create(admin.id, admin.username);
    res.cookie(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: SESSION_TTL_MS,
    });
    res.json({ username: admin.username });
  });

  router.post('/logout', (req, res) => {
    sessionStore.destroy(req.cookies?.[SESSION_COOKIE]);
    res.clearCookie(SESSION_COOKIE);
    res.json({ ok: true });
  });

  router.get('/me', requireAuth, (req: AuthedRequest, res) => {
    res.json({ username: req.session!.username });
  });

  router.get('/tasks', requireAuth, (req, res) => {
    const status = req.query.status as TaskStatus | undefined;
    if (status && !VALID_STATUS.includes(status))
      return void res.status(400).json({ error: 'invalid status' });
    const rows = status ? listTasksByStatus(db, status) : listAllTasks(db);
    res.json(rows.map(toAdminTaskSummary));
  });

  router.get('/tasks/:id', requireAuth, (req, res) => {
    const row = getTask(db, req.params.id);
    if (!row) return void res.status(404).json({ error: 'not found' });
    res.json(toAdminTaskSummary(row));
  });

  router.post('/tasks/:id/result', requireAuth, upload.single('image'), (req: AuthedRequest, res) => {
    const file = req.file;
    if (!file) return void res.status(400).json({ error: 'image required' });
    if (!ALLOWED_MIME.has(file.mimetype))
      return void res.status(400).json({ error: 'unsupported image type' });
    const row = getTask(db, req.params.id);
    if (!row) return void res.status(404).json({ error: 'not found' });
    if (row.status === 'expired') return void res.status(409).json({ error: 'task expired' });
    if (row.result_image) deleteImage(uploadsDir, row.result_image);
    const filename = saveImage(uploadsDir, file.buffer, file.mimetype);
    setTaskResult(db, row.id, filename, req.session!.username, Date.now());
    res.json(toAdminTaskSummary(getTask(db, row.id)!));
  });

  router.get('/settings', requireAuth, (_req, res) => {
    res.json({ retentionDays: getRetentionDays(db) });
  });

  router.put('/settings', requireAuth, (req, res) => {
    const days = Number(req.body?.retentionDays);
    if (!Number.isInteger(days) || days < 1)
      return void res.status(400).json({ error: 'retentionDays must be a positive integer' });
    setRetentionDays(db, days);
    res.json({ retentionDays: days });
  });

  return router;
}
