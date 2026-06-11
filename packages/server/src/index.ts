import { createDb } from './db.js';
import { createApp } from './app.js';
import { runCleanup } from './services/cleanup.js';
import { ensureDir } from './services/storage.js';
import { DB_PATH, UPLOADS_DIR, DATA_DIR } from './config.js';

ensureDir(DATA_DIR);
ensureDir(UPLOADS_DIR);

const db = createDb(DB_PATH);
const app = createApp({ db, uploadsDir: UPLOADS_DIR });

const PORT = Number(process.env.PORT ?? 3000);
app.listen(PORT, () => console.log(`server listening on :${PORT}`));

function safeCleanup(): void {
  try {
    runCleanup(db, UPLOADS_DIR);
  } catch (err) {
    console.error('cleanup run failed:', (err as Error).message);
  }
}

// 启动时跑一次，之后每天跑一次
safeCleanup();
setInterval(safeCleanup, 24 * 60 * 60 * 1000).unref();
