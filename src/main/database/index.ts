import * as path from 'path';
import * as fs from 'fs';
import { app } from 'electron';
import { logger } from '../utils/logger';

export interface SqliteDb {
  exec: (sql: string) => void;
  prepare: (sql: string) => {
    run: (...params: any[]) => { changes: number; lastInsertRowid: number | bigint };
    get: (...params: any[]) => any;
    all: (...params: any[]) => any[];
  };
  close: () => void;
}

let dbInstance: SqliteDb | null = null;

export function getDatabasePath(): string {
  try {
    if (app && typeof app.getPath === 'function') {
      const userDataDir = app.getPath('userData');
      if (!fs.existsSync(userDataDir)) {
        fs.mkdirSync(userDataDir, { recursive: true });
      }
      return path.join(userDataDir, 'omniwork.db');
    }
  } catch {
    // In test or non-electron context
  }
  return path.join(process.cwd(), 'omniwork.db');
}

export function initDatabase(dbPath?: string): SqliteDb {
  if (dbInstance) {
    return dbInstance;
  }

  const targetPath = dbPath || getDatabasePath();
  logger.info(`Initializing database at: ${targetPath}`);

  // 1. Try Node's built-in DatabaseSync (Node 22+)
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { DatabaseSync } = require('node:sqlite');
    if (DatabaseSync) {
      const nativeDb = new DatabaseSync(targetPath);
      dbInstance = {
        exec: (sql: string) => nativeDb.exec(sql),
        prepare: (sql: string) => {
          const stmt = nativeDb.prepare(sql);
          return {
            run: (...params: any[]) => stmt.run(...params),
            get: (...params: any[]) => stmt.get(...params),
            all: (...params: any[]) => stmt.all(...params),
          };
        },
        close: () => nativeDb.close(),
      };
      setupSchema(dbInstance);
      return dbInstance;
    }
  } catch (err) {
    logger.info('node:sqlite not available, falling back to sql.js', err);
  }

  // 2. Fallback to sql.js if node:sqlite is unavailable
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const initSqlJs = require('sql.js');
    let buffer: Buffer | null = null;
    if (fs.existsSync(targetPath)) {
      buffer = fs.readFileSync(targetPath);
    }

    // sql.js is async to initialize WebAssembly
    let sqlDb: any = null;
    initSqlJs().then((SQL: any) => {
      sqlDb = buffer ? new SQL.Database(buffer) : new SQL.Database();
      setupSchema({
        exec: (sql: string) => sqlDb.run(sql),
        prepare: (sql: string) => {
          const stmt = sqlDb.prepare(sql);
          return {
            run: (...params: any[]) => {
              stmt.run(params);
              const data = sqlDb.export();
              fs.writeFileSync(targetPath, Buffer.from(data));
              return { changes: 1, lastInsertRowid: 1 };
            },
            get: (...params: any[]) => {
              stmt.bind(params);
              if (stmt.step()) return stmt.getAsObject();
              return undefined;
            },
            all: (...params: any[]) => {
              stmt.bind(params);
              const res: any[] = [];
              while (stmt.step()) res.push(stmt.getAsObject());
              return res;
            },
          };
        },
        close: () => {
          const data = sqlDb.export();
          fs.writeFileSync(targetPath, Buffer.from(data));
          sqlDb.close();
        },
      });
    });
  } catch (err) {
    logger.error('Failed to initialize fallback database', err);
  }

  // Fallback in-memory map store if all else fails
  if (!dbInstance) {
    dbInstance = createInMemoryFallback(targetPath);
    setupSchema(dbInstance);
  }

  return dbInstance;
}

