import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { initDatabase, closeDatabase } from '../../src/main/database';
import { cacheRepo } from '../../src/main/database/cache.repo';
import { historyRepo } from '../../src/main/database/history.repo';
import { preferencesRepo } from '../../src/main/database/preferences.repo';
import * as path from 'path';
import * as fs from 'fs';

describe('AI Pipeline Integration', () => {
  const testDbPath = path.join(process.cwd(), 'test-pipeline.db');

  beforeEach(() => {
    if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
    initDatabase(testDbPath);
  });

  afterEach(() => {
    closeDatabase();
    if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
  });

  it('stores and retrieves cache entries for predicted cell formulas', () => {
    const cellAddress = 'D14';
    const contextHash = 'abc123hash';
    const cacheKey = `${cellAddress}:${contextHash}`;
    const formulas = [
      { description: 'Sum of Column D', formula: '=SUM(D1:D13)' },
      { description: 'Average of Column D', formula: '=AVERAGE(D1:D13)' },
    ];

    cacheRepo.set(cacheKey, cellAddress, contextHash, formulas, 3600);

    const retrieved = cacheRepo.get(cacheKey);
    expect(retrieved).not.toBeNull();
    expect(retrieved).toHaveLength(2);
    expect(retrieved![0].formula).toBe('=SUM(D1:D13)');
  });

  it('persists AI request history and marks formulas as applied', () => {
    const historyEntry = {
      id: 'req-uuid-123',
      cellAddress: 'C5',
      userText: 'difference between B and A',
      formula: '=B5-A5',
      sheetName: 'Sheet1',
      timestamp: Date.now(),
      wasApplied: false,
    };

    historyRepo.add(historyEntry);

    let entries = historyRepo.getAll();
    expect(entries).toHaveLength(1);
    expect(entries[0].wasApplied).toBe(false);

    historyRepo.markApplied('req-uuid-123');
    entries = historyRepo.getAll();
    expect(entries[0].wasApplied).toBe(true);
  });

  it('persists and retrieves user preferences across sessions', () => {
    preferencesRepo.set('language', 'ckb');
    preferencesRepo.set('theme', 'dark');

    expect(preferencesRepo.get('language')).toBe('ckb');
    expect(preferencesRepo.get('theme')).toBe('dark');

    const allPrefs = preferencesRepo.getAll();
    expect(allPrefs['language']).toBe('ckb');
  });
});
