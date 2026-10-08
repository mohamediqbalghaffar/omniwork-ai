-- User preferences (language, theme, etc.)
CREATE TABLE IF NOT EXISTS preferences (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Recent files
CREATE TABLE IF NOT EXISTS recent_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_path TEXT NOT NULL UNIQUE,
    file_name TEXT NOT NULL,
    last_opened INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- AI request history
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

-- AI response cache (for background pre-processing)
CREATE TABLE IF NOT EXISTS ai_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cache_key TEXT NOT NULL UNIQUE,
    cell_address TEXT NOT NULL,
    context_hash TEXT NOT NULL,
    formulas TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    expires_at INTEGER NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_recent_files_last_opened ON recent_files(last_opened DESC);
CREATE INDEX IF NOT EXISTS idx_ai_history_created ON ai_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_cache_key ON ai_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_ai_cache_expiry ON ai_cache(expires_at);

-- Default preferences
INSERT OR IGNORE INTO preferences (key, value) VALUES ('language', 'ckb');
INSERT OR IGNORE INTO preferences (key, value) VALUES ('theme', 'dark');
