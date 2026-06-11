import { Router } from 'express';
import express from 'express';

export function createUploadRoutes(uploadsDir: string): Router {
  const router = Router();
  router.use(express.static(uploadsDir, { index: false, dotfiles: 'deny' }));
  return router;
}
