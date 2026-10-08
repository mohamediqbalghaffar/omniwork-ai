import { getDatabase } from './index';
import { PredictionFormula } from '../../shared/types';

export interface CacheEntry {
  cacheKey: string;
  cellAddress: string;
  contextHash: string;
  formulas: PredictionFormula[];
  createdAt: number;
  expiresAt: number;
}

export const cacheRepo = {
  set(
    cacheKey: string,
    cellAddress: string,
    contextHash: string,
    formulas: PredictionFormula[],
    ttlSeconds: number = 3600
  ): void {
    const db = getDatabase();
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = now + ttlSeconds;

    db.prepare(`
      INSERT INTO ai_cache (cache_key, cell_address, context_hash, formulas, created_at, expires_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(cache_key) DO UPDATE SET
        context_hash = excluded.context_hash,
        formulas = excluded.formulas,
        created_at = excluded.created_at,
        expires_at = excluded.expires_at
    `).run(
      cacheKey,
      cellAddress,
      contextHash,
      JSON.stringify(formulas),
      now,
      expiresAt
    );
  },

  get(cacheKey: string): PredictionFormula[] | null {
    const db = getDatabase();
    const now = Math.floor(Date.now() / 1000);
    const row = db.prepare(`
      SELECT formulas, expires_at 
      FROM ai_cache 
      WHERE cache_key = ? AND expires_at > ?
    `).get(cacheKey, now) as { formulas: string; expires_at: number } | undefined;

    if (!row) {
      return null;
    }

    try {
      return JSON.parse(row.formulas) as PredictionFormula[];
    } catch {
      return null;
    }
  },

  getByCell(cellAddress: string): PredictionFormula[] | null {
    const db = getDatabase();
    const now = Math.floor(Date.now() / 1000);
    const row = db.prepare(`
      SELECT formulas 
      FROM ai_cache 
      WHERE cell_address = ? AND expires_at > ?
      ORDER BY created_at DESC
      LIMIT 1
    `).get(cellAddress, now) as { formulas: string } | undefined;

    if (!row) return null;
    try {
      return JSON.parse(row.formulas);
    } catch {
      return null;
    }
  },

  purgeExpired(): void {
    const db = getDatabase();
    const now = Math.floor(Date.now() / 1000);
    db.prepare('DELETE FROM ai_cache WHERE expires_at <= ?').run(now);
  },

  clear(): void {
    const db = getDatabase();
    db.prepare('DELETE FROM ai_cache').run();
  }
};
