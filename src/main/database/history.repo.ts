import { getDatabase } from './index';
import { AIHistoryEntry, RecentFileEntry } from '../../shared/types';

export const historyRepo = {
  add(entry: AIHistoryEntry): void {
    const db = getDatabase();
    db.prepare(`
      INSERT INTO ai_history (id, cell_address, user_text, formula, sheet_name, file_path, was_applied, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      entry.id,
      entry.cellAddress,
      entry.userText,
      entry.formula,
      entry.sheetName || '',
      entry.filePath || '',
      entry.wasApplied ? 1 : 0,
      Math.floor(entry.timestamp / 1000)
    );
  },

  getAll(limit: number = 50): AIHistoryEntry[] {
    const db = getDatabase();
    const rows = db.prepare(`
      SELECT id, cell_address, user_text, formula, sheet_name, file_path, was_applied, created_at
      FROM ai_history
      ORDER BY created_at DESC
      LIMIT ?
    `).all(limit) as Array<{
      id: string;
      cell_address: string;
      user_text: string;
      formula: string;
      sheet_name: string;
      file_path: string;
      was_applied: number;
      created_at: number;
    }>;

    return rows.map((row) => ({
      id: row.id,
      cellAddress: row.cell_address,
      userText: row.user_text,
      formula: row.formula,
      sheetName: row.sheet_name,
      filePath: row.file_path,
      wasApplied: Boolean(row.was_applied),
      timestamp: row.created_at * 1000,
    }));
  },

  markApplied(id: string): void {
    const db = getDatabase();
    db.prepare('UPDATE ai_history SET was_applied = 1 WHERE id = ?').run(id);
  },

  clear(): void {
    const db = getDatabase();
    db.prepare('DELETE FROM ai_history').run();
  }
};

export const recentFilesRepo = {
  add(filePath: string, fileName: string): void {
    const db = getDatabase();
    db.prepare(`
      INSERT INTO recent_files (file_path, file_name, last_opened)
      VALUES (?, ?, strftime('%s', 'now'))
      ON CONFLICT(file_path) DO UPDATE SET file_name = excluded.file_name, last_opened = excluded.last_opened
    `).run(filePath, fileName);
  },

  getAll(limit: number = 10): RecentFileEntry[] {
    const db = getDatabase();
    const rows = db.prepare(`
      SELECT id, file_path, file_name, last_opened
      FROM recent_files
      ORDER BY last_opened DESC
      LIMIT ?
    `).all(limit) as Array<{
      id: number;
      file_path: string;
      file_name: string;
      last_opened: number;
    }>;

    return rows.map((row) => ({
      id: row.id,
      path: row.file_path,
      name: row.file_name,
      lastOpened: row.last_opened * 1000,
    }));
  },

  remove(filePath: string): void {
    const db = getDatabase();
    db.prepare('DELETE FROM recent_files WHERE file_path = ?').run(filePath);
  }
};
