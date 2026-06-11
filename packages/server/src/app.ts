import express from 'express';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import type { DB } from './db.js';
import { SessionStore } from './services/auth.js';
import { createTaskRoutes } from './routes/tasks.js';
import { createAdminRoutes } from './routes/admin.js';
import { createUploadRoutes } from './routes/uploads.js';

export interface AppDeps {
  db: DB;
  uploadsDir: string;
  sessionStore?: SessionStore;
}

export function createApp(deps: AppDeps) {
  const sessionStore = deps.sessionStore ?? new SessionStore();
  const app = express();
  app.use(express.json());
  app.use(cookieParser());

  app.use('/api/tasks', createTaskRoutes(deps.db, deps.uploadsDir));
  app.use('/api/admin', createAdminRoutes(deps.db, deps.uploadsDir, sessionStore));
  app.use('/uploads', createUploadRoutes(deps.uploadsDir));

  // multer 与兜底错误处理
  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE')
        return void res.status(413).json({ error: 'image too large' });
      return void res.status(400).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: 'internal error' });
  });

  return app;
}