function createInMemoryFallback(filePath: string): SqliteDb {
  const store: Record<string, any[]> = {
    preferences: [
      { key: 'language', value: 'ckb', updated_at: Math.floor(Date.now() / 1000) },
      { key: 'theme', value: 'dark', updated_at: Math.floor(Date.now() / 1000) },
    ],
    recent_files: [],
    ai_history: [],
    ai_cache: [],
  };

  return {
    exec: (_sql: string) => {},
    prepare: (sql: string) => {
      const lower = sql.toLowerCase();
      return {
        run: (...params: any[]) => {
          if (lower.includes('insert into preferences') || lower.includes('insert or replace into preferences')) {
            const [key, value] = params;
            const existing = store.preferences.find((p) => p.key === key);
            if (existing) {
              existing.value = value;
              existing.updated_at = Math.floor(Date.now() / 1000);
            } else {
              store.preferences.push({ key, value, updated_at: Math.floor(Date.now() / 1000) });
            }
          } else if (lower.includes('insert or replace into recent_files') || lower.includes('insert into recent_files')) {
            const [pathVal, nameVal] = params;
            store.recent_files = store.recent_files.filter((f) => f.file_path !== pathVal);
            store.recent_files.unshift({
              id: store.recent_files.length + 1,
              file_path: pathVal,
              file_name: nameVal,
              last_opened: Math.floor(Date.now() / 1000),
            });
          } else if (lower.includes('insert into ai_history')) {
            const [id, cell_address, user_text, formula, sheet_name, file_path, was_applied] = params;
            store.ai_history.unshift({
              id,
              cell_address,
              user_text,
              formula,
              sheet_name,
              file_path,
              was_applied: was_applied || 0,
              created_at: Math.floor(Date.now() / 1000),
            });
          } else if (lower.includes('insert or replace into ai_cache')) {
            const [cache_key, cell_address, context_hash, formulas, expires_at] = params;
            store.ai_cache = store.ai_cache.filter((c) => c.cache_key !== cache_key);
            store.ai_cache.push({
              id: store.ai_cache.length + 1,
              cache_key,
              cell_address,
              context_hash,
              formulas,
              created_at: Math.floor(Date.now() / 1000),
              expires_at,
            });
          }
          return { changes: 1, lastInsertRowid: 1 };
        },
        get: (...params: any[]) => {
          if (lower.includes('from preferences')) {
            const key = params[0];
            return store.preferences.find((p) => p.key === key);
          } else if (lower.includes('from ai_cache')) {
            const key = params[0];
            return store.ai_cache.find((c) => c.cache_key === key);
          }
          return undefined;
        },
        all: (..._params: any[]) => {
          if (lower.includes('from preferences')) {
            return store.preferences;
          } else if (lower.includes('from recent_files')) {
            return store.recent_files;
          } else if (lower.includes('from ai_history')) {
            return store.ai_history;
          } else if (lower.includes('from ai_cache')) {
            return store.ai_cache;
          }
          return [];
        },
      };
    },
    close: () => {},
  };
}

function setupSchema(db: SqliteDb) {
  const schemaSql = `
    CREATE TABLE IF NOT EXISTS preferences (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );
    CREATE TABLE IF NOT EXISTS recent_files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        file_path TEXT NOT NULL UNIQUE,
        file_name TEXT NOT NULL,
        last_opened INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );
    CREATE TABLE IF NOT EXISTS ai_history (
        id TEXT PRIMARY KEY,
        cell_address TEXT NOT NULL,
        user_text TEXT NOT NULL,
        formula TEXT NOT NULL,
        sheet_name TEXT,
        file_path TEXT,
        was_applied INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );
    CREATE TABLE IF NOT EXISTS ai_cache (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cache_key TEXT NOT NULL UNIQUE,
        cell_address TEXT NOT NULL,
        context_hash TEXT NOT NULL,
        formulas TEXT NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        expires_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_recent_files_last_opened ON recent_files(last_opened DESC);
    CREATE INDEX IF NOT EXISTS idx_ai_history_created ON ai_history(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_ai_cache_key ON ai_cache(cache_key);
    CREATE INDEX IF NOT EXISTS idx_ai_cache_expiry ON ai_cache(expires_at);
    INSERT OR IGNORE INTO preferences (key, value) VALUES ('language', 'ckb');
    INSERT OR IGNORE INTO preferences (key, value) VALUES ('theme', 'dark');
  `;
  try {
    db.exec(schemaSql);
  } catch (err) {
    logger.warn('Schema execution warning:', err);
  }
}

export function getDatabase(): SqliteDb {
  if (!dbInstance) {
    return initDatabase();
  }
  return dbInstance;
}

export function closeDatabase(): void {
  if (dbInstance) {
    try {
      dbInstance.close();
    } catch (err) {
      logger.error('Error closing database', err);
    }
    dbInstance = null;
  }
}
