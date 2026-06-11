import { Router } from 'express';
import multer from 'multer';
import crypto from 'node:crypto';
import type { DB } from '../db.js';
import { MAX_IMAGE_BYTES, ALLOWED_MIME } from '../config.js';
import { insertTask, getTask, listTasksByDevice } from '../repositories/tasks.js';
import { saveImage } from '../services/storage.js';
import { toTaskDetail, toTaskSummary } from './mappers.js';

export function createTaskRoutes(db: DB, uploadsDir: string): Router {
  const router = Router();
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_IMAGE_BYTES },
  });

  router.post('/', upload.single('image'), (req, res) => {
    const file = req.file;
    const prompt = String(req.body.prompt ?? '').trim();
    const deviceId = String(req.body.deviceId ?? '').trim();
    if (!file) return void res.status(400).json({ error: 'image required' });
    if (!ALLOWED_MIME.has(file.mimetype))
      return void res.status(400).json({ error: 'unsupported image type' });
    if (!prompt) return void res.status(400).json({ error: 'prompt required' });
    if (!deviceId) return void res.status(400).json({ error: 'deviceId required' });

    const filename = saveImage(uploadsDir, file.buffer, file.mimetype);
    const id = crypto.randomUUID();
    const createdAt = Date.now();
    insertTask(db, { id, deviceId, prompt, originalImage: filename, createdAt });
    res.status(201).json({ id, status: 'pending', createdAt });
  });

  router.get('/', (req, res) => {
    const deviceId = String(req.query.deviceId ?? '').trim();
    if (!deviceId) return void res.status(400).json({ error: 'deviceId required' });
    res.json(listTasksByDevice(db, deviceId).map(toTaskSummary));
  });

  router.get('/:id', (req, res) => {
    const row = getTask(db, req.params.id);
    if (!row) return void res.status(404).json({ error: 'not found' });
    res.json(toTaskDetail(row));
  });

  return router;
}
