import { createDb } from '../db.js';
import { createAdmin } from '../repositories/admins.js';
import { DB_PATH, DATA_DIR } from '../config.js';
import { ensureDir } from '../services/storage.js';

const [username, password] = process.argv.slice(2);
if (!username || !password) {
  console.error('用法: npm run create-admin -- <username> <password>');
  process.exit(1);
}

ensureDir(DATA_DIR);
const db = createDb(DB_PATH);
try {
  const id = createAdmin(db, username, password);
  console.log(`已创建管理员 #${id}: ${username}`);
} catch (err) {
  console.error('创建失败:', (err as Error).message);
  process.exit(1);
}
