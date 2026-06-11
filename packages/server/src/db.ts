import Database from 'better-sqlite3';

export type DB = Database.Database;

export function createDb(dbPath: string): DB {
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  initSchema(db);
  return db;
}

export function initSchema(db: DB): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      device_id TEXT NOT NULL,
      prompt TEXT NOT NULL,
      original_image TEXT,
      result_image TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at INTEGER NOT NULL,
      completed_at INTEGER,
      handled_by TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_tasks_device ON tasks(device_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status, created_at DESC);

    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}
